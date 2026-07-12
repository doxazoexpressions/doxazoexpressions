import { useMemo } from "react";

/**
 * Doxazo devotional body formatter.
 * - Strips markdown bold/italics so bold becomes an editorial choice, not a writer choice.
 * - Normalizes whitespace and collapses excessive blank lines.
 * - Joins soft line breaks within a paragraph; preserves intentional paragraph breaks.
 * - Rebalances paragraphs toward 2–4 sentences where possible.
 * - Renders a short final paragraph as a centered italic closing line.
 * - Applies bold to a single detected turning-point / emphasis sentence.
 */

type Variant = "compact" | "full";

export interface DevotionalBodyProps {
  body: string;
  variant?: Variant;
  className?: string;
}

function stripInlineMarkup(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(^|[^*])\*(?!\s)([^*\n]+?)\*(?!\*)/g, "$1$2")
    .replace(/(^|[^_])_(?!\s)([^_\n]+?)_(?!_)/g, "$1$2");
}

function normalize(body: string): string {
  return stripInlineMarkup(body)
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitParagraphs(body: string): string[] {
  const normalized = normalize(body);
  let paras = normalized.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean);
  // If editor used single newlines for every sentence, treat them as paragraph breaks instead.
  if (paras.length <= 1 && /\n/.test(normalized)) {
    paras = normalized.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  }
  return rebalanceParagraphs(paras);
}

function splitSentences(p: string): string[] {
  return (p.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [p]).map((s) => s.trim()).filter(Boolean);
}

/** Nudge paragraphs toward 2–4 sentences where possible. */
function rebalanceParagraphs(paras: string[]): string[] {
  const out: string[] = [];
  for (const p of paras) {
    const sentences = splitSentences(p);
    if (sentences.length <= 4) {
      out.push(p);
      continue;
    }
    // Split a long paragraph into ~3-sentence chunks.
    for (let i = 0; i < sentences.length; i += 3) {
      out.push(sentences.slice(i, i + 3).join(" ").trim());
    }
  }
  return out;
}

/** Pick the single sentence to bold: turning-point cues, else longest sentence in a middle paragraph. */
function pickEmphasisKey(paragraphs: string[]): string | null {
  const turningPoint = /\b(but|yet|however|because|so|therefore|when you|the truth is|hope begins)\b/i;
  for (const p of paragraphs) {
    const sentences = splitSentences(p);
    const hit = sentences.find((s) => turningPoint.test(s));
    if (hit) return hit;
  }
  // Fallback: longest sentence in a middle paragraph
  const middle = paragraphs.slice(1, Math.max(1, paragraphs.length - 1));
  let best: string | null = null;
  for (const p of middle) {
    for (const s of splitSentences(p)) {
      if (!best || s.length > best.length) best = s;
    }
  }
  return best;
}

const DevotionalBody = ({ body, variant = "full", className = "" }: DevotionalBodyProps) => {
  const { paragraphs, emphasisKey, closingIdx } = useMemo(() => {
    const paragraphs = splitParagraphs(body ?? "");
    const closingIdx = paragraphs.length > 1 && splitSentences(paragraphs[paragraphs.length - 1]).length <= 1
      ? paragraphs.length - 1
      : -1;
    const considered = closingIdx >= 0 ? paragraphs.slice(0, closingIdx) : paragraphs;
    const emphasisKey = pickEmphasisKey(considered);
    return { paragraphs, emphasisKey, closingIdx };
  }, [body]);

  const spacing = variant === "compact" ? "space-y-4" : "space-y-5 md:space-y-6";
  const leading = variant === "compact" ? "leading-[1.72]" : "leading-[1.85]";
  const size = variant === "compact" ? "text-[15.5px] md:text-[16px]" : "text-[16.5px] md:text-[18px]";

  if (paragraphs.length === 0) return null;

  return (
    <div className={`font-serif text-foreground/90 text-left ${size} ${leading} ${spacing} ${className}`}>
      {paragraphs.map((p, i) => {
        if (i === closingIdx) {
          // Keep the closing highlighted quote centered
          return (
            <p key={i} className="text-center italic text-primary font-medium pt-2">
              {p}
            </p>
          );
        }
        const sentences = splitSentences(p);
        // Short standalone emphasis line — keep visual weight but align left with the body
        if (sentences.length === 1 && p.length < 110 && paragraphs.length > 2) {
          return (
            <p key={i} className="font-semibold text-primary">
              {p}
            </p>
          );
        }
        if (emphasisKey && sentences.some((s) => s === emphasisKey)) {
          return (
            <p key={i}>
              {sentences.map((s, j) => (
                <span key={j} className={s === emphasisKey ? "font-semibold text-primary" : undefined}>
                  {s}
                  {j < sentences.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
          );
        }
        return <p key={i}>{p}</p>;
      })}
    </div>
  );
};

export default DevotionalBody;
