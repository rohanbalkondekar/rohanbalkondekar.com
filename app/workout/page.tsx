import { WorkoutGuide } from "./workout-guide";
import "./workout.css";
export const metadata = { title: "Workout · Rohan", description: "Your workout plan, progress, and private backup.", icons: { icon: [{ url: "/workout/icon-rg-96.png", sizes: "96x96", type: "image/png" }, { url: "/workout/icon.svg", type: "image/svg+xml" }], apple: "/workout/apple-touch-icon.png" }, appleWebApp: { title: "Workout" } };
export default function Workout() { return <WorkoutGuide />; }
