import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import { deleteAllAudioObjectsForUser } from "@/lib/audioJournal";


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
  // 1. NEW STEP — revoke the Sign in with Apple token FIRST, before any data delete.
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) {
    throw new AccountDeletionError("You need to be signed in to delete your account.");
  }

  const { data: revokeResult, error: revokeError } = await supabase.functions.invoke(
    "apple-revoke-on-delete",
    { body: { user_id: userId } },
  );

  if (revokeError) {
    throw new AccountDeletionError(
      "Apple revocation request failed: " + revokeError.message,
      revokeError,
    );
  }

  // Edge function returns one of:
  //  - { skipped: true }                            → no Apple identity, proceed
  //  - { ok: true }                                 → Apple accepted, proceed
  //  - { ok: false, reason: "apple-invalid-grant" } → token already gone, proceed
  //  - any other { ok: false, reason: ... }         → ABORT
  if (revokeResult && revokeResult.ok === false && revokeResult.reason !== "apple-invalid-grant") {
    throw new AccountDeletionError(
      `Apple revocation failed before account deletion could proceed (reason: ${revokeResult.reason ?? "unknown"}). Please try again.`,
    );
  }

  // 1b. Delete all of this user's audio-journal storage objects before the auth.users delete cascades.
  const audioObjectsRemoved = await deleteAllAudioObjectsForUser(userId);
  console.info(`[account-deletion] journal-audio-cleanup: removed ${audioObjectsRemoved} audio object(s)`);

  // 2. EXISTING step — cascade-delete the auth user (unchanged).
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
