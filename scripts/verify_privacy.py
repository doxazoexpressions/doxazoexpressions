#!/usr/bin/env python3
"""
verify_privacy.py - fail-fast checker for PrivacyInfo.xcprivacy.

Apple's 2026 spec stores NSPrivacyAccessedAPITypes as an ARRAY OF DICTS,
each shaped:
    {
        "NSPrivacyAccessedAPIType":         "NSPrivacyAccessedAPICategoryFileTimestamp",
        "NSPrivacyAccessedAPITypeReasons":  ["C617.1"]
    }

Earlier drafts nested each reason as its own dict
({"NSPrivacyAccessedAPITypeReason": "C617.1"}); this script accepts both.

Exit codes:
  0 = all required (api, reason-code) pairs are present
  1 = missing file, malformed plist, or missing/wrong reason codes
"""
from __future__ import annotations

import plistlib
import sys
from pathlib import Path


REQUIRED: dict[str, set[str]] = {
    "NSPrivacyAccessedAPICategoryUserDefaults":    {"CA92D"},
    "NSPrivacyAccessedAPICategoryFileTimestamp":   {"C617.1"},
    "NSPrivacyAccessedAPICategoryDiskSpace":       {"E174.1"},
    "NSPrivacyAccessedAPICategorySystemBootTime":  {"35F9.1"},
}


def parse_manifest(path: Path) -> dict[str, set[str]]:
    """Parse the manifest into {api_category: set(reason_codes)}."""
    with path.open("rb") as fh:
        pl = plistlib.load(fh)

    if not isinstance(pl, dict):
        raise SystemExit(
            f"{path}: top-level must be a dict (got {type(pl).__name__})."
        )

    tracking = pl.get("NSPrivacyTracking", False)
    if tracking is True:
        raise SystemExit(
            f"{path}: NSPrivacyTracking must be False (Apple Guideline 5.1.1(i))."
        )

    raw = pl.get("NSPrivacyAccessedAPITypes", [])
    if not isinstance(raw, list):
        # Defensive: if some tool ever serialised it as a dict, normalise here too.
        if isinstance(raw, dict):
            raw = [{"NSPrivacyAccessedAPIType": k,
                    "NSPrivacyAccessedAPITypeReasons": v} for k, v in raw.items()]
        else:
            raise SystemExit(
                f"{path}: NSPrivacyAccessedAPITypes must be an array of dicts, "
                f"got {type(raw).__name__}."
            )

    out: dict[str, set[str]] = {}
    for i, entry in enumerate(raw):
        if not isinstance(entry, dict):
            raise SystemExit(
                f"{path}: NSPrivacyAccessedAPITypes[{i}] is not a dict."
            )
        api = entry.get("NSPrivacyAccessedAPIType")
        if not isinstance(api, str):
            raise SystemExit(
                f"{path}: NSPrivacyAccessedAPITypes[{i}] missing NSPrivacyAccessedAPIType."
            )
        codes_raw = entry.get("NSPrivacyAccessedAPITypeReasons", [])
        if not isinstance(codes_raw, list):
            raise SystemExit(
                f"{path}: NSPrivacyAccessedAPITypes[{i}].NSPrivacyAccessedAPITypeReasons "
                f"must be a list, got {type(codes_raw).__name__}."
            )
        codes: set[str] = set()
        for code in codes_raw:
            if isinstance(code, str):
                codes.add(code)
            elif isinstance(code, dict):
                inner = code.get("NSPrivacyAccessedAPITypeReason")
                if isinstance(inner, str):
                    codes.add(inner)
                else:
                    raise SystemExit(
                        f"{path}: NSPrivacyAccessedAPITypes[{i}] has nested reason "
                        f"without NSPrivacyAccessedAPITypeReason string."
                    )
            else:
                raise SystemExit(
                    f"{path}: NSPrivacyAccessedAPITypes[{i}] reason entry has unexpected "
                    f"type {type(code).__name__}."
                )
        out[api] = codes
    return out


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("Usage: verify_privacy.py <PrivacyInfo.xcprivacy>", file=sys.stderr)
        return 1
    path = Path(argv[1])
    if not path.exists():
        print(f"FAIL: {path} not found.", file=sys.stderr)
        return 1

    try:
        reasons = parse_manifest(path)
    except SystemExit as e:
        print(f"FAIL: {e}", file=sys.stderr)
        return 1

    print(f"Loaded manifest: {path}")
    print(f"NSPrivacyTracking=False OK")
    print(f"Categories declared: {sorted(reasons.keys()) or '(none)'}")

    missing: list[tuple[str, list[str], list[str]]] = []
    for api, expected in REQUIRED.items():
        declared = reasons.get(api, set())
        if not (declared & expected):
            missing.append((api, sorted(declared), sorted(expected)))

    if missing:
        print("\nFAIL: missing or wrong reason codes:", file=sys.stderr)
        for api, decl, exp in missing:
            print(f"  - {api}: declared={decl}  expected_one_of={exp}", file=sys.stderr)
        return 1

    if not reasons:
        print(
            "WARN: NSPrivacyAccessedAPITypes is empty. Apple will reject if any "
            "Required Reason API is actually called by the app (Capacitor + Sign in "
            "with Apple definitely do).",
            file=sys.stderr,
        )

    print("PASS: PrivacyInfo.xcprivacy satisfies required reason codes for "
          "Capacitor + Sign in with Apple.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
