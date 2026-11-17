
- Personal-feature pages are wrapped in RequireAuth in App.tsx on web and native; Archive and devotional reading stay public. Why: general reading does not require an account, while personal tools do.
- Storage backup links are issued only by a JWT-validated backend function with a has_role admin check and a fixed bucket allowlist. Why: private recordings must never be exposed by client-only role checks.
