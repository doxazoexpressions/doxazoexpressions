// Native push helpers for Capacitor (iOS/Android). Safe to import on web —
// all Capacitor calls are wrapped so the web build gracefully no-ops.
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

export const isNativePush = () => Capacitor.isNativePlatform();
export const nativePlatformName = () => Capacitor.getPlatform();

export type NativePermState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export async function checkNativePermission(): Promise<NativePermState> {
  if (!isNativePush()) return 'unsupported';
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const p = await PushNotifications.checkPermissions();
    if (p.receive === 'granted') return 'granted';
    if (p.receive === 'denied') return 'denied';
    return 'prompt';
  } catch {
    return 'unsupported';
  }
}

/**
 * Request permission (if needed), register with APNs/FCM, and upload the
 * resulting device token to the backend. Resolves once a token is uploaded
 * or rejects with an error suitable for surfacing to the user.
 */
export async function enableNativePush(): Promise<NativePermState> {
  if (!isNativePush()) throw new Error('Native push not available');
  const { PushNotifications } = await import('@capacitor/push-notifications');

  let perm = await PushNotifications.checkPermissions();
  if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
    perm = await PushNotifications.requestPermissions();
  }
  if (perm.receive !== 'granted') return perm.receive === 'denied' ? 'denied' : 'prompt';

  // Register (idempotent). Wait for the registration event to upload token.
  await new Promise<void>(async (resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Registration timed out')), 15000);
    const handle = await PushNotifications.addListener('registration', async (token) => {
      clearTimeout(timeout);
      try {
        const platform = nativePlatformName() === 'ios' ? 'ios' : 'android';
        const { error } = await supabase.functions.invoke('register-device-token', {
          body: { token: token.value, platform, device_info: { ua: navigator.userAgent } },
        });
        if (error) return reject(new Error(error.message || 'Failed to save device token'));
        resolve();
      } catch (e: any) {
        reject(e);
      } finally {
        handle.remove();
      }
    });
    const errHandle = await PushNotifications.addListener('registrationError', (err) => {
      clearTimeout(timeout);
      errHandle.remove();
      reject(new Error(err?.error || 'Push registration failed'));
    });
    try {
      await PushNotifications.register();
    } catch (e: any) {
      clearTimeout(timeout);
      reject(e);
    }
  });

  return 'granted';
}

/** Open the native app settings so the user can toggle notification permission. */
export async function openNativeAppSettings() {
  // The Capacitor App plugin doesn't expose a cross-platform "open settings"
  // API, and we intentionally don't bundle an extra native-settings plugin
  // (would require a rebuild + resync). The Settings UI copy tells the user
  // to open iPhone Settings → Doxazo Expressions → Notifications manually.
  return;
}

