"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { z } from "zod";
import { authClient } from "../../lib/auth-client";

type PlanId = "A" | "B" | "C" | "R";
type ViewId = "plan" | "guide" | "equipment" | "history";
type TrainingMode = "gym" | "home";
type RecoveryExerciseId = "recovery-walk" | "recovery-cycle" | "recovery-mobility";

const profile = {
  name: "Rohan",
  age: 25,
  birthDate: "2001-05-05",
  sex: "male",
  heightCm: 173,
  weightKg: 80,
  proteinMinimumG: 130,
  proteinMaximumG: 160,
};

const APP_BASE_PATH = "/workout";
const STORAGE_CHOICE_STORAGE = "rohan-workout-storage-choice";

function assetPath(path: string): string {
  return `${APP_BASE_PATH}${path}`;
}

type ExerciseId =
  | "leg-press"
  | "chest-press"
  | "lat-pulldown"
  | "seated-row"
  | "shoulder-press"
  | "dumbbell-bench"
  | "dumbbell-rdl"
  | "dumbbell-glute-bridge"
  | "supported-split-squat"
  | "lateral-raise"
  | "biceps-curl"
  | "triceps-extension"
  | "calf-raise"
  | "easy-cardio"
  | RecoveryExerciseId
  | "home-split-squat"
  | "home-incline-push-up"
  | "home-push-up"
  | "home-row"
  | "home-rdl"
  | "home-glute-bridge"
  | "home-shoulder-press"
  | "home-lateral-raise"
  | "home-reverse-fly"
  | "home-curl"
  | "home-triceps"
  | "home-calf-raise";

type Exercise = {
  id: ExerciseId;
  name: string;
  equipment: string;
  image: string;
  muscle: string;
  usesWeight: boolean;
  defaultWeight?: string;
  defaultReps?: string;
  weightLabel?: string;
  timed?: boolean;
  cues: string[];
};

type PlanExercise = {
  exerciseId: ExerciseId;
  sets: number;
  min: number;
  max: number;
  restSeconds: number;
};

type Plan = {
  id: PlanId;
  label: string;
  title: string;
  duration: string;
  gymExercises: PlanExercise[];
  homeExercises: PlanExercise[];
};

type ExerciseCatalog = { [Key in ExerciseId]: Exercise };
type PlanCatalog = { [Key in PlanId]: Plan };

type SetLog = {
  weight: string;
  reps: string;
  rir: string;
  done: boolean;
};

type ExerciseLog = {
  exerciseId: ExerciseId;
  sets: SetLog[];
};

type WorkoutSession = {
  id: string;
  planId: PlanId;
  mode?: TrainingMode;
  startedAt?: string;
  endedAt: string;
  durationSeconds?: number;
  logs: ExerciseLog[];
};

type ActiveWorkoutRecord = {
  id: "active";
  deleted?: boolean;
  planId: PlanId;
  mode: TrainingMode;
  currentIndex: number;
  draft: Record<string, SetLog[]>;
  startedAt?: string;
  elapsedSeconds?: number;
  recoveryExerciseId?: RecoveryExerciseId;
  updatedAt: string;
};

type HeatmapDay = {
  date: string;
  label: string;
  recoverySessions: number;
  strengthSessions: number;
};

const exercises: ExerciseCatalog = {
  "leg-press": {
    id: "leg-press",
    name: "Leg press",
    equipment: "Matrix leg press",
    image: "/gym/leg-press.jpeg",
    muscle: "Quads · glutes",
    usesWeight: true,
    defaultWeight: "30",
    cues: [
      "Keep your hips and back against the pads.",
      "Track your knees over your toes.",
      "Stop before your hips curl from the seat.",
    ],
  },
  "chest-press": {
    id: "chest-press",
    name: "Chest press",
    equipment: "Matrix chest press",
    image: "/gym/chest-press.jpeg",
    muscle: "Chest · triceps",
    usesWeight: true,
    defaultWeight: "10",
    cues: [
      "Set the handles near your mid-chest.",
      "Keep your shoulders down against the pad.",
      "Press smoothly without locking your elbows.",
    ],
  },
  "lat-pulldown": {
    id: "lat-pulldown",
    name: "Lat pulldown",
    equipment: "Matrix lat pulldown",
    image: "/gym/lat-pulldown.jpeg",
    muscle: "Lats · biceps",
    usesWeight: true,
    defaultWeight: "20",
    cues: [
      "Lock your thighs under the pads.",
      "Keep your chest tall.",
      "Pull toward your upper chest without swinging.",
    ],
  },
  "seated-row": {
    id: "seated-row",
    name: "Seated row",
    equipment: "Matrix seated row",
    image: "/gym/seated-row.jpeg",
    muscle: "Upper back · biceps",
    usesWeight: true,
    defaultWeight: "20",
    cues: [
      "Sit tall with your feet planted.",
      "Pull the handles toward your lower ribs.",
      "Return slowly without rounding your back.",
    ],
  },
  "shoulder-press": {
    id: "shoulder-press",
    name: "Shoulder press",
    equipment: "Matrix shoulder press",
    image: "/gym/shoulder-press.jpeg",
    muscle: "Shoulders · triceps",
    usesWeight: true,
    defaultWeight: "5",
    cues: [
      "Set the handles close to shoulder height.",
      "Keep your ribs down against the pad.",
      "Press up without shrugging.",
    ],
  },
  "dumbbell-bench": {
    id: "dumbbell-bench",
    name: "Incline dumbbell press",
    equipment: "Adjustable bench + dumbbells",
    image: "/exercises/gym-visual/incline-dumbbell-press.gif",
    muscle: "Chest · triceps",
    usesWeight: true,
    defaultWeight: "6",
    weightLabel: "kg each",
    cues: [
      "Plant both feet on the floor.",
      "Lower the dumbbells beside your chest.",
      "Keep your wrists over your elbows.",
    ],
  },
  "dumbbell-rdl": {
    id: "dumbbell-rdl",
    name: "Dumbbell Romanian deadlift",
    equipment: "Dumbbells",
    image: "/exercises/gym-visual/dumbbell-romanian-deadlift.gif",
    muscle: "Hamstrings · glutes",
    usesWeight: true,
    defaultWeight: "8",
    weightLabel: "kg each",
    cues: [
      "Keep a small bend in your knees.",
      "Push your hips backward.",
      "Stop when your hamstrings stretch.",
    ],
  },
  "dumbbell-glute-bridge": {
    id: "dumbbell-glute-bridge",
    name: "Dumbbell glute bridge",
    equipment: "Exercise mat + one dumbbell",
    image: "/exercises/gym-visual/glute-bridge.gif",
    muscle: "Glutes · hamstrings",
    usesWeight: true,
    defaultWeight: "8",
    weightLabel: "kg total",
    cues: [
      "Pad the dumbbell with a folded towel and hold it across your hips.",
      "Push through your whole foot.",
      "Squeeze your glutes without arching your back.",
    ],
  },
  "supported-split-squat": {
    id: "supported-split-squat",
    name: "Supported split squat",
    equipment: "Dumbbell rack + optional dumbbell",
    image: "/exercises/gym-visual/supported-split-squat.gif",
    muscle: "Quads · glutes",
    usesWeight: true,
    defaultWeight: "0",
    weightLabel: "kg total",
    cues: [
      "Hold the rack lightly for balance and start with body weight.",
      "Lower straight down while keeping your front heel planted.",
      "Finish all reps on one leg, then switch legs.",
    ],
  },
  "lateral-raise": {
    id: "lateral-raise",
    name: "Dumbbell lateral raise",
    equipment: "Light dumbbells",
    image: "/exercises/gym-visual/dumbbell-lateral-raise.gif",
    muscle: "Side shoulders",
    usesWeight: true,
    defaultWeight: "3",
    weightLabel: "kg each",
    cues: [
      "Use light dumbbells.",
      "Keep a small bend in your elbows.",
      "Lift to shoulder height without swinging.",
    ],
  },
  "biceps-curl": {
    id: "biceps-curl",
    name: "Dumbbell curl",
    equipment: "Dumbbells",
    image: "/exercises/gym-visual/dumbbell-curl.gif",
    muscle: "Biceps",
    usesWeight: true,
    defaultWeight: "5",
    weightLabel: "kg each",
    cues: [
      "Keep your elbows beside your body.",
      "Curl without leaning backward.",
      "Lower the dumbbells under control.",
    ],
  },
  "triceps-extension": {
    id: "triceps-extension",
    name: "Overhead triceps extension",
    equipment: "One dumbbell",
    image: "/exercises/gym-visual/overhead-triceps-extension.gif",
    muscle: "Triceps",
    usesWeight: true,
    defaultWeight: "6",
    weightLabel: "kg total",
    cues: [
      "Hold one dumbbell with both hands.",
      "Keep your elbows close to your head.",
      "Move slowly behind your head.",
    ],
  },
  "calf-raise": {
    id: "calf-raise",
    name: "Standing calf raise",
    equipment: "Dumbbells or body weight",
    image: "/exercises/gym-visual/standing-calf-raise.gif",
    muscle: "Calves",
    usesWeight: true,
    defaultWeight: "0",
    cues: [
      "Hold the rack for balance if needed.",
      "Rise onto the balls of your feet.",
      "Pause at the top, then lower slowly.",
    ],
  },
  "easy-cardio": {
    id: "easy-cardio",
    name: "Easy walk, bike, or march",
    equipment: "Outside, treadmill, stationary bike, or open floor",
    image: "/gym/overview.jpeg",
    muscle: "Recovery",
    usesWeight: false,
    defaultReps: "20",
    timed: true,
    cues: [
      "Start slowly for 3 minutes.",
      "Stay at 2 or 3 out of 10 effort. Speak in full sentences.",
      "Slow down for the last 2 minutes.",
    ],
  },
  "recovery-walk": {
    id: "recovery-walk",
    name: "Easy walk",
    equipment: "Outside or treadmill",
    image: "/gym/overview.jpeg",
    muscle: "Light activity",
    usesWeight: false,
    defaultReps: "20",
    timed: true,
    cues: [
      "Start slowly for 3 minutes.",
      "Stay at 2 or 3 out of 10 effort. Speak in full sentences.",
      "Slow down for the last 2 minutes.",
    ],
  },
  "recovery-cycle": {
    id: "recovery-cycle",
    name: "Easy bike ride",
    equipment: "Stationary bike or bicycle",
    image: "/gym/overview.jpeg",
    muscle: "Low-impact activity",
    usesWeight: false,
    defaultReps: "20",
    timed: true,
    cues: [
      "Use low resistance and an easy pace.",
      "Stay at 2 or 3 out of 10 effort. Speak in full sentences.",
      "Stop if pedaling makes your soreness worse.",
    ],
  },
  "recovery-mobility": {
    id: "recovery-mobility",
    name: "Gentle mobility",
    equipment: "Open floor or exercise mat",
    image: "/gym/overview.jpeg",
    muscle: "Comfort and range of motion",
    usesWeight: false,
    defaultReps: "10",
    timed: true,
    cues: [
      "Move gently through areas that feel stiff.",
      "Try ankle rocks, hip rotations, and upper-back rotations.",
      "Do not force a stretch or use mobility to push through pain.",
    ],
  },
  "home-split-squat": {
    id: "home-split-squat",
    name: "Supported split squat",
    equipment: "Stable chair for balance",
    image: "/exercises/gym-visual/supported-split-squat.gif",
    muscle: "Quads · glutes",
    usesWeight: false,
    cues: [
      "Hold a stable chair lightly for balance.",
      "Lower straight down with control.",
      "Keep your front heel on the floor.",
    ],
  },
  "home-incline-push-up": {
    id: "home-incline-push-up",
    name: "Incline push-up",
    equipment: "Stable counter or heavy table",
    image: "/exercises/gym-visual/incline-push-up.gif",
    muscle: "Chest · triceps",
    usesWeight: false,
    cues: [
      "Use a surface that cannot slide.",
      "Keep your body in one straight line.",
      "Lower your chest toward the edge.",
    ],
  },
  "home-push-up": {
    id: "home-push-up",
    name: "Push-up",
    equipment: "Floor or exercise mat",
    image: "/exercises/gym-visual/push-up.gif",
    muscle: "Chest · triceps",
    usesWeight: false,
    cues: [
      "Use your knees if full push-ups are too hard.",
      "Keep your body in one straight line.",
      "Stop before your hips or shoulders sag.",
    ],
  },
  "home-row": {
    id: "home-row",
    name: "One-arm backpack row",
    equipment: "Zipped backpack + stable chair",
    image: "/exercises/gym-visual/one-arm-row.gif",
    muscle: "Upper back · biceps",
    usesWeight: true,
    defaultWeight: "5",
    weightLabel: "kg total",
    cues: [
      "Zip the backpack and brace one hand on a chair.",
      "Pull the bag toward your lower ribs.",
      "Keep your back still as you lower it.",
    ],
  },
  "home-rdl": {
    id: "home-rdl",
    name: "Backpack Romanian deadlift",
    equipment: "Zipped backpack",
    image: "/exercises/gym-visual/dumbbell-romanian-deadlift.gif",
    muscle: "Hamstrings · glutes",
    usesWeight: true,
    defaultWeight: "5",
    weightLabel: "kg total",
    cues: [
      "Hold the backpack close to your legs.",
      "Push your hips backward.",
      "Stop when your hamstrings stretch.",
    ],
  },
  "home-glute-bridge": {
    id: "home-glute-bridge",
    name: "Floor glute bridge",
    equipment: "Floor or exercise mat",
    image: "/exercises/gym-visual/glute-bridge.gif",
    muscle: "Glutes · hamstrings",
    usesWeight: false,
    cues: [
      "Place your feet near your hips.",
      "Push through your whole foot.",
      "Squeeze your glutes without arching your back.",
    ],
  },
  "home-shoulder-press": {
    id: "home-shoulder-press",
    name: "Seated bottle shoulder press",
    equipment: "Two water bottles + chair",
    image: "/exercises/gym-visual/seated-dumbbell-press.gif",
    muscle: "Shoulders · triceps",
    usesWeight: true,
    defaultWeight: "1",
    weightLabel: "kg each",
    cues: [
      "Sit tall with both feet on the floor.",
      "Start with the bottles at shoulder height.",
      "Press without leaning backward.",
    ],
  },
  "home-lateral-raise": {
    id: "home-lateral-raise",
    name: "Bottle lateral raise",
    equipment: "Two light water bottles",
    image: "/exercises/gym-visual/dumbbell-lateral-raise.gif",
    muscle: "Side shoulders",
    usesWeight: true,
    defaultWeight: "1",
    weightLabel: "kg each",
    cues: [
      "Use light bottles.",
      "Keep a small bend in your elbows.",
      "Lift to shoulder height without swinging.",
    ],
  },
  "home-reverse-fly": {
    id: "home-reverse-fly",
    name: "Bottle reverse fly",
    equipment: "Two light water bottles",
    image: "/exercises/gym-visual/dumbbell-reverse-fly.gif",
    muscle: "Rear shoulders · upper back",
    usesWeight: true,
    defaultWeight: "1",
    weightLabel: "kg each",
    cues: [
      "Push your hips back and keep your back still.",
      "Open your arms out to the sides.",
      "Use a small, controlled range.",
    ],
  },
  "home-curl": {
    id: "home-curl",
    name: "Backpack or bottle curl",
    equipment: "Backpack or water bottles",
    image: "/exercises/gym-visual/dumbbell-curl.gif",
    muscle: "Biceps",
    usesWeight: true,
    defaultWeight: "5",
    weightLabel: "kg total",
    cues: [
      "Keep your elbows beside your body.",
      "Curl without leaning backward.",
      "Lower the load slowly.",
    ],
  },
  "home-triceps": {
    id: "home-triceps",
    name: "Backpack triceps extension",
    equipment: "Light, zipped backpack",
    image: "/exercises/gym-visual/overhead-triceps-extension.gif",
    muscle: "Triceps",
    usesWeight: true,
    defaultWeight: "5",
    weightLabel: "kg total",
    cues: [
      "Hold the backpack securely with both hands.",
      "Keep your elbows close to your head.",
      "Use a light load and move slowly.",
    ],
  },
  "home-calf-raise": {
    id: "home-calf-raise",
    name: "Single-leg calf raise",
    equipment: "Stable chair for balance",
    image: "/exercises/gym-visual/standing-calf-raise.gif",
    muscle: "Calves",
    usesWeight: false,
    cues: [
      "Hold a stable chair lightly.",
      "Rise onto the ball of one foot.",
      "Pause at the top, then lower slowly.",
    ],
  },
};

const cloudSetLogSchema = z.object({
  weight: z.string(),
  reps: z.string(),
  rir: z.string(),
  done: z.boolean(),
});

const cloudExerciseLogSchema = z.object({
  exerciseId: z.string(),
  sets: z.array(cloudSetLogSchema),
});

const cloudHistorySchema = z.object({
  sessions: z.array(z.object({
    id: z.string(),
    planId: z.enum(["A", "B", "C", "R"]),
    mode: z.enum(["gym", "home"]).optional(),
    startedAt: z.string().optional(),
    endedAt: z.string(),
    durationSeconds: z.number().int().nonnegative().optional(),
    logs: z.array(cloudExerciseLogSchema),
  })),
});

const plans: PlanCatalog = {
  A: {
    id: "A",
    label: "Day 1",
    title: "Full body · chest + lats",
    duration: "45–55 min",
    gymExercises: [
      { exerciseId: "leg-press", sets: 3, min: 8, max: 12, restSeconds: 150 },
      { exerciseId: "chest-press", sets: 3, min: 8, max: 12, restSeconds: 120 },
      { exerciseId: "lat-pulldown", sets: 3, min: 8, max: 12, restSeconds: 120 },
      { exerciseId: "supported-split-squat", sets: 2, min: 8, max: 12, restSeconds: 90 },
      { exerciseId: "lateral-raise", sets: 2, min: 12, max: 15, restSeconds: 75 },
      { exerciseId: "calf-raise", sets: 2, min: 12, max: 20, restSeconds: 75 },
    ],
    homeExercises: [
      { exerciseId: "home-split-squat", sets: 3, min: 8, max: 15, restSeconds: 90 },
      { exerciseId: "home-incline-push-up", sets: 3, min: 6, max: 15, restSeconds: 90 },
      { exerciseId: "home-row", sets: 3, min: 10, max: 15, restSeconds: 90 },
      { exerciseId: "home-glute-bridge", sets: 3, min: 12, max: 20, restSeconds: 90 },
      { exerciseId: "home-lateral-raise", sets: 2, min: 12, max: 20, restSeconds: 60 },
      { exerciseId: "home-calf-raise", sets: 2, min: 12, max: 20, restSeconds: 60 },
    ],
  },
  B: {
    id: "B",
    label: "Day 2",
    title: "Full body · back + shoulders",
    duration: "45–55 min",
    gymExercises: [
      { exerciseId: "leg-press", sets: 3, min: 10, max: 15, restSeconds: 150 },
      { exerciseId: "seated-row", sets: 3, min: 8, max: 12, restSeconds: 120 },
      { exerciseId: "shoulder-press", sets: 2, min: 8, max: 12, restSeconds: 120 },
      { exerciseId: "supported-split-squat", sets: 2, min: 8, max: 12, restSeconds: 90 },
      { exerciseId: "dumbbell-bench", sets: 3, min: 8, max: 12, restSeconds: 120 },
      { exerciseId: "biceps-curl", sets: 2, min: 10, max: 15, restSeconds: 75 },
    ],
    homeExercises: [
      { exerciseId: "home-split-squat", sets: 3, min: 8, max: 15, restSeconds: 90 },
      { exerciseId: "home-row", sets: 3, min: 10, max: 15, restSeconds: 90 },
      { exerciseId: "home-shoulder-press", sets: 2, min: 8, max: 15, restSeconds: 90 },
      { exerciseId: "home-glute-bridge", sets: 3, min: 12, max: 20, restSeconds: 90 },
      { exerciseId: "home-incline-push-up", sets: 3, min: 6, max: 15, restSeconds: 90 },
      { exerciseId: "home-curl", sets: 2, min: 10, max: 20, restSeconds: 60 },
    ],
  },
  C: {
    id: "C",
    label: "Day 3",
    title: "Full body · balanced",
    duration: "45–60 min",
    gymExercises: [
      { exerciseId: "leg-press", sets: 3, min: 8, max: 12, restSeconds: 150 },
      { exerciseId: "chest-press", sets: 3, min: 8, max: 12, restSeconds: 120 },
      { exerciseId: "lat-pulldown", sets: 3, min: 8, max: 12, restSeconds: 120 },
      { exerciseId: "supported-split-squat", sets: 2, min: 8, max: 12, restSeconds: 90 },
      { exerciseId: "seated-row", sets: 2, min: 10, max: 15, restSeconds: 120 },
      { exerciseId: "triceps-extension", sets: 2, min: 10, max: 15, restSeconds: 75 },
    ],
    homeExercises: [
      { exerciseId: "home-split-squat", sets: 3, min: 8, max: 15, restSeconds: 90 },
      { exerciseId: "home-glute-bridge", sets: 3, min: 12, max: 20, restSeconds: 90 },
      { exerciseId: "home-push-up", sets: 3, min: 6, max: 15, restSeconds: 90 },
      { exerciseId: "home-row", sets: 3, min: 10, max: 15, restSeconds: 90 },
      { exerciseId: "home-reverse-fly", sets: 2, min: 12, max: 20, restSeconds: 60 },
      { exerciseId: "home-triceps", sets: 2, min: 10, max: 20, restSeconds: 60 },
    ],
  },
  R: {
    id: "R",
    label: "Rest day",
    title: "Recover for your next session",
    duration: "10–30 min",
    gymExercises: [
      { exerciseId: "recovery-walk", sets: 1, min: 15, max: 30, restSeconds: 0 },
    ],
    homeExercises: [
      { exerciseId: "recovery-walk", sets: 1, min: 15, max: 30, restSeconds: 0 },
    ],
  },
};

const recoveryOptions: Array<{
  exerciseId: RecoveryExerciseId;
  label: string;
  duration: string;
  description: string;
  prescription: PlanExercise;
}> = [
  {
    exerciseId: "recovery-walk",
    label: "Walk",
    duration: "20 min",
    description: "The simplest option. Walk outside or use the treadmill.",
    prescription: { exerciseId: "recovery-walk", sets: 1, min: 15, max: 30, restSeconds: 0 },
  },
  {
    exerciseId: "recovery-cycle",
    label: "Cycle",
    duration: "20 min",
    description: "A low-impact option. Keep the resistance easy.",
    prescription: { exerciseId: "recovery-cycle", sets: 1, min: 15, max: 30, restSeconds: 0 },
  },
  {
    exerciseId: "recovery-mobility",
    label: "Mobility",
    duration: "10 min",
    description: "Use gentle movement when you feel stiff. Do not force a stretch.",
    prescription: { exerciseId: "recovery-mobility", sets: 1, min: 8, max: 12, restSeconds: 0 },
  },
];

const equipmentIds = [
  "leg-press",
  "chest-press",
  "lat-pulldown",
  "seated-row",
  "shoulder-press",
] satisfies ExerciseId[];

const strengthPlanIds: PlanId[] = ["A", "B", "C"];

let DB_NAME = "rohan-gym-guide";
let accountId = "";
const STORE_NAME = "workouts";
const ACTIVE_STORE_NAME = "active-workout";

function openDatabase(name = DB_NAME): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 2);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains(ACTIVE_STORE_NAME)) {
        database.createObjectStore(ACTIVE_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readHistory(name = DB_NAME): Promise<WorkoutSession[]> {
  const database = await openDatabase(name);
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      // SAFETY: this object store only receives WorkoutSession values through writeSession.
      const sessions = request.result as WorkoutSession[];
      resolve(sessions.sort((a, b) => b.endedAt.localeCompare(a.endedAt)));
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

async function writeSession(session: WorkoutSession): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(session);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

async function readActiveWorkout(includeDeleted = false, name = DB_NAME): Promise<ActiveWorkoutRecord | null> {
  const database = await openDatabase(name);
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(ACTIVE_STORE_NAME, "readonly");
    const request = transaction.objectStore(ACTIVE_STORE_NAME).get("active");
    request.onsuccess = () => {
      // SAFETY: this object store only receives ActiveWorkoutRecord values through writeActiveWorkout.
      const record = request.result as ActiveWorkoutRecord | undefined;
      resolve(record && (includeDeleted || !record.deleted) ? record : null);
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

async function writeActiveWorkout(record: ActiveWorkoutRecord): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(ACTIVE_STORE_NAME, "readwrite");
    transaction.objectStore(ACTIVE_STORE_NAME).put(record);
    transaction.oncomplete = () => {
      database.close();
      resolve();
      window.dispatchEvent(new Event("workout-changed"));
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

async function clearActiveWorkout(): Promise<void> {
  await writeActiveWorkout({ id: "active", deleted: true, planId: "A", mode: "gym", currentIndex: 0, draft: {}, updatedAt: new Date().toISOString() });
}

function syncHeaders(_syncKey: string): Record<string, string> {
  return accountId
    ? { "x-workout-account": accountId, "x-workout-client": "1" }
    : {};
}

async function initializeStorage(): Promise<string> {
  let account: { id: string; email: string } | null;
  try {
    const response = await fetch(`${APP_BASE_PATH}/api/auth`, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error("Account check failed");
    account = (await response.json()).account;
  } catch {
    const cached = window.localStorage.getItem("workout-account");
    try { account = cached ? JSON.parse(cached) : null; } catch { account = null; }
  }
  if (!account) {
    window.localStorage.removeItem("workout-account");
    return "";
  }
  // Import local-only records into the first signed-in account; keep originals intact.
  const previousOwner = window.localStorage.getItem("workout-import-owner");
  const canImport = !previousOwner || previousOwner === account.id;
  const legacy = canImport ? await readHistory("rohan-gym-guide") : [];
  const legacyDraft = canImport ? await readActiveWorkout(true, "rohan-gym-guide") : null;
  accountId = account.id;
  DB_NAME = `rohan-gym-guide-account-${account.id}`;
  await Promise.all(legacy.map(writeSession));
  const accountDraft = await readActiveWorkout(true);
  if (legacyDraft && (!accountDraft || legacyDraft.updatedAt > accountDraft.updatedAt)) await writeActiveWorkout(legacyDraft);
  window.localStorage.setItem("workout-import-owner", previousOwner || account.id);
  window.localStorage.setItem("workout-account", JSON.stringify(account));
  return "account";
}

function isExerciseId(value: string): value is ExerciseId {
  return Object.hasOwn(exercises, value);
}

async function readCloudHistory(syncKey: string): Promise<WorkoutSession[]> {
  const response = await fetch(`${APP_BASE_PATH}/api/workouts`, {
    headers: syncHeaders(syncKey),
    cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error("Cloud history is unavailable.");
  const parsed = cloudHistorySchema.parse(await response.json());
  return parsed.sessions.map((session) => ({
    ...session,
    logs: session.logs.map((log) => {
      if (!isExerciseId(log.exerciseId)) throw new Error("Cloud history contains an unknown exercise.");
      return { ...log, exerciseId: log.exerciseId };
    }),
  }));
}

async function writeCloudSession(syncKey: string, session: WorkoutSession | ActiveWorkoutRecord): Promise<void> {
  const response = await fetch(`${APP_BASE_PATH}/api/workouts`, {
    method: "POST",
    signal: AbortSignal.timeout(15_000),
    headers: {
      "content-type": "application/json",
      ...syncHeaders(syncKey),
    },
    body: JSON.stringify(session),
  });
  if (!response.ok) throw new Error("Cloud save failed.");
}

async function syncHistoryWithCloud(syncKey: string): Promise<WorkoutSession[]> {
  // ponytail: latest draft timestamp wins; add explicit conflicts if simultaneous device editing becomes common.
  const [localSessions, cloudSessions, localDraft] = await Promise.all([readHistory(), readCloudHistory(syncKey), readActiveWorkout(true)]);
  const remoteIds = new Set(cloudSessions.map((session) => session.id));
  for (const session of localSessions) {
    if (!remoteIds.has(session.id)) await writeCloudSession(syncKey, session);
  }
  if (localDraft) await writeCloudSession(syncKey, localDraft);
  const response = await fetch(`${APP_BASE_PATH}/api/workouts`, { headers: syncHeaders(syncKey), cache: "no-store", signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error("Backup verification failed");
  const result = await response.json();
  const sessions = cloudHistorySchema.parse(result).sessions.map((session) => ({
    ...session, logs: session.logs.map((log) => {
      if (!isExerciseId(log.exerciseId)) throw new Error("Unknown exercise in backup");
      return { ...log, exerciseId: log.exerciseId };
    }),
  }));
  if (localSessions.some((local) => !sessions.some((remote) => remote.id === local.id))) throw new Error("Backup is incomplete");
  await Promise.all(sessions.map(writeSession));
  // SAFETY: the authenticated API validates this draft with draftSchema before returning it.
  const remoteDraft = result.draft as ActiveWorkoutRecord | null;
  if (remoteDraft && (!localDraft || remoteDraft.updatedAt > localDraft.updatedAt)) await writeActiveWorkout(remoteDraft);
  const [currentSessions, currentDraft] = await Promise.all([readHistory(), readActiveWorkout(true)]);
  if (currentSessions.some((local) => !sessions.some((remote) => remote.id === local.id)) || (currentDraft && (!remoteDraft || currentDraft.updatedAt > remoteDraft.updatedAt))) throw new Error("New changes are waiting for backup");
  return currentSessions;
}

function getPlanExercises(plan: Plan, mode: TrainingMode): PlanExercise[] {
  return mode === "gym" ? plan.gymExercises : plan.homeExercises;
}

function isRecoveryExerciseId(value: string): value is RecoveryExerciseId {
  return recoveryOptions.some((option) => option.exerciseId === value);
}

function getRecoveryExercise(exerciseId: RecoveryExerciseId): PlanExercise {
  return recoveryOptions.find((option) => option.exerciseId === exerciseId)?.prescription
    ?? recoveryOptions[0].prescription;
}

function emptyDraft(
  planExercises: PlanExercise[],
  previousByExercise: Record<string, ExerciseLog | undefined>,
): Record<string, SetLog[]> {
  return Object.fromEntries(
    planExercises.map((item) => [
      item.exerciseId,
      Array.from({ length: item.sets }, (_, index) => {
        const previous = previousByExercise[item.exerciseId]?.sets[index];
        return {
          weight: previous?.weight || exercises[item.exerciseId].defaultWeight || "",
          reps: previous?.reps || exercises[item.exerciseId].defaultReps || String(item.min),
          rir: previous?.rir || "3",
          done: false,
        };
      }),
    ]),
  );
}

function nextPlanId(history: WorkoutSession[]): PlanId {
  const lastLift = history.find((session) => session.planId !== "R");
  if (!lastLift || lastLift.planId === "C") return "A";
  return lastLift.planId === "A" ? "B" : "C";
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildHeatmap(todayKey: string, sessions: WorkoutSession[]): HeatmapDay[] {
  if (!todayKey) return [];
  const today = new Date(`${todayKey}T12:00:00`);
  const mondayOffset = (today.getDay() + 6) % 7;
  const firstDay = new Date(today);
  firstDay.setDate(today.getDate() - mondayOffset - (11 * 7));

  const counts = new Map<string, { recoverySessions: number; strengthSessions: number }>();
  for (const session of sessions) {
    const key = localDateKey(new Date(session.endedAt));
    const current = counts.get(key) ?? { recoverySessions: 0, strengthSessions: 0 };
    if (session.planId === "R") current.recoverySessions += 1;
    else current.strengthSessions += 1;
    counts.set(key, current);
  }

  return Array.from({ length: 84 }, (_, index) => {
    const date = new Date(firstDay);
    date.setDate(firstDay.getDate() + index);
    const key = localDateKey(date);
    const count = counts.get(key) ?? { recoverySessions: 0, strengthSessions: 0 };
    return {
      date: key,
      label: new Intl.DateTimeFormat("en-MY", { day: "numeric", month: "short" }).format(date),
      ...count,
    };
  });
}

function formatLoggedSet(exerciseId: ExerciseId, set: SetLog): string {
  const exercise = exercises[exerciseId];
  if (exercise.timed) return `${set.reps} min`;
  if (!set.weight) return set.reps;
  return `${set.weight} ${exercise.weightLabel ?? "kg"} × ${set.reps}`;
}

function exerciseVisual(exercise: Exercise, className = ""): ReactNode {
  return <img src={assetPath(exercise.image)} alt={exercise.name} className={className} />;
}

function youtubeFormUrl(exercise: Exercise): string {
  const query = `how to do ${exercise.name} with proper form`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function formVideoLink(exercise: Exercise): ReactNode {
  if (exercise.timed) return null;
  return (
    <a className="form-video-link" href={youtubeFormUrl(exercise)} target="_blank" rel="noreferrer">
      Watch form on YouTube <span aria-hidden="true">↗</span>
    </a>
  );
}

export function WorkoutGuide() {
  const [view, setView] = useState<ViewId>("plan");
  const [planId, setPlanId] = useState<PlanId>("A");
  const [trainingMode, setTrainingMode] = useState<TrainingMode>("gym");
  const [activeMode, setActiveMode] = useState<TrainingMode>("gym");
  const [recoveryExerciseId, setRecoveryExerciseId] = useState<RecoveryExerciseId>("recovery-walk");
  const [activeRecoveryExerciseId, setActiveRecoveryExerciseId] = useState<RecoveryExerciseId>("recovery-walk");
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [active, setActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draft, setDraft] = useState<Record<string, SetLog[]>>({});
  const [restLeft, setRestLeft] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [startedAt, setStartedAt] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const elapsedSecondsRef = useRef(0);
  const [selectedImage, setSelectedImage] = useState<Exercise | null>(null);
  const [savingWorkout, setSavingWorkout] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [storageReady, setStorageReady] = useState(false);
  const [lastSynced, setLastSynced] = useState("");
  const syncRunning = useRef(false);
  const [syncKey, setSyncKey] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [signUp, setSignUp] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const [storageChoiceOpen, setStorageChoiceOpen] = useState(false);
  const [pendingWorkout, setPendingWorkout] = useState<{ planId: PlanId; mode: TrainingMode } | null>(null);
  const [syncStatus, setSyncStatus] = useState<"local" | "syncing" | "synced" | "error">("local");
  const [heatmapToday, setHeatmapToday] = useState("");
  const [previewOrders, setPreviewOrders] = useState<Record<string, PlanExercise[]>>({});

  const plan = plans[planId];
  const previewMode = planId === "R" ? "home" : trainingMode;
  const previewOrderKey = `${planId}:${previewMode}`;
  const defaultPreviewExercises = planId === "R"
    ? [getRecoveryExercise(recoveryExerciseId)]
    : getPlanExercises(plan, previewMode);
  const previewExercises = previewOrders[previewOrderKey] ?? defaultPreviewExercises;
  const defaultActivePlanExercises = planId === "R"
    ? [getRecoveryExercise(activeRecoveryExerciseId)]
    : getPlanExercises(plan, activeMode);
  const activePlanExercises = Object.keys(draft).length === 0
    ? defaultActivePlanExercises
    : Object.keys(draft).flatMap((exerciseId) => {
        const item = defaultActivePlanExercises.find((candidate) => candidate.exerciseId === exerciseId);
        return item ? [item] : [];
      });
  const selectedRecovery = recoveryOptions.find((option) => option.exerciseId === recoveryExerciseId)
    ?? recoveryOptions[0];
  const currentPlanExercise = activePlanExercises[currentIndex];
  const currentExercise = currentPlanExercise
    ? exercises[currentPlanExercise.exerciseId]
    : null;
  const hasPausedWorkout = !active && Object.keys(draft).length > 0;
  const completedExerciseCount = activePlanExercises.filter((item) =>
    draft[item.exerciseId]?.length > 0 && draft[item.exerciseId].every((set) => set.done)
  ).length;

  useEffect(() => {
    initializeStorage().then(async (key) => {
      setSyncKey(key);
      if (key) {
        setSyncStatus("syncing");
        try { await syncHistoryWithCloud(key); setSyncStatus("synced"); setLastSynced(new Date().toLocaleTimeString()); }
        catch { setSyncStatus("error"); }
      }
      return Promise.all([readHistory(), readActiveWorkout()]);
    })
      .then(([sessions, savedWorkout]) => {
        setStorageReady(true);
        setHistory(sessions);
        setHeatmapToday(localDateKey(new Date()));
        if (!savedWorkout) {
          setPlanId(nextPlanId(sessions));
          return;
        }
        const savedRecoveryExerciseId = savedWorkout.recoveryExerciseId
          ?? Object.keys(savedWorkout.draft).find(isRecoveryExerciseId);
        const resolvedRecoveryExerciseId = savedRecoveryExerciseId
          && isRecoveryExerciseId(savedRecoveryExerciseId)
          ? savedRecoveryExerciseId
          : "recovery-walk";
        setRecoveryExerciseId(resolvedRecoveryExerciseId);
        setActiveRecoveryExerciseId(resolvedRecoveryExerciseId);
        setPlanId(savedWorkout.planId);
        setActiveMode(savedWorkout.mode);
        setDraft(
          savedWorkout.planId === "R" && savedWorkout.draft["easy-cardio"]
            ? { [resolvedRecoveryExerciseId]: savedWorkout.draft["easy-cardio"] }
            : savedWorkout.draft,
        );
        setCurrentIndex(savedWorkout.currentIndex);
        setStartedAt(savedWorkout.startedAt ?? new Date().toISOString());
        const savedElapsedSeconds = savedWorkout.elapsedSeconds ?? 0;
        elapsedSecondsRef.current = savedElapsedSeconds;
        setElapsedSeconds(savedElapsedSeconds);
        setActive(false);
      }).catch(() => setSyncStatus("error"));
  }, []);

  useEffect(() => {
    if (!storageReady || !syncKey) return;
    let cancelled = false;
    async function retry() {
      if (syncRunning.current || !navigator.onLine) return;
      syncRunning.current = true;
      setSyncStatus("syncing");
      try {
        const sessions = await syncHistoryWithCloud(syncKey);
        if (!cancelled) { setHistory(sessions); setSyncStatus("synced"); setLastSynced(new Date().toLocaleTimeString()); }
      } catch { if (!cancelled) setSyncStatus("error"); }
      finally { syncRunning.current = false; }
    }
    const timer = window.setInterval(() => void retry(), 30_000);
    window.addEventListener("online", retry);
    window.addEventListener("focus", retry);
    window.addEventListener("workout-changed", retry);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("online", retry);
      window.removeEventListener("focus", retry);
      window.removeEventListener("workout-changed", retry);
    };
  }, [storageReady, syncKey]);

  useEffect(() => {
    if (!active || Object.keys(draft).length === 0) return;
    const timer = window.setTimeout(() => {
      void writeActiveWorkout({
        id: "active",
        planId,
        mode: activeMode,
        currentIndex,
        draft,
        startedAt,
        elapsedSeconds: elapsedSecondsRef.current,
        recoveryExerciseId: planId === "R" ? activeRecoveryExerciseId : undefined,
        updatedAt: new Date().toISOString(),
      });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [active, activeMode, activeRecoveryExerciseId, currentIndex, draft, planId, startedAt]);

  useEffect(() => {
    if (!active) return;
    const initialElapsed = elapsedSecondsRef.current;
    const timerStartedAt = Date.now();
    const updateElapsed = () => {
      const nextElapsed = initialElapsed + Math.floor((Date.now() - timerStartedAt) / 1000);
      elapsedSecondsRef.current = nextElapsed;
      setElapsedSeconds(nextElapsed);
    };
    const timer = window.setInterval(updateElapsed, 1000);
    return () => {
      updateElapsed();
      window.clearInterval(timer);
    };
  }, [active]);

  useEffect(() => {
    if (!active || Object.keys(draft).length === 0) return;
    const timer = window.setInterval(() => {
      void writeActiveWorkout({
        id: "active",
        planId,
        mode: activeMode,
        currentIndex,
        draft,
        startedAt,
        elapsedSeconds: elapsedSecondsRef.current,
        recoveryExerciseId: planId === "R" ? activeRecoveryExerciseId : undefined,
        updatedAt: new Date().toISOString(),
      });
    }, 15000);
    return () => window.clearInterval(timer);
  }, [active, activeMode, activeRecoveryExerciseId, currentIndex, draft, planId, startedAt]);

  useEffect(() => {
    if (!restRunning || restLeft <= 0) return;
    const timer = window.setInterval(() => {
      setRestLeft((value) => {
        if (value <= 1) {
          setRestRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [restRunning, restLeft]);

  useEffect(() => {
    if (!syncOpen) return;
    const previous = document.activeElement;
    const modal = document.querySelector<HTMLElement>('[aria-label="Cloud sync"]');
    const controls = () => Array.from(modal?.querySelectorAll<HTMLElement>('button:not([disabled]), input, a[href], summary') ?? []);
    controls()[1]?.focus();
    function trapFocus(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const items = controls();
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", trapFocus);
    return () => { document.removeEventListener("keydown", trapFocus); if (previous instanceof HTMLElement) previous.focus(); };
  }, [syncOpen]);

  useEffect(() => {
    if (!storageChoiceOpen && !syncOpen && !selectedImage) return;
    const closeTopModal = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (storageChoiceOpen) {
        setStorageChoiceOpen(false);
        setPendingWorkout(null);
        return;
      }
      if (syncOpen) {
        setSyncOpen(false);
        return;
      }
      setSelectedImage(null);
    };
    window.addEventListener("keydown", closeTopModal);
    return () => window.removeEventListener("keydown", closeTopModal);
  }, [selectedImage, storageChoiceOpen, syncOpen]);

  const latestByExercise = useMemo(() => {
    const result: Record<string, ExerciseLog | undefined> = {};
    for (const session of history) {
      for (const log of session.logs) {
        if (!result[log.exerciseId]) result[log.exerciseId] = log;
      }
    }
    return result;
  }, [history]);

  const heatmapDays = useMemo(
    () => buildHeatmap(heatmapToday, history),
    [heatmapToday, history],
  );
  const recentSessions = history.filter((session) => Date.parse(session.endedAt) >= Date.now() - 7 * 86400_000);
  const strengthThisWeek = recentSessions.filter((session) => session.planId !== "R").length;
  const completedSets = recentSessions.reduce((total, session) => total + session.logs.reduce((count, log) => count + log.sets.filter((set) => set.done).length, 0), 0);
  const trainingMinutes = Math.round(recentSessions.reduce((total, session) => total + (session.durationSeconds ?? 0), 0) / 60);
  const backupText = syncStatus === "synced" ? `Backup verified · ${lastSynced}` : syncStatus === "syncing" ? "Backing up…" : syncStatus === "error" ? "Backup pending · device records kept" : "Saved on this device only";
  const heatmapStrengthCount = heatmapDays.reduce(
    (total, day) => total + day.strengthSessions,
    0,
  );

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true); setAuthError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")); const password = String(form.get("password"));
    try {
      const result = signUp
        ? await authClient.signUp.email({ email, password, name: email.split("@")[0] })
        : await authClient.signIn.email({ email, password });
      if (result.error) setAuthError(result.error.message || "Sign-in failed. Please try again.");
      else {
        const session = await authClient.getSession();
        if (session.data?.user) window.location.reload();
        else setAuthError("Check your email to verify your account, then sign in here.");
      }
    } catch { setAuthError("Could not connect. Please try again."); }
    finally { setAuthBusy(false); }
  }


  function startWorkout(selected: PlanId, selectedMode: TrainingMode = trainingMode) {
    const mode = selected === "R" ? "home" : selectedMode;
    const savedChoice = window.localStorage.getItem(STORAGE_CHOICE_STORAGE);
    if (!storageReady) return;
    if (!syncKey && savedChoice !== "local") {
      setPendingWorkout({ planId: selected, mode });
      setStorageChoiceOpen(true);
      return;
    }
    beginWorkout(selected, mode);
  }

  function beginWorkout(selected: PlanId, selectedMode: TrainingMode) {
    const mode = selected === "R" ? "home" : selectedMode;
    const selectedExercises = selected === "R"
      ? [getRecoveryExercise(recoveryExerciseId)]
      : previewOrders[`${selected}:${mode}`] ?? getPlanExercises(plans[selected], mode);
    setPlanId(selected);
    setActiveMode(mode);
    setActiveRecoveryExerciseId(recoveryExerciseId);
    setDraft(emptyDraft(selectedExercises, latestByExercise));
    setCurrentIndex(0);
    const workoutStartedAt = new Date().toISOString();
    setStartedAt(workoutStartedAt);
    elapsedSecondsRef.current = 0;
    setElapsedSeconds(0);
    setRestLeft(0);
    setRestRunning(false);
    setActive(true);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0 }));
  }

  async function pauseWorkout() {
    await writeActiveWorkout({
      id: "active",
      planId,
      mode: activeMode,
      currentIndex,
      draft,
      startedAt,
      elapsedSeconds: elapsedSecondsRef.current,
      recoveryExerciseId: planId === "R" ? activeRecoveryExerciseId : undefined,
      updatedAt: new Date().toISOString(),
    });
    setActive(false);
    setView("plan");
    window.scrollTo({ top: 0 });
  }

  async function discardPausedWorkout() {
    await clearActiveWorkout();
    setDraft({});
    setCurrentIndex(0);
    setStartedAt("");
    elapsedSecondsRef.current = 0;
    setElapsedSeconds(0);
    setPlanId(nextPlanId(history));
  }

  function updateSet(exerciseId: string, index: number, field: keyof SetLog, value: string | boolean) {
    setDraft((previous) => ({
      ...previous,
      [exerciseId]: previous[exerciseId].map((set, setIndex) =>
        setIndex === index ? { ...set, [field]: value } : set,
      ),
    }));
  }

  function completeSet(index: number) {
    if (!currentExercise || !currentPlanExercise) return;
    const set = draft[currentExercise.id][index];
    const nextDone = !set.done;
    updateSet(currentExercise.id, index, "done", nextDone);
    if (nextDone && currentPlanExercise.restSeconds > 0) {
      setRestLeft(currentPlanExercise.restSeconds);
      setRestRunning(true);
    }
  }

  function chooseExercise(index: number) {
    setCurrentIndex(index);
    setRestLeft(0);
    setRestRunning(false);
    window.scrollTo({ top: 0 });
  }

  function movePreviewExercise(index: number, offset: -1 | 1) {
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= previewExercises.length) return;
    setPreviewOrders((previous) => {
      const next = [...(previous[previewOrderKey] ?? defaultPreviewExercises)];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return { ...previous, [previewOrderKey]: next };
    });
  }

  function lastSetPlaceholder(exerciseId: ExerciseId, index: number, field: "weight" | "reps") {
    const previous = latestByExercise[exerciseId]?.sets[index];
    return previous?.[field] || (field === "weight" ? "kg" : "reps");
  }

  function lastSummary(exerciseId: ExerciseId) {
    const previous = latestByExercise[exerciseId];
    if (!previous) return "No saved sets yet";
    return previous.sets
      .filter((set) => set.done)
      .map((set) => formatLoggedSet(exerciseId, set))
      .join(" · ");
  }

  async function finishWorkout() {
    if (savingWorkout) return;
    setSavingWorkout(true);
    setSaveError("");
    try {
      const session: WorkoutSession = {
        id: startedAt || crypto.randomUUID(),
        planId,
        mode: activeMode,
        startedAt: startedAt || undefined,
        endedAt: new Date().toISOString(),
        durationSeconds: elapsedSecondsRef.current,
        logs: activePlanExercises.map((item) => ({
          exerciseId: item.exerciseId,
          sets: draft[item.exerciseId],
        })),
      };
      await writeSession(session);
      setSyncStatus(syncKey ? "syncing" : "local");
      await clearActiveWorkout();
      const sessions = await readHistory();
      setHistory(sessions);
      setPlanId(nextPlanId(sessions));
      setDraft({});
      setCurrentIndex(0);
      setStartedAt("");
      elapsedSecondsRef.current = 0;
      setElapsedSeconds(0);
      setActive(false);
      setView("history");
    } catch { setSaveError("Could not save on this device. Your workout is still open; please try again."); }
    finally { setSavingWorkout(false); }
  }

  if (active && currentExercise && currentPlanExercise) {
    const sets = draft[currentExercise.id] || [];
    const allDone = sets.every((set) => set.done);
    const workoutDone = completedExerciseCount === activePlanExercises.length;
    const nextIncompleteIndex = activePlanExercises.findIndex((item, index) =>
      index > currentIndex
      && !(draft[item.exerciseId]?.length > 0 && draft[item.exerciseId].every((set) => set.done))
    );
    const firstIncompleteIndex = activePlanExercises.findIndex((item) =>
      !(draft[item.exerciseId]?.length > 0 && draft[item.exerciseId].every((set) => set.done))
    );

    return (
      <main className="workout-mode">
        <header className="workout-header">
          <button
            className="text-button"
            onClick={() => void pauseWorkout()}
          >
            Pause
          </button>
          <div>
            <span>
              {plan.label} · {planId === "R" ? "Anywhere" : activeMode === "gym" ? "At gym" : "At home"}
            </span>
            <strong>
              {completedExerciseCount} of {activePlanExercises.length} done · {formatTimer(elapsedSeconds)}
            </strong>
          </div>
          <div
            className="progress-ring"
            role="progressbar"
            aria-label="Workout progress"
            aria-valuenow={completedExerciseCount}
            aria-valuemin={0}
            aria-valuemax={activePlanExercises.length}
          >
            {Math.round((completedExerciseCount / activePlanExercises.length) * 100)}%
          </div>
        </header>

        <label className="exercise-picker">
          <span>Choose exercise</span>
          <select
            aria-label="Choose exercise"
            value={currentIndex}
            onChange={(event) => chooseExercise(Number(event.target.value))}
          >
            {activePlanExercises.map((item, index) => (
              <option key={item.exerciseId} value={index}>
                {draft[item.exerciseId]?.every((set) => set.done) ? "✓ " : ""}
                {index + 1}. {exercises[item.exerciseId].name}
              </option>
            ))}
          </select>
        </label>

        <section className="focus-card">
          <div className="focus-image-wrap">
            {exerciseVisual(currentExercise, "focus-image")}
          </div>
          <div className="focus-title-row">
            <div>
              <p className="eyebrow">{currentExercise.equipment}</p>
              <h1>{currentExercise.name}</h1>
              <p>{currentExercise.muscle}</p>
            </div>
            <div className="target-chip">
              <strong>{currentPlanExercise.sets}</strong>
              <span>
                sets × {currentPlanExercise.min}–{currentPlanExercise.max}
                {currentExercise.timed ? " min" : " reps"}
              </span>
            </div>
          </div>

          <div className="last-time">
            <span>Last time</span>
            <strong>{lastSummary(currentExercise.id)}</strong>
          </div>

          {completedExerciseCount === 0 && planId !== "R" && (
            <div className="warmup-inline">
              <strong>Warm-up sets do not count</strong>
              <span>
                {activeMode === "gym"
                  ? "Walk or cycle for 5 minutes. Then do 8–10 light reps and 3–5 medium reps before this exercise."
                  : "March for 3 minutes. Then do 8 easy squats, 8 unloaded hip hinges, and 5 wall push-ups."}
              </span>
            </div>
          )}

          {history.length === 0 && (
            <p className="editable-defaults-note">
              {currentExercise.timed ? "Enter the minutes you completed, then mark the activity done." : "Edit the suggested values. Stop each set when you could still do two clean reps."}
            </p>
          )}

          <div className="set-list">
            {sets.map((set, index) => (
              <div className={`set-row ${currentExercise.usesWeight ? "has-weight" : "no-weight"} ${currentExercise.timed ? "is-timed" : ""} ${set.done ? "is-done" : ""}`} key={index}>
                <span className="set-number">{index + 1}</span>
                {currentExercise.usesWeight && (
                  <label className="set-field-weight">
                    <span>{currentExercise.weightLabel ?? "kg"}</span>
                    <input
                      inputMode="decimal"
                      value={set.weight}
                      placeholder={lastSetPlaceholder(currentExercise.id, index, "weight")}
                      onChange={(event) => updateSet(currentExercise.id, index, "weight", event.target.value)}
                    />
                  </label>
                )}
                <label className="set-field-reps">
                  <span>{currentExercise.timed ? "min" : "reps"}</span>
                  <input
                    inputMode="numeric"
                    value={set.reps}
                    placeholder={lastSetPlaceholder(currentExercise.id, index, "reps")}
                    onChange={(event) => updateSet(currentExercise.id, index, "reps", event.target.value)}
                  />
                </label>
                {!currentExercise.timed && (
                  <label className="set-field-rir">
                    <span>RIR</span>
                    <select
                      value={set.rir}
                      onChange={(event) => updateSet(currentExercise.id, index, "rir", event.target.value)}
                    >
                      <option value="4">4+</option>
                      <option value="3">3</option>
                      <option value="2">2</option>
                      <option value="1">1</option>
                      <option value="0">0</option>
                    </select>
                  </label>
                )}
                <button
                  className="set-check"
                  aria-label={set.done ? `Undo set ${index + 1}` : `Complete set ${index + 1}`}
                  onClick={() => completeSet(index)}
                >
                  {set.done ? "Completed" : "Mark done"}
                </button>
              </div>
            ))}
          </div>

          <div className="cue-box">
            <p className="eyebrow">Form check</p>
            <ul>
              {currentExercise.cues.map((cue) => (
                <li key={cue}>{cue}</li>
              ))}
            </ul>
            {formVideoLink(currentExercise)}
          </div>
        </section>

        {restLeft > 0 && (
          <aside className={`rest-timer ${restRunning ? "is-running" : ""}`}>
            <div>
              <span>Rest timer</span>
              <strong>{formatTimer(restLeft)}</strong>
            </div>
            <button onClick={() => setRestRunning((value) => !value)}>
              {restRunning ? "Pause" : "Resume"}
            </button>
            <button
              className="text-button"
              onClick={() => {
                setRestLeft(0);
                setRestRunning(false);
              }}
            >
              Skip
            </button>
          </aside>
        )}

        <div className="active-backup" role="status">{saveError || backupText}</div>
        <footer className="workout-actions">
          <button
            className="secondary-button"
            disabled={currentIndex === 0}
            onClick={() => chooseExercise(currentIndex - 1)}
          >
            Previous
          </button>
          {workoutDone ? (
            <button className="primary-button" onClick={finishWorkout} disabled={savingWorkout}>
              {savingWorkout ? "Saving…" : "Save workout"}
            </button>
          ) : (
            <button
              className="primary-button"
              onClick={() => chooseExercise(nextIncompleteIndex >= 0 ? nextIncompleteIndex : firstIncompleteIndex)}
            >
              {allDone ? "Next unfinished exercise" : "Skip for now"}
            </button>
          )}
        </footer>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar" id="top">
        <a className="brand" href="#top" aria-label="Rohan's Gym Guide home">
          <span className="brand-mark">RG</span>
          <span>
            <strong>{profile.name}&apos;s Gym Guide</strong>
            <small>Your plan. Your pace.</small>
          </span>
        </a>
        <div className="global-mode-switch" role="group" aria-label="Choose workout location">
          <button
            className={trainingMode === "gym" ? "active" : ""}
            aria-pressed={trainingMode === "gym"}
            onClick={() => setTrainingMode("gym")}
          >
            Gym
          </button>
          <button
            className={trainingMode === "home" ? "active" : ""}
            aria-pressed={trainingMode === "home"}
            onClick={() => setTrainingMode("home")}
          >
            Home
          </button>
        </div>
      </header>

      <nav className="section-tabs" aria-label="App sections">
        <button
          className={view === "plan" ? "active" : ""}
          aria-current={view === "plan" ? "page" : undefined}
          onClick={() => setView("plan")}
        >
          Workout
        </button>
        <button
          className={view === "guide" ? "active" : ""}
          aria-current={view === "guide" ? "page" : undefined}
          onClick={() => setView("guide")}
        >
          Guide
        </button>
        <button
          className={view === "equipment" ? "active" : ""}
          aria-current={view === "equipment" ? "page" : undefined}
          onClick={() => setView("equipment")}
        >
          Equipment
        </button>
        <button
          className={view === "history" ? "active" : ""}
          aria-current={view === "history" ? "page" : undefined}
          onClick={() => setView("history")}
        >
          Progress
        </button>
      </nav>
      <aside className={`backup-strip backup-${syncStatus}`} aria-label="Backup status">
        <span role="status"><i aria-hidden="true" />{backupText}</span>
        <button onClick={() => setSyncOpen(true)}>{accountId ? "Settings" : "Sign in & back up"}<span aria-hidden="true"> ↗</span></button>
      </aside>
      {(view === "plan" || view === "history") && <section className="progress-overview" aria-label="Your training dashboard">
        <div className="progress-intro"><div><p className="eyebrow">Last 7 days</p><h2>{"Your week in training."}</h2></div>
          {view === "plan" && <button className="text-button" onClick={() => setView("history")}>Your progress <span aria-hidden="true">→</span></button>}
        </div>
        <div className="progress-stats">
          <article><span>Strength sessions</span><strong>{storageReady ? strengthThisWeek : "—"}<small> / 3</small></strong><div className="week-dots" aria-label={`${strengthThisWeek} of 3 weekly sessions`}>{[0, 1, 2].map((index) => <i key={index} className={strengthThisWeek > index ? "done" : ""} />)}</div></article>
          <article><span>Completed sets</span><strong>{storageReady ? completedSets : "—"}</strong><small>Every set counts</small></article>
          <article><span>Training time</span><strong>{storageReady ? trainingMinutes : "—"}<small> min</small></strong><small>From recorded sessions</small></article>
        </div>
        {storageReady && history.length === 0 && <p className="progress-note">Your saved workouts will appear here. Already tracking on another device? Sign in there to bring them over.</p>}
      </section>}


      {view === "plan" && (
        <section className="content-section plan-content" id="training-plan">
          {hasPausedWorkout && (
            <aside className="resume-card">
              <div>
                <span>Workout paused</span>
                <strong>{plan.label} · exercise {currentIndex + 1} of {activePlanExercises.length}</strong>
              </div>
              <div className="resume-actions">
                <button className="text-button" onClick={() => void discardPausedWorkout()}>
                  Discard
                </button>
                <button className="primary-button" onClick={() => setActive(true)}>
                  Resume
                </button>
              </div>
            </aside>
          )}

          <div className="plan-picker" role="group" aria-label="Choose workout day">
            {strengthPlanIds.map((id) => (
              <button
                key={id}
                aria-pressed={planId === id}
                className={planId === id ? "active" : ""}
                disabled={hasPausedWorkout}
                onClick={() => setPlanId(id)}
              >
                {plans[id].label}
              </button>
            ))}
          </div>

          {planId === "R" && (
            <button className="back-to-strength" disabled={hasPausedWorkout} onClick={() => setPlanId(nextPlanId(history))}>
              ← Back to workouts
            </button>
          )}

          <article className={`plan-intro ${planId === "R" ? "recovery-intro" : ""}`}>
            <div>
              <p className="eyebrow">
                {plan.label} · {planId === "R" ? "Anywhere" : previewMode === "gym" ? "Gym" : "Home"}
              </p>
              <h2>{plan.title}</h2>
            </div>
            <div className="plan-meta">
              <span>{planId === "R" ? selectedRecovery.duration : plan.duration}</span>
              <span>{planId === "R" ? "Choose one" : `${previewExercises.length} exercises`}</span>
              <span>{planId === "R" ? "2–3/10 effort" : "Keep 2 reps left"}</span>
            </div>
            {planId !== "R" && (
              <button className="primary-button" disabled={hasPausedWorkout} onClick={() => startWorkout(planId, previewMode)}>
                Start {plan.label}
              </button>
            )}
          </article>

          {planId === "R" && (
            <>
              <section className="recovery-chooser" aria-labelledby="recovery-options-heading">
                <div className="recovery-chooser-heading">
                  <h3 id="recovery-options-heading">Pick one easy option</h3>
                  <p>Choose what feels best today. Complete rest is also valid.</p>
                </div>
                <div className="recovery-options" role="group" aria-label="Choose a recovery activity">
                  {recoveryOptions.map((option) => (
                    <button
                      key={option.exerciseId}
                      className={option.exerciseId === recoveryExerciseId ? "active" : ""}
                      aria-pressed={option.exerciseId === recoveryExerciseId}
                      disabled={hasPausedWorkout}
                      onClick={() => setRecoveryExerciseId(option.exerciseId)}
                    >
                      <span>{option.label}</span>
                      <strong>{option.duration}</strong>
                      <small>{option.description}</small>
                    </button>
                  ))}
                </div>
                <button
                  className="primary-button recovery-start-button"
                  disabled={hasPausedWorkout}
                  onClick={() => startWorkout("R", "home")}
                >
                  Start {selectedRecovery.duration.toLowerCase()} {selectedRecovery.label.toLowerCase()}
                </button>
              </section>

              <div className="recovery-basics" aria-label="Recovery priorities">
                <article>
                  <span>1</span>
                  <strong>Sleep</strong>
                  <p>Get at least 7 hours tonight. Sleep longer if you are catching up.</p>
                </article>
                <article>
                  <span>2</span>
                  <strong>Protein</strong>
                  <p>Reach {profile.proteinMinimumG}–{profile.proteinMaximumG} g across normal meals. Whey only fills a gap.</p>
                </article>
                <article>
                  <span>3</span>
                  <strong>Keep it easy</strong>
                  <p>Stay at 2–3/10 effort. You should be able to speak in full sentences.</p>
                </article>
              </div>

              <aside className="complete-rest-card">
                <strong>Take complete rest when you need it.</strong>
                <p>If you feel run-down, slept poorly, or easy movement makes you feel worse, skip it. Rest is part of the plan.</p>
              </aside>

              <details className="evidence-card">
                <summary>Why these options?</summary>
                <div>
                  <p>Walking and cycling add easy aerobic activity without turning your rest day into another hard session.</p>
                  <p>Mobility can feel good when you are stiff, but stretching does not reliably reduce soreness or speed strength recovery.</p>
                  <p>
                    Sources: <a href="https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/current-guidelines/top-10-things-know" target="_blank" rel="noreferrer">adult activity guidelines</a>,{" "}
                    <a href="https://aasm.org/resources/pdf/adultsleepdurationconsensus.pdf" target="_blank" rel="noreferrer">sleep consensus</a>,{" "}
                    <a href="https://pubmed.ncbi.nlm.nih.gov/28642676/" target="_blank" rel="noreferrer">protein position stand</a>, and{" "}
                    <a href="https://pubmed.ncbi.nlm.nih.gov/34025459/" target="_blank" rel="noreferrer">stretching review</a>.
                  </p>
                </div>
              </details>
            </>
          )}

          {planId !== "R" && (
            <details className="warmup-card">
              <summary>
                <span>Warm up</span>
                <strong>{previewMode === "gym" ? "5 min + 2 light sets" : "3 min + 3 easy movements"}</strong>
              </summary>
              <p>
                {previewMode === "gym"
                  ? "Walk or cycle for 5 minutes. For exercise 1, do 8–10 light reps, then 3–5 medium reps."
                  : "March for 3 minutes. Then do 8 squats, 8 hip hinges, and 5 wall push-ups."}
              </p>
            </details>
          )}

          {planId !== "R" && (
            <>
              <div className="exercise-order-heading">
                <strong>Exercise order</strong>
                <span>Use Earlier and Later to change it.</span>
              </div>
              <div className="exercise-grid">
                {previewExercises.map((item, index) => {
                  const exercise = exercises[item.exerciseId];
                  return (
                    <article className="exercise-card" key={exercise.id}>
                      <button className="card-image-button" onClick={() => setSelectedImage(exercise)}>
                        {exerciseVisual(exercise)}
                        <span className="sequence">{String(index + 1).padStart(2, "0")}</span>
                      </button>
                      <div className="exercise-card-body">
                        <p className="eyebrow">{exercise.equipment}</p>
                        <h3>{exercise.name}</h3>
                        <p className="muscle-line">{exercise.muscle}</p>
                        <div className="prescription">
                          <strong>{item.sets}</strong>
                          <span>
                            sets × {item.min}–{item.max} {exercise.timed ? "min" : "reps"}
                          </span>
                          <em>{Math.round(item.restSeconds / 30) / 2} min rest</em>
                        </div>
                        <div className="previous-line">
                          <span>Last</span>
                          <strong>{lastSummary(exercise.id)}</strong>
                        </div>
                        <p className="single-cue">{exercise.cues[0]}</p>
                      </div>
                      <div className="exercise-order-controls" aria-label={`Reorder ${exercise.name}`}>
                        <button
                          disabled={index === 0 || hasPausedWorkout}
                          aria-label={`Move ${exercise.name} earlier`}
                          onClick={() => movePreviewExercise(index, -1)}
                        >
                          <span aria-hidden="true">↑</span> Earlier
                        </button>
                        <button
                          disabled={index === previewExercises.length - 1 || hasPausedWorkout}
                          aria-label={`Move ${exercise.name} later`}
                          onClick={() => movePreviewExercise(index, 1)}
                        >
                          <span aria-hidden="true">↓</span> Later
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {planId !== "R" && (
            <button className="easy-walk-link" disabled={hasPausedWorkout} onClick={() => setPlanId("R")}>
              Rest day options <span>→</span>
            </button>
          )}

        </section>
      )}

      {view === "guide" && (
        <section className="content-section guide-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">How to use the plan</p>
              <h2>Four rules</h2>
            </div>
            <p>Read this once. During the workout, follow the exercises in order.</p>
          </div>

          <div className="guide-grid">
            <article>
              <span>1</span>
              <h3>Choose the next day</h3>
              <p>Follow Day 1, Day 2, then Day 3. Continue where you stopped.</p>
            </article>
            <article>
              <span>2</span>
              <h3>Use a manageable weight</h3>
              <p>Finish the set when you could still do two clean reps.</p>
            </article>
            <article>
              <span>3</span>
              <h3>Save every set</h3>
              <p>Enter the weight and reps you completed. The app uses them next time.</p>
            </article>
            <article>
              <span>4</span>
              <h3>Rest between gym days</h3>
              <p>Train three days each week. Take a rest day between sessions when you can.</p>
            </article>
          </div>

          <aside className="progression-card guide-progress-card">
            <p className="eyebrow">How to improve</p>
            <h2>Keep the weight. Add one rep.</h2>
            <div className="progress-example">
              <div>
                <span>This workout</span>
                <strong>30 kg · 10, 9, 8 reps</strong>
              </div>
              <div>
                <span>Next workout</span>
                <strong>30 kg · aim for 11, 10, 9</strong>
              </div>
              <div>
                <span>After you reach 12, 12, 12</span>
                <strong>Add the smallest weight. Start near 8 reps again.</strong>
              </div>
            </div>
          </aside>

          <aside className="guide-after-card">
            <strong>After training</strong>
            <p>Walk for 5–10 minutes if you want. Eat a normal meal with protein and carbohydrates.</p>
          </aside>
        </section>
      )}

      {view === "equipment" && (
        <section className="content-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your gym</p>
              <h2>Five machines you need</h2>
            </div>
            <p>The machine labels in your photos confirm each movement below.</p>
          </div>
          <div className="equipment-grid">
            {equipmentIds.map((id, index) => {
              const exercise = exercises[id];
              return (
                <button className="equipment-card" key={id} onClick={() => setSelectedImage(exercise)}>
                  <img src={assetPath(exercise.image)} alt={exercise.name} />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{exercise.name}</h3>
                    <p>{exercise.muscle}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <article className="wide-photo-card">
            <img src={assetPath("/gym/machine-lineup.jpeg")} alt="The machine line in your gym" />
            <div>
              <p className="eyebrow">No barbell required</p>
              <h2>This room is enough.</h2>
              <p>The five machines, dumbbells, and benches cover every major muscle group in this plan.</p>
            </div>
          </article>
        </section>
      )}



      {view === "history" && (
        <section className="content-section history-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Workout history</p>
              <h2>Your training, at a glance</h2>
            </div>
            <div className="history-sync">
              <p>
                {syncStatus === "synced"
                  ? `Backup verified at ${lastSynced}. ${history.length} saved workouts.`
                  : syncStatus === "syncing" ? "Backing up your workouts…"
                  : syncStatus === "error" ? "Backup pending. Device records are safe; reconnect or sign in to retry."
                  : "Saved on this device only. Sign in to back up existing and future workouts."}
              </p>
              <button
                className={`sync-button sync-${syncStatus}`}
                onClick={() => {

                  setSyncOpen(true);
                }}
              >
                {syncKey
                  ? syncStatus === "syncing"
                    ? "Syncing"
                    : syncStatus === "error"
                      ? "Fix sync"
                      : "Backup settings"
                  : "Back up and sync"}
              </button>
            </div>
          </div>
          <article className="consistency-card">
            <div className="consistency-heading">
              <div>
                <span>Last 12 weeks</span>
                <h3>Your consistency</h3>
              </div>
              <strong>{heatmapStrengthCount} strength sessions</strong>
            </div>
            <div className="heatmap-wrap">
              <div className="heatmap-labels" aria-hidden="true">
                <span>M</span><span /><span>W</span><span /><span>F</span><span /><span>S</span>
              </div>
              <div className="heatmap-grid" aria-label="Workout activity during the last 12 weeks">
                {heatmapDays.map((day) => {
                  const activityClass = day.strengthSessions > 0 && day.recoverySessions > 0
                    ? "mixed"
                    : day.strengthSessions > 0
                      ? "strength"
                      : day.recoverySessions > 0
                        ? "recovery"
                        : "";
                  const sessionCount = day.strengthSessions + day.recoverySessions;
                  return (
                    <span
                      key={day.date}
                      className={activityClass}
                      role="img"
                      aria-label={`${day.label}: ${sessionCount === 0 ? "no activity" : `${day.strengthSessions} strength and ${day.recoverySessions} recovery sessions`}`}
                      title={`${day.label}: ${sessionCount === 0 ? "No activity" : `${day.strengthSessions} strength, ${day.recoverySessions} recovery`}`}
                    />
                  );
                })}
              </div>
            </div>
            <div className="heatmap-legend" aria-hidden="true">
              <span><i className="strength" />Strength</span>
              <span><i className="recovery" />Recovery</span>
            </div>
          </article>
          {history.length === 0 ? (
            <div className="empty-state">
              <span>00</span>
              <h3>No saved workouts yet</h3>
              <p>Complete Day 1 to create your first record.</p>
              <button className="primary-button" onClick={() => startWorkout("A", "gym")}>
                Start Day 1 at gym
              </button>
            </div>
          ) : (
            <div className="history-list">
              {history.map((session) => (
                <article className="history-card" key={session.id}>
                  <div className="history-date">
                    <span>{session.planId === "R" ? "R" : session.planId}</span>
                    <div>
                      <strong>{plans[session.planId].label}</strong>
                      <small className="history-mode">
                        {session.planId === "R" ? "Recovery" : (session.mode ?? "gym") === "gym" ? "At gym" : "At home"}
                      </small>
                      <small>{formatDate(session.endedAt)}</small>
                      <small className="history-duration">
                        {session.durationSeconds === undefined
                          ? "Duration not tracked"
                          : formatDuration(session.durationSeconds)}
                      </small>
                    </div>
                  </div>
                  <div className="history-exercises">
                    {session.logs.map((log) => (
                      <div key={log.exerciseId}>
                        <span>{exercises[log.exerciseId].name}</span>
                        <strong>
                          {log.sets
                            .filter((set) => set.done)
                            .map((set) => formatLoggedSet(log.exerciseId, set))
                            .join(" · ") || "Skipped"}
                        </strong>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <footer className="site-footer">
        <p>Stop if you feel sharp pain. Get medical help for chest pain, fainting, or unusual breathing trouble.</p>
      </footer>

      {storageChoiceOpen && (
        <div className="sync-modal" role="dialog" aria-modal="true" aria-label="Choose workout storage">
          <button
            className="modal-backdrop"
            aria-label="Close storage choice"
            onClick={() => {
              setStorageChoiceOpen(false);
              setPendingWorkout(null);
            }}
          />
          <div className="sync-card storage-choice-card">
            <p className="eyebrow">Before your first workout</p>
            <h2>Where should we save it?</h2>
            <p>The full guide works without an account. Choose how you want to keep your history.</p>
            <div className="storage-options">
              <button
                className="storage-option"
                onClick={() => {
                  window.localStorage.setItem(STORAGE_CHOICE_STORAGE, "local");
                  setStorageChoiceOpen(false);
                  if (pendingWorkout) beginWorkout(pendingWorkout.planId, pendingWorkout.mode);
                  setPendingWorkout(null);
                }}
              >
                <strong>Use this device</strong>
                <span>No login. Your browser stores the history.</span>
              </button>
              <button
                className="storage-option is-cloud"
                onClick={() => {

                  setStorageChoiceOpen(false);
                  setSyncOpen(true);
                }}
              >
                <strong>Back up and sync</strong>
                <span>Use the same account on your phone and laptop.</span>
              </button>
            </div>
            <small>Clearing browser data can remove device-only history.</small>
          </div>
        </div>
      )}

      {syncOpen && (
        <div className="sync-modal" role="dialog" aria-modal="true" aria-label="Cloud sync">
          <button className="modal-backdrop" aria-label="Close sync settings" onClick={() => setSyncOpen(false)} />
          <div className="sync-card">
            <button className="modal-close" onClick={() => setSyncOpen(false)}>Close</button>
            <p className="eyebrow">Workout backup</p>
            <h2>{accountId ? "Your account backup" : "Sign in once. Keep your workouts."}</h2>
            <p>Your completed workouts and paused session sync to your account. Open this page and sign in on each device that has existing records.</p>
            {!accountId && <>
              <button className="primary-button auth-google" disabled={authBusy} onClick={async () => {
                setAuthBusy(true); setAuthError("");
                try {
                  const result = await authClient.signIn.social({ provider: "google", callbackURL: window.location.origin + "/workout" });
                  if (result.error) setAuthError(result.error.message || "Google sign-in is unavailable. Use email below.");
                } catch { setAuthError("Google sign-in is unavailable. Use email below."); }
                finally { setAuthBusy(false); }
              }}>Continue with Google</button>
              <div className="auth-divider">or use email</div>
              <form onSubmit={submitLogin} className="auth-form">
                <label><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
                <label><span>Password</span><input name="password" type="password" autoComplete={signUp ? "new-password" : "current-password"} minLength={8} required /></label>
                <button className="secondary-button" disabled={authBusy}>{authBusy ? "Please wait…" : signUp ? "Create account & back up" : "Sign in & back up"}</button>
              </form>
              <button className="text-button" onClick={() => { setSignUp(!signUp); setAuthError(""); }}>{signUp ? "Already have an account? Sign in" : "New here? Create an account"}</button>
            </>}
            {accountId && <button className="secondary-button" onClick={async () => {
              const result = await authClient.signOut();
              if (result.error) { setSyncStatus("error"); return; }
              window.localStorage.removeItem("workout-account");
              window.location.reload();
            }}>Sign out</button>}
            {authError && <p className="sync-error" role="alert">{authError}</p>}
            {syncStatus === "error" && <p className="sync-error" role="status">Backup is pending. Your device records have been kept.</p>}
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="image-modal" role="dialog" aria-modal="true" aria-label={selectedImage.name}>
          <button className="modal-backdrop" aria-label="Close image" onClick={() => setSelectedImage(null)} />
          <div className="modal-card">
            <button className="modal-close" onClick={() => setSelectedImage(null)}>
              Close
            </button>
            <div className="modal-visual">{exerciseVisual(selectedImage)}</div>
            <div className="modal-copy">
              <p className="eyebrow">{selectedImage.equipment}</p>
              <h2>{selectedImage.name}</h2>
              <ul>
                {selectedImage.cues.map((cue) => (
                  <li key={cue}>{cue}</li>
                ))}
              </ul>
              {formVideoLink(selectedImage)}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
