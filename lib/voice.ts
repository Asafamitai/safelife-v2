"use client";

/**
 * Thin layer over `lib/speech.ts` that respects the `voice-settings`
 * store. Components should call these (not the raw speech helpers) so
 * the mode preference is honoured everywhere.
 */

import {
  cancelSpeech,
  isSpeechRecognitionSupported,
  recognizeOnce,
  speak as rawSpeak,
} from "./speech";
import { useVoiceSettingsStore } from "./store/voice-settings";

function currentMode() {
  // Zustand is synchronous — read the current snapshot without subscribing.
  return useVoiceSettingsStore.getState().mode;
}

export function isTTSAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.speechSynthesis;
}

export function isSTTAvailable(): boolean {
  return isSpeechRecognitionSupported();
}

/**
 * Speak `text` aloud unless the user has voice turned off.
 * Respects the store's current mode — "off" is a silent no-op.
 *
 * `trigger: "tap"` (default) speaks when TTS is supported and mode !== "off".
 * `trigger: "focus"` only speaks when mode === "on-focus", so passive
 * focus events don't chatter at users who only want tap-to-read.
 */
export function speak(
  text: string,
  opts: { trigger?: "tap" | "focus" } = {}
) {
  if (!isTTSAvailable()) return;
  const mode = currentMode();
  if (mode === "off") return;
  if ((opts.trigger ?? "tap") === "focus" && mode !== "on-focus") return;
  rawSpeak(text);
}

export function stopSpeaking() {
  cancelSpeech();
}

export { recognizeOnce };
