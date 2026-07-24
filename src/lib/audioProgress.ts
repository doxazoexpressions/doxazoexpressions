// Per-devotional audio continuity: playback position + narrator memory.
// Purely local (survives across sessions on device); nothing shipped to web
// server. Enables "resume listening" on the native home.
import type { VoiceKind } from "@/lib/devotionalAudio";

const POS_KEY = "doxazo.audio.pos.v1";
const VOICE_KEY = "doxazo.audio.voice.v1";
const LAST_KEY = "doxazo.audio.last.v1";

type PosMap = Record<string, { position: number; duration: number; updatedAt: number }>;
type VoiceMap = Record<string, VoiceKind>;

export type LastListened = {
  devotionalId: string;
  title: string;
  slug: string | null;
  scripture_reference: string | null;
  position: number;
  duration: number;
  voice: VoiceKind;
  updatedAt: number;
};

function readPos(): PosMap {
  try { return JSON.parse(localStorage.getItem(POS_KEY) || "{}"); } catch { return {}; }
}
function writePos(m: PosMap) { try { localStorage.setItem(POS_KEY, JSON.stringify(m)); } catch {} }
function readVoiceMap(): VoiceMap {
  try { return JSON.parse(localStorage.getItem(VOICE_KEY) || "{}"); } catch { return {}; }
}
function writeVoiceMap(m: VoiceMap) { try { localStorage.setItem(VOICE_KEY, JSON.stringify(m)); } catch {} }

export function getAudioProgress(devotionalId: string) {
  return readPos()[devotionalId] ?? null;
}

export function saveAudioProgress(devotionalId: string, position: number, duration: number) {
  if (!devotionalId || !Number.isFinite(position) || position < 5) return;
  const map = readPos();
  map[devotionalId] = { position: Math.floor(position), duration: Math.floor(duration || 0), updatedAt: Date.now() };
  writePos(map);
}

export function clearAudioProgress(devotionalId: string) {
  const map = readPos();
  if (map[devotionalId]) { delete map[devotionalId]; writePos(map); }
}

export function getVoiceForDevotional(devotionalId: string): VoiceKind | null {
  return readVoiceMap()[devotionalId] ?? null;
}
export function setVoiceForDevotional(devotionalId: string, voice: VoiceKind) {
  const m = readVoiceMap();
  m[devotionalId] = voice;
  writeVoiceMap(m);
}

export function setLastListened(entry: LastListened) {
  try { localStorage.setItem(LAST_KEY, JSON.stringify(entry)); } catch {}
}
export function getLastListened(): LastListened | null {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    return raw ? (JSON.parse(raw) as LastListened) : null;
  } catch { return null; }
}
export function clearLastListened() { try { localStorage.removeItem(LAST_KEY); } catch {} }
