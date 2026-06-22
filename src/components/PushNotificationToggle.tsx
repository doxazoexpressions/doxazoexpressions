import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import {
  pushConfigured,
  isPushSupported,
  getCurrentSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const PushNotificationToggle = () => {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const supported = isPushSupported();
  const configured = pushConfigured();

  useEffect(() => {
    if (!supported) return;
    getCurrentSubscription().then((s) => setSubscribed(!!s));
  }, [supported]);

  if (!supported) {
    return (
      <p className="text-sm text-muted-foreground">
        Your browser doesn't support push notifications.
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
