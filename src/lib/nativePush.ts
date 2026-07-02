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

  // Attach BOTH listeners before calling register(), so we never miss the
  // native callback (registration can fire almost immediately on iOS when
  // the app is already registered with APNs).
  await new Promise<void>((resolve, reject) => {
    let settled = false;
    let regHandle: { remove: () => void } | null = null;
    let errHandle: { remove: () => void } | null = null;

    const cleanup = () => {
      try { regHandle?.remove(); } catch {}
      try { errHandle?.remove(); } catch {}
    };
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      cleanup();
      fn();
    };

    const timeout = setTimeout(() => {
      finish(() =>
        reject(
          new Error(
            "Timed out waiting for the device token from Apple. Check your internet connection and try again — if this keeps happening, iOS didn't hand back an APNs token (usually a provisioning/entitlement issue)."
          )
        )
      );
    }, 30000);

    (async () => {
      try {
        regHandle = await PushNotifications.addListener("registration", async (token) => {
          try {
            const platform = nativePlatformName() === "ios" ? "ios" : "android";
            const { data: sess } = await supabase.auth.getSession();
            if (!sess?.session) {
              return finish(() =>
                reject(new Error("You need to be signed in to enable notifications on this device."))
              );
            }
            const { error } = await supabase.functions.invoke("register-device-token", {
              body: { token: token.value, platform, device_info: { ua: navigator.userAgent } },
            });
            if (error) return finish(() => reject(new Error(error.message || "Failed to save device token")));
            finish(resolve);
          } catch (e: any) {
            finish(() => reject(e));
          }
        });
        errHandle = await PushNotifications.addListener("registrationError", (err) => {
          finish(() => reject(new Error(err?.error || "Push registration failed")));
        });
        await PushNotifications.register();
      } catch (e: any) {
        finish(() => reject(e));
      }
    })();
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

