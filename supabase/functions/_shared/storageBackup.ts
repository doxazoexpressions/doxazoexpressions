export const BACKUP_BUCKETS = ["devotional-audio", "prayers", "audio-journal"] as const;
export const BACKUP_LINK_SECONDS = 3600;

type RoleClient = {
  auth: { getUser: (token: string) => Promise<{ data: { user: { id: string } | null }; error: unknown }> };
  rpc: (name: string, args: { _user_id: string; _role: string }) => PromiseLike<{ data: unknown; error: unknown }>;
};

export async function canExportStorage(client: RoleClient, token: string): Promise<boolean> {
  if (!token) return false;
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return false;
  const result = await client.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
  return !result.error && result.data === true;
}