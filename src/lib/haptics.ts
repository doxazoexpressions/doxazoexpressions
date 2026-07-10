// Subtle haptics wrapper. Uses Capacitor on native, Web Vibration on Android web,
// silently no-ops elsewhere. Respects prefers-reduced-motion.
import { isNative } from "@/lib/native";

function reducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export async function hapticLight() {
  if (reducedMotion()) return;
  if (isNative()) {
    try {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
      await Haptics.impact({ style: ImpactStyle.Light });
      return;
    } catch {}
  }
  try { navigator.vibrate?.(8); } catch {}
}

export async function hapticSuccess() {
  if (reducedMotion()) return;
  if (isNative()) {
    try {
      const { Haptics, NotificationType } = await import("@capacitor/haptics");
      await Haptics.notification({ type: NotificationType.Success });
      return;
    } catch {}
  }
  try { navigator.vibrate?.([10, 40, 10]); } catch {}
}
