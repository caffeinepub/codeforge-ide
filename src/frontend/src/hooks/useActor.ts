/**
 * Pre-bound useActor hook for this project's backend.
 * Wraps @caffeineai/core-infrastructure useActor with the project createActor.
 */
import { useActor as _useActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";

export function useActor() {
  return _useActor(createActor);
}
