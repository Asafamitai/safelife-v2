"use client";

import { useEffect, useState } from "react";
import { Mic, Volume2 } from "lucide-react";
import {
  isSTTAvailable,
  isTTSAvailable,
  recognizeOnce,
  speak,
  stopSpeaking,
} from "@/lib/voice";
import { cn } from "@/lib/utils";

type Variant = "speak" | "mic";

interface SpeakProps {
  variant?: "speak";
  /** The text to read aloud when tapped. */
  text: string;
  /** Accessible label. Defaults to "Read aloud". */
  label?: string;
  className?: string;
}

interface MicProps {
  variant: "mic";
  /** Fires with the recognized transcript on success. */
  onResult: (transcript: string) => void;
  /** Optional error callback (non-fatal — button resets). */
  onError?: (code: string) => void;
  label?: string;
  className?: string;
}

type Props = SpeakProps | MicProps;

/**
 * 44pt+ primitive for voice actions on parent-side UIs.
 *
 * Feature-detects TTS / STT — when unsupported, renders nothing so layout
 * doesn't shift. Uses `aria-pressed` so screen readers announce the
 * active state while the button is speaking or listening.
 */
export function VoiceButton(props: Props) {
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (props.variant === "mic") return;
    return () => {
      // Cancel any in-flight speech when this button unmounts.
      stopSpeaking();
    };
  }, [props.variant]);

  // Wait for hydration before feature-detecting — speechSynthesis only
  // exists on the client, and we don't want SSR/hydration mismatch.
  if (!mounted) return null;
  const supported =
    props.variant === "mic" ? isSTTAvailable() : isTTSAvailable();
  if (!supported) return null;

  if (props.variant === "mic") {
    return (
      <button
        type="button"
        aria-pressed={busy}
        aria-busy={busy}
        aria-label={props.label ?? "Tap and speak"}
        disabled={busy}
        onClick={async () => {
          if (busy) return;
          setBusy(true);
          try {
            const transcript = await recognizeOnce();
            if (transcript) props.onResult(transcript);
            else props.onError?.("speech-recognition-no-result");
          } catch (err) {
            const code =
              err instanceof Error ? err.message : "speech-recognition-error";
            props.onError?.(code);
          } finally {
            setBusy(false);
          }
        }}
        className={cn(
          "inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border-2 border-dashed px-3 py-1.5 text-[13px] font-bold transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          busy
            ? "border-accent bg-chip-blue text-accent animate-pulse"
            : "border-line bg-white text-ink-2 hover:bg-panel",
          props.className
        )}
      >
        <Mic className="h-4 w-4" aria-hidden />
        <span>{busy ? "Listening…" : "Speak"}</span>
      </button>
    );
  }

  const { text } = props;
  return (
    <button
      type="button"
      aria-pressed={busy}
      aria-label={props.label ?? "Read aloud"}
      onClick={() => {
        if (busy) {
          stopSpeaking();
          setBusy(false);
          return;
        }
        setBusy(true);
        speak(text, { trigger: "tap" });
        // Heuristic "done" timer — a simple rate-based estimate.
        const estMs = Math.max(1500, Math.min(14_000, text.length * 55));
        window.setTimeout(() => setBusy(false), estMs);
      }}
      className={cn(
        "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-line bg-white p-2 text-ink-2 transition-transform hover:-translate-y-[1px] hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        busy && "bg-chip-blue text-accent",
        props.className
      )}
    >
      <Volume2 className="h-5 w-5" aria-hidden />
    </button>
  );
}
