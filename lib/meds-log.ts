/**
 * Seed data for the Medications → Log tab. Synthetic 2-day history so
 * caregivers have something to scroll. A later pass derives this from
 * the meds store + real confirmation timestamps.
 */

export type MedLogStatus = "taken" | "missed";
export type MedLogDay = "today" | "yesterday";

export interface MedLogEntry {
  id: string;
  medName: string;
  dose: string;
  scheduledAt: string;
  loggedAt: string;
  status: MedLogStatus;
  day: MedLogDay;
}

export const MED_LOG: MedLogEntry[] = [
  {
    id: "ml-1",
    medName: "Lisinopril",
    dose: "10 mg",
    scheduledAt: "08:00",
    loggedAt: "08:02 AM",
    status: "taken",
    day: "today",
  },
  {
    id: "ml-2",
    medName: "Vitamin D",
    dose: "1 tablet",
    scheduledAt: "12:30",
    loggedAt: "12:35 PM",
    status: "taken",
    day: "today",
  },
  {
    id: "ml-3",
    medName: "Metformin",
    dose: "500 mg",
    scheduledAt: "08:00",
    loggedAt: "08:00 AM",
    status: "missed",
    day: "today",
  },
  {
    id: "ml-4",
    medName: "Lisinopril",
    dose: "10 mg",
    scheduledAt: "08:00",
    loggedAt: "08:05 AM",
    status: "taken",
    day: "yesterday",
  },
  {
    id: "ml-5",
    medName: "Metformin",
    dose: "500 mg",
    scheduledAt: "08:00",
    loggedAt: "07:58 AM",
    status: "taken",
    day: "yesterday",
  },
];
