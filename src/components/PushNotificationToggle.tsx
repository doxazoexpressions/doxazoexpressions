import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Settings as SettingsIcon } from "lucide-react";
import {
  pushConfigured,
  isPushSupported,
  getCurrentSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push";
import {
  isNativePush,
  checkNativePermission,
  enableNativePush,
  getNativePushStatus,
  openNativeAppSettings,
  type NativePermState,
} from "@/lib/nativePush";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const PushNotificationToggle = () => {
  const { user } = useAuth();
  const native = isNativePush();

  // Web state
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  // Native state
  const [nativePerm, setNativePerm] = useState<NativePermState>("prompt");
  const [nativeRegistered, setNativeRegistered] = useState(false);

  const [busy, setBusy] = useState(false);
  const supported = isPushSupported();
  const configured = pushConfigured();

  useEffect(() => {
    if (native) {
      getNativePushStatus().then((status) => {
        setNativePerm(status.permission);
        setNativeRegistered(status.registered);
      });
    } else if (supported) {
      getCurrentSubscription().then((s) => setSubscribed(!!s));
    }
  }, [native, supported]);

  // ---------- NATIVE (iOS/Android app) ----------
  if (native) {
    const fullyRegistered = nativePerm === "granted" && nativeRegistered;
    const label =
      fullyRegistered
        ? "Notifications enabled"
        : nativePerm === "denied"
        ? "Notifications blocked in iPhone Settings"
        : nativePerm === "granted"
        ? "Permission granted — device registration needed"
        : "Enable daily notifications";

    const onEnable = async () => {
      setBusy(true);
      try {
        const result = await enableNativePush();
        const status = await getNativePushStatus();
        setNativePerm(status.permission === "unsupported" ? result : status.permission);
        setNativeRegistered(status.registered);
        if (result === "granted") {
          toast({
            title: "Notifications enabled",
            description: "You'll get a gentle nudge when a new devotional is published.",
          });
        } else if (result === "denied") {
          setNativeRegistered(false);
          toast({
            title: "Permission blocked",
            description: "Open Settings to allow notifications for Doxazo Expressions.",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        const latestPermission = await checkNativePermission();
        setNativePerm(latestPermission);
        setNativeRegistered(false);
        toast({
          title: "Couldn't enable notifications",
          description: err?.message ?? "Please try again.",
          variant: "destructive",
        });
      } finally {
        setBusy(false);
      }
    };

    return (
      <div className="space-y-3">
        <p className="text-sm">
          Status:{" "}
          <span
            className={
              fullyRegistered
                ? "text-accent"
                : nativePerm === "denied"
                ? "text-destructive"
                : "text-muted-foreground"
            }
          >
            {label}
          </span>
        </p>
        {fullyRegistered ? (
          <Button variant="outline" onClick={onEnable} disabled={busy} className="gap-2">
            <Bell className="w-4 h-4" />
            {busy ? "Registering…" : "Re-register this device"}
          </Button>
        ) : nativePerm === "denied" ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              To turn notifications back on, open <span className="font-medium">iPhone Settings → Doxazo Expressions → Notifications</span> and enable Allow Notifications.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                openNativeAppSettings();
                toast({
                  title: "Open iPhone Settings",
                  description: "Settings → Doxazo Expressions → Notifications → Allow Notifications.",
                });
              }}
              className="gap-2"
            >
              <SettingsIcon className="w-4 h-4" />
              How to enable
            </Button>
          </div>

        ) : (
          <Button onClick={onEnable} disabled={busy} className="gap-2">
            <Bell className="w-4 h-4" />
            {busy ? "Registering…" : nativePerm === "granted" ? "Register this device" : "Enable notifications"}
          </Button>
        )}
      </div>
    );
  }

  // ---------- WEB (browsers that support Web Push) ----------
  if (!supported) {
    return (
      <p className="text-sm text-muted-foreground">
        This browser doesn't support push notifications. Install the app from your home screen or
        use our iOS/Android app to receive daily notifications.
      </p>
    );
  }

  const onToggle = async () => {
    setBusy(true);
    try {
      if (subscribed) {
        await unsubscribeFromPush();
        setSubscribed(false);
        toast({ title: "Notifications turned off" });
      } else {
        if (!configured) {
          toast({
            title: "Notifications not configured yet",
            description: "Add the VAPID public key (VITE_VAPID_PUBLIC_KEY) to enable push.",
            variant: "destructive",
          });
          return;
        }
        await subscribeToPush(user?.id ?? null);
        setSubscribed(true);
        toast({
          title: "Notifications enabled",
          description: "You'll get a gentle nudge when a new devotional is published.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Couldn't update notifications",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={subscribed ? "outline" : "default"}
      onClick={onToggle}
      disabled={busy || subscribed === null}
      className="gap-2"
    >
      {subscribed ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
      {subscribed ? "Turn off daily notifications" : "Notify me each morning"}
    </Button>
  );
};

export default PushNotificationToggle;
