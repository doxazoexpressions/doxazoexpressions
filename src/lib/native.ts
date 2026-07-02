// Native-runtime bridges. All imports are dynamic so the web build is unaffected.
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { markNativePushRegistered } from '@/lib/nativePush';

export const isNative = () => Capacitor.isNativePlatform();
export const nativePlatform = () => Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

/**
 * Initialize native-only behavior: status bar, splash hide, deep-link routing,
 * and push notification registration. Safe to call on web (no-op).
 */
export async function initNative(navigate: (path: string) => void) {
  if (!isNative()) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    if (nativePlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#0f1a2b' });
    }
  } catch {}

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch {}

  // Deep links: doxazo://devotional/<id> or https://doxazoexpressions.com/devotional/<id>
  try {
    const { App } = await import('@capacitor/app');
    App.addListener('appUrlOpen', ({ url }) => {
      try {
        const u = new URL(url);
        const path = u.pathname || '/';
        navigate(path + (u.search || ''));
      } catch {
        // doxazo://devotional/123 -> parse manually
        const m = url.match(/doxazo:\/\/(.+)$/);
        if (m) navigate('/' + m[1]);
      }
    });
  } catch {}

  // Native push: when permission is already granted, register with APNs/FCM and
  // upload the token. The Settings screen owns first-time permission prompts.
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const perm = await PushNotifications.checkPermissions();
    if (perm.receive !== 'granted') {
      return;
    }
    PushNotifications.addListener('registration', async (token) => {
      try {
        const platform = nativePlatform() === 'ios' ? 'ios' : 'android';
        const { data: sess } = await supabase.auth.getSession();
        if (!sess?.session) return;
        const { error } = await supabase.functions.invoke('register-device-token', {
          body: {
            token: token.value,
            platform,
            device_info: { ua: navigator.userAgent },
          },
        });
        if (error) {
          markNativePushRegistered(false);
          console.error('[native] register-device-token failed', error);
          return;
        }
        markNativePushRegistered(true);
      } catch (e) {
        markNativePushRegistered(false);
        console.error('[native] token upload error', e);
      }
    });
    PushNotifications.addListener('registrationError', (err) => {
      markNativePushRegistered(false);
      console.error('[native] push registration error', err);
    });
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const data = action.notification.data || {};
      const path = (data as any).path || '/devotional';
      navigate(path);
    });
    await PushNotifications.register();
  } catch {}
}

/** Use the native share sheet on device, fall back to Web Share API on web. */
export async function shareNative(opts: { title?: string; text?: string; url?: string }) {
  if (isNative()) {
    const { Share } = await import('@capacitor/share');
    await Share.share(opts);
    return;
  }
  if (typeof navigator !== 'undefined' && (navigator as any).share) {
    await (navigator as any).share(opts);
  }
}
