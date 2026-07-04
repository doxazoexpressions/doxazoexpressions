// Native push helpers for Capacitor (iOS/Android). Safe to import on web —
// all Capacitor calls are wrapped so the web build gracefully no-ops.
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

export const isNativePush = () => Capacitor.isNativePlatform();
export const nativePlatformName = () => Capacitor.getPlatform();

export type NativePermState = 'granted' | 'denied' | 'prompt' | 'unsupported';
export type NativePushStatus = {
  permission: NativePermState;
  registered: boolean;
};

const NATIVE_PUSH_REGISTERED_KEY = 'doxazo:native-push-registered';

export function markNativePushRegistered(registered: boolean) {
  if (typeof window === 'undefined') return;
  try {
    if (registered) {
      window.localStorage.setItem(NATIVE_PUSH_REGISTERED_KEY, 'true');
    } else {
      window.localStorage.removeItem(NATIVE_PUSH_REGISTERED_KEY);
    }
  } catch {}
}

export function hasNativePushRegistration() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(NATIVE_PUSH_REGISTERED_KEY) === 'true';
  } catch {
    return false;
  }
}

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

export async function getNativePushStatus(): Promise<NativePushStatus> {
  const permission = await checkNativePermission();
  return {
    permission,
    registered: permission === 'granted' && hasNativePushRegistration(),
  };
}

function pushRegistrationErrorMessage(raw: unknown) {
  const message = typeof raw === 'string' ? raw : raw instanceof Error ? raw.message : 'Push registration failed';
  const platform = nativePlatformName();
  if (message.toLowerCase().includes('aps-environment')) {
    return 'This TestFlight build is missing the Apple Push Notifications entitlement. Install the next build after the iOS signing profile is regenerated with Push Notifications enabled.';
  }
  if (platform === 'android' && /firebase|fcm|google-services|SERVICE_NOT_AVAILABLE|MISSING_INSTANCEID_SERVICE/i.test(message)) {
    return 'Android push is not fully configured yet. Ensure google-services.json is in android/app/ and the Firebase project is linked, then rebuild the app.';
  }
  return message;
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
  if (perm.receive !== 'granted') {
    markNativePushRegistered(false);
    return perm.receive === 'denied' ? 'denied' : 'prompt';
  }

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
      markNativePushRegistered(false);
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
              markNativePushRegistered(false);
              return finish(() =>
                reject(new Error("You need to be signed in to enable notifications on this device."))
              );
            }
            const { error } = await supabase.functions.invoke("register-device-token", {
              body: { token: token.value, platform, device_info: { ua: navigator.userAgent } },
            });
            if (error) {
              markNativePushRegistered(false);
              return finish(() => reject(new Error(error.message || "Failed to save device token")));
            }
            markNativePushRegistered(true);
            finish(resolve);
          } catch (e: any) {
            markNativePushRegistered(false);
            finish(() => reject(e));
          }
        });
        errHandle = await PushNotifications.addListener("registrationError", (err) => {
          markNativePushRegistered(false);
          finish(() => reject(new Error(pushRegistrationErrorMessage(err?.error))));
        });
        await PushNotifications.register();
      } catch (e: any) {
        markNativePushRegistered(false);
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

