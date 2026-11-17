# Follow-up
- [x] Unlock only Archive and retain its signed-out signup invitation.
- [ ] Verify email confirmation and four saved personal features for doxazoexpressions+signup-test-20261117@gmail.com. Signup and profile creation passed; unconfirmed sign-in is correctly blocked. Waiting for the user to open the confirmation email; no personal-feature writes or account deletion yet.
- [x] Add and verify admin-only storage backup download links (340 files; admin download and signed-in non-admin rejection verified).
- [x] Assess shared OAuth return-path fix: skipped because the existing web helper owns the state value and the callback uses a fixed production origin; safe cross-origin/native return handling is not a small state-only change.