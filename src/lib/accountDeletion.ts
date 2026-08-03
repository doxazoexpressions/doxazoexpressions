import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";

export class AccountDeletionError extends Error {
  cause: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "AccountDeletionError";
    this.cause = cause;
  }
}

/**
 * Apple Guideline 5.1.1(v) — in-app, user-initiated permanent account deletion.
 *
 * The deletion runs in the `delete-account` edge function, which:
 *  - validates the caller's JWT (no user id is accepted from the client),
 *  - purges user-owned rows and deletes the auth user (all user-data tables have
 *    ON DELETE CASCADE foreign keys to the auth user),
 *  - revokes all sessions / refresh tokens and linked provider identities.
 *
 * No service-role key or admin SDK is ever used on the client.
 */
export async function deleteOwnAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke("delete-account");
  if (error) {
    throw new AccountDeletionError(
      "We couldn't delete your account. Please try again, or email support@doxazoexpressions.com to request manual deletion.",
      error,
    );
  }
  track("auth_signout", { method: "account_deleted" });
  await supabase.auth.signOut();
}

export const DELETE_CONFIRM_PHRASE = "DELETE";

export const isDeleteConfirmed = (value: string) =>
  value.trim().toUpperCase() === DELETE_CONFIRM_PHRASE;
