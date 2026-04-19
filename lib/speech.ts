"use client";

/**
 * Tiny wrappers around the browser's Web Speech APIs.
 *
 * Recognition (speech-to-text): Chrome / Edge / Safari 14.1+. Not Firefox.
 * Always feature-detect with `isSpeechRecognitionSupported()` before showing
 * a mic affordance.
 *
 * Synthesis (text-to-speech): universal modern browsers. iOS Safari requires
 * the call to originate from a user gesture — fine inside click handlers.
 */

type SpeechRecognitionLike = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

/** Resolves with the first final transcript. Rejects on error / timeout / no-speech. */
export function recognizeOnce(timeoutMs = 8000): Promise<string> {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return Promise.reject(new Error("speech-recognition-unsupported"));

  return new Promise((resolve, reject) => {
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      try { rec.stop(); } catch { /* noop */ }
      fn();
    };

    const timeout = window.setTimeout(
      () => finish(() => reject(new Error("speech-recognition-timeout"))),
      timeoutMs
    );

    rec.onresult = (event) => {
      window.clearTimeout(timeout);
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      finish(() => resolve(transcript.trim()));
    };
    rec.onerror = (event) => {
      window.clearTimeout(timeout);
      finish(() => reject(new Error(event.error || "speech-recognition-error")));
    };
    rec.onend = () => {
      window.clearTimeout(timeout);
      finish(() => reject(new Error("speech-recognition-no-result")));
    };

    try {
      rec.start();
    } catch (e) {
      window.clearTimeout(timeout);
      finish(() => reject(e instanceof Error ? e : new Error(String(e))));
    }
  });
}

/** Speak text aloud with a slightly slower default rate. No-op if unsupported. */
export function speak(text: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  if (!text.trim()) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.lang = "en-US";
  synth.speak(utterance);
}

export function cancelSpeech() {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
}
