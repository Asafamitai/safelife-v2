/**
 * Catalog of third-party services SafeLife can read from to enrich the
 * parent / family experience. Each provider is either:
 *   - "mcp": connects through an MCP server (Anthropic Model Context Protocol)
 *   - "api": connects through a vendor REST/OAuth API
 *
 * No real OAuth flow is wired in v1 — the connect/disconnect actions
 * just flip local state and surface a soft note in the family feed.
 */

export type IntegrationKind = "mcp" | "api";

export type IntegrationCategoryId =
  | "pharmacy"
  | "health"
  | "appointments"
  | "fraud"
  | "transport"
  | "smart-home"
  | "carrier";

export interface IntegrationCategory {
  id: IntegrationCategoryId;
  label: string;
  emoji: string;
  /** One-sentence framing for the parent/family. */
  blurb: string;
}

export interface IntegrationProvider {
  id: string;
  category: IntegrationCategoryId;
  name: string;
  kind: IntegrationKind;
  /** Short pitch — what we read from this provider, in plain language. */
  summary: string;
  /** E.g. "OAuth 2.0", "MCP server", "API key". */
  authMethod: string;
  /** Optional logo emoji as a stand-in for a brand mark. */
  emoji?: string;
  /**
   * Synthetic data shown when the provider is connected. Two short rows
   * of label/value. Real connectors fill these from the vendor API.
   */
  liveData?: ReadonlyArray<{ label: string; value: string }>;
}

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  {
    id: "pharmacy",
    label: "Pharmacies",
    emoji: "💊",
    blurb:
      "Pull refill schedules and real adherence signals so meds reminders match what was actually picked up and taken.",
  },
  {
    id: "health",
    label: "Health monitoring",
    emoji: "❤️",
    blurb:
      "Read steps, heart rate, sleep, blood pressure, and falls from wearables and home devices.",
  },
  {
    id: "appointments",
    label: "Appointments & records",
    emoji: "📅",
    blurb:
      "Sync upcoming visits and visit summaries from calendars and patient portals.",
  },
  {
    id: "fraud",
    label: "Fraud & scam signals",
    emoji: "🛡️",
    blurb:
      "Listen to bank fraud alerts and carrier scam-likely flags so we catch issues earlier.",
  },
  {
    id: "transport",
    label: "Rides",
    emoji: "🚕",
    blurb:
      "Book rides on the parent’s behalf for appointments and errands, billed to the family.",
  },
  {
    id: "smart-home",
    label: "Smart home",
    emoji: "🏠",
    blurb:
      "Soft check-ins from cameras, doorbells, and voice assistants — never live video by default.",
  },
  {
    id: "carrier",
    label: "Phone carrier",
    emoji: "📞",
    blurb:
      "Use the carrier’s spam call and SMS detection to filter the noise before it reaches the parent.",
  },
];

export const INTEGRATION_PROVIDERS: IntegrationProvider[] = [
  // Pharmacy
  {
    id: "cvs",
    category: "pharmacy",
    name: "CVS Pharmacy",
    kind: "api",
    summary: "Refill schedule, last pickup, dosage changes.",
    authMethod: "OAuth 2.0",
    emoji: "🏥",
    liveData: [
      { label: "Next refill", value: "Apr 28 · Lisinopril" },
      { label: "Active Rx", value: "2 prescriptions" },
    ],
  },
  {
    id: "walgreens",
    category: "pharmacy",
    name: "Walgreens",
    kind: "api",
    summary: "Refill reminders and prescription transfers.",
    authMethod: "OAuth 2.0",
    emoji: "💊",
    liveData: [
      { label: "Last pickup", value: "Apr 12 · Vitamin D" },
    ],
  },
  {
    id: "rx-mcp",
    category: "pharmacy",
    name: "Independent pharmacy (MCP)",
    kind: "mcp",
    summary: "Generic Rx MCP server for local pharmacies that expose one.",
    authMethod: "MCP server",
    emoji: "🧪",
  },
  {
    id: "adheretech",
    category: "pharmacy",
    name: "AdhereTech Aidia",
    kind: "api",
    summary:
      "Aidia cellular smart bottle — opens reported in real time, adherence reports for clinicians.",
    authMethod: "Clinical API",
    emoji: "💊",
    liveData: [
      { label: "Adherence (7d)", value: "92%" },
      { label: "Missed dose", value: "None this week" },
    ],
  },
  {
    id: "pillsy",
    category: "pharmacy",
    name: "Pillsy",
    kind: "api",
    summary: "Smart bottle tracks opens and compares them to the schedule.",
    authMethod: "OAuth 2.0",
    emoji: "🫙",
    liveData: [
      { label: "Adherence (7d)", value: "86%" },
      { label: "Last open", value: "8:12 AM" },
      { label: "Late doses (7d)", value: "3" },
    ],
  },

  // Health monitoring
  {
    id: "apple-health",
    category: "health",
    name: "Apple Health",
    kind: "api",
    summary: "Steps, heart rate, sleep, falls (with consent).",
    authMethod: "HealthKit on-device",
    emoji: "🍎",
    liveData: [
      { label: "Steps today", value: "4,210" },
      { label: "Resting HR", value: "68 bpm" },
    ],
  },
  {
    id: "fitbit",
    category: "health",
    name: "Fitbit",
    kind: "api",
    summary: "Daily activity and resting heart rate trends.",
    authMethod: "OAuth 2.0",
    emoji: "⌚",
    liveData: [{ label: "Active minutes (7d)", value: "142 min" }],
  },
  {
    id: "withings",
    category: "health",
    name: "Withings",
    kind: "api",
    summary: "Blood pressure, weight, and sleep from connected devices.",
    authMethod: "OAuth 2.0",
    emoji: "🩺",
    liveData: [
      { label: "Last BP", value: "128 / 82 · This morning" },
      { label: "Trend (7d)", value: "Stable" },
    ],
  },
  {
    id: "oura",
    category: "health",
    name: "Oura Ring",
    kind: "api",
    summary: "Sleep quality and recovery score.",
    authMethod: "OAuth 2.0",
    emoji: "💍",
    liveData: [{ label: "Sleep score (last night)", value: "78" }],
  },

  // Appointments / records
  {
    id: "google-calendar",
    category: "appointments",
    name: "Google Calendar",
    kind: "api",
    summary: "Upcoming appointments and reminders.",
    authMethod: "OAuth 2.0",
    emoji: "🗓️",
    liveData: [{ label: "Next appointment", value: "Tue 10:30 · Dr. Levi" }],
  },
  {
    id: "mychart",
    category: "appointments",
    name: "MyChart (Epic)",
    kind: "api",
    summary: "Visit summaries and doctor messages.",
    authMethod: "OAuth 2.0 (FHIR)",
    emoji: "📋",
  },
  {
    id: "ehr-mcp",
    category: "appointments",
    name: "Patient portal (MCP)",
    kind: "mcp",
    summary: "Generic patient-portal MCP server.",
    authMethod: "MCP server",
    emoji: "📁",
  },

  // Fraud / scam
  {
    id: "chase-fraud",
    category: "fraud",
    name: "Chase fraud alerts",
    kind: "api",
    summary: "Real-time card and ACH fraud alerts.",
    authMethod: "Webhook + API key",
    emoji: "🏦",
  },
  {
    id: "experian",
    category: "fraud",
    name: "Experian alerts",
    kind: "api",
    summary: "Identity and credit alerts on the parent’s file.",
    authMethod: "OAuth 2.0",
    emoji: "🔍",
  },
  {
    id: "scam-mcp",
    category: "fraud",
    name: "Scam intel (MCP)",
    kind: "mcp",
    summary: "Crowd-sourced scam phone numbers and templates.",
    authMethod: "MCP server",
    emoji: "🚫",
  },

  // Transport
  {
    id: "uber-health",
    category: "transport",
    name: "Uber Health",
    kind: "api",
    summary: "Schedule rides for appointments, no app needed.",
    authMethod: "API key",
    emoji: "🚕",
  },
  {
    id: "lyft-concierge",
    category: "transport",
    name: "Lyft Concierge",
    kind: "api",
    summary: "Family-paid rides with caregiver visibility.",
    authMethod: "API key",
    emoji: "🚖",
  },

  // Smart home
  {
    id: "ring",
    category: "smart-home",
    name: "Ring doorbell",
    kind: "api",
    summary: "Door events — never live video without consent.",
    authMethod: "OAuth 2.0",
    emoji: "🔔",
  },
  {
    id: "nest",
    category: "smart-home",
    name: "Nest",
    kind: "api",
    summary: "Thermostat and home presence signals.",
    authMethod: "OAuth 2.0 (Google)",
    emoji: "🌡️",
  },
  {
    id: "alexa-mcp",
    category: "smart-home",
    name: "Amazon Alexa (MCP)",
    kind: "mcp",
    summary: "Routines and voice check-ins via an MCP bridge.",
    authMethod: "MCP server",
    emoji: "🔊",
  },

  // Carrier
  {
    id: "verizon",
    category: "carrier",
    name: "Verizon Call Filter",
    kind: "api",
    summary: "Carrier-side spam call and SMS detection.",
    authMethod: "API key",
    emoji: "📡",
    liveData: [
      { label: "Spam blocked (7d)", value: "23 calls" },
      { label: "Last block", value: "2h ago" },
    ],
  },
  {
    id: "tmobile",
    category: "carrier",
    name: "T-Mobile Scam Shield",
    kind: "api",
    summary: "Block known scammers before they reach the phone.",
    authMethod: "API key",
    emoji: "📶",
  },
];

export function providersByCategory(category: IntegrationCategoryId) {
  return INTEGRATION_PROVIDERS.filter((p) => p.category === category);
}
