import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const LS_KEY = "doxazo.favorites";

function readLocal(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeLocal(ids: string[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

/**
 * Favorites work for both anonymous + logged-in visitors.
 * - Anonymous: stored in localStorage only.
 * - Logged-in: stored in the `favorites` table; on first login any local
 *   favorites are merged into the user's account.
 */
export function useFavorites() {
  const { user, loading: authLoading } = useAuth();
  const [ids, setIds] = useState<string[]>(() => readLocal());
  const [loading, setLoading] = useState<boolean>(false);

  // Load from Supabase + merge localStorage on auth
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIds(readLocal());
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const local = readLocal();
      const { data } = await supabase
        .from("favorites")
        .select("devotional_id")
        .eq("user_id", user.id);
      const remote = (data ?? []).map((r) => r.devotional_id);
      const merged = Array.from(new Set([...remote, ...local]));
      // Sync any local-only favorites up to the server
      const toUpload = local.filter((id) => !remote.includes(id));
      if (toUpload.length > 0) {
        await supabase
          .from("favorites")
          .upsert(
            toUpload.map((devotional_id) => ({ user_id: user.id, devotional_id })),
            { onConflict: "user_id,devotional_id", ignoreDuplicates: true }
          );
      }
      if (!cancelled) {
        setIds(merged);
        writeLocal(merged);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    async (id: string) => {
      const exists = ids.includes(id);
      const next = exists ? ids.filter((x) => x !== id) : [...ids, id];
      setIds(next);
      writeLocal(next);
      if (user) {
        if (exists) {
          await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("devotional_id", id);
        } else {
          await supabase
            .from("favorites")
            .upsert(
              { user_id: user.id, devotional_id: id },
              { onConflict: "user_id,devotional_id", ignoreDuplicates: true }
            );
        }
      }
      return !exists;
    },
    [ids, user]
  );

  return { ids, isFavorite, toggle, loading };
}
