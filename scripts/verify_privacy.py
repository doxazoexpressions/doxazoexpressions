#!/usr/bin/env python3
"""
verify_privacy.py - fail-fast checker for PrivacyInfo.xcprivacy.

NSPrivacyAccessedAPITypes is an array of dicts:
    {
        "NSPrivacyAccessedAPIType":         "NSPrivacyAccessedAPICategoryFileTimestamp",
        "NSPrivacyAccessedAPITypeReasons":  ["C617.1"]
    }

Exit codes:
  0 = all required (api, reason-code) pairs are present
  1 = missing file, malformed plist, or missing/wrong reason codes

Reason codes verified against developer.apple.com, 2026-07-31.
"""
from __future__ import annotations

import plistlib
import sys
from pathlib import Path


# Only categories Doxazo can actually justify are required. SystemBootTime and
# DiskSpace are intentionally NOT declared: no native or JS code reads
# ProcessInfo.systemUptime / kern.boottime or NSFileSystemFreeSize.
REQUIRED: dict[str, set[str]] = {
    "NSPrivacyAccessedAPICategoryUserDefaults":    {"CA92.1", "1C8F.1", "C56D.1", "AC6B.1"},
    "NSPrivacyAccessedAPICategoryFileTimestamp":   {"DDA9.1", "C617.1", "3B52.1", "0A2A.1"},
}



def parse_manifest(path: Path) -> dict[str, set[str]]:
    with path.open("rb") as fh:
        pl = plistlib.load(fh)
    if not isinstance(pl, dict):
        raise SystemExit(f"{path}: top-level must be a dict (got {type(pl).__name__}).")
    if pl.get("NSPrivacyTracking") is True:
        raise SystemExit(f"{path}: NSPrivacyTracking must be False.")
    raw = pl.get("NSPrivacyAccessedAPITypes", [])
    if not isinstance(raw, list):
        raise SystemExit(
            f"{path}: NSPrivacyAccessedAPITypes must be an ARRAY of dicts, "
            f"got {type(raw).__name__}."
        )
    out: dict[str, set[str]] = {}
    for i, entry in enumerate(raw):
        if not isinstance(entry, dict):
            raise SystemExit(f"{path}: NSPrivacyAccessedAPITypes[{i}] is not a dict.")
        api = entry.get("NSPrivacyAccessedAPIType")
        if not isinstance(api, str) or not api:
            raise SystemExit(f"{path}: NSPrivacyAccessedAPITypes[{i}] missing NSPrivacyAccessedAPIType.")
        codes_raw = entry.get("NSPrivacyAccessedAPITypeReasons", [])
        if not isinstance(codes_raw, list):
            raise SystemExit(f"{path}: NSPrivacyAccessedAPITypes[{i}].NSPrivacyAccessedAPITypeReasons must be a list.")
        codes: set[str] = set()
        for code in codes_raw:
            if isinstance(code, str):
                codes.add(code)
            elif isinstance(code, dict):
                inner = code.get("NSPrivacyAccessedAPITypeReason")
                if isinstance(inner, str):
                    codes.add(inner)
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
    for api, valid in REQUIRED.items():
        declared = reasons.get(api, set())
        if not (declared & valid):
            missing.append((api, sorted(declared), sorted(valid)))
    if missing:
        print("\nFAIL: missing or invalid reason codes:", file=sys.stderr)
        for api, decl, val in missing:
            print(f"  - {api}: declared={decl}  valid_options={val}", file=sys.stderr)
        return 1
    print("PASS: PrivacyInfo.xcprivacy satisfies required reason codes for "
          "Capacitor + Sign in with Apple.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
