"use client";

import { useEffect, useRef } from "react";

export interface VehicleInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
}

const KEY_BINDINGS: Record<string, keyof VehicleInput> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  Space: "brake",
};

const IDLE_INPUT: VehicleInput = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  brake: false,
};

/** True while the user is typing, so WASD in a form never drives the buggy. */
function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

/**
 * Keyboard driving input.
 *
 * @param enabled when false the buggy coasts to a stop — used to freeze the
 *   world while an interactive pavilion modal is open.
 */
export function useVehicleControls(enabled: boolean = true) {
  const input = useRef<VehicleInput>({ ...IDLE_INPUT });

  useEffect(() => {
    if (!enabled) {
      input.current = { ...IDLE_INPUT };
      return;
    }

    const setKey = (e: KeyboardEvent, pressed: boolean) => {
      const action = KEY_BINDINGS[e.code];
      if (!action) return;
      if (pressed && isTypingTarget(e.target)) return;
      // Space and arrows otherwise scroll the page behind the canvas.
      if (e.code === "Space" || e.code.startsWith("Arrow")) e.preventDefault();
      input.current[action] = pressed;
    };

    const handleKeyDown = (e: KeyboardEvent) => setKey(e, true);
    const handleKeyUp = (e: KeyboardEvent) => setKey(e, false);
    // Alt-tabbing away must not leave a key latched down.
    const handleBlur = () => {
      input.current = { ...IDLE_INPUT };
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      input.current = { ...IDLE_INPUT };
    };
  }, [enabled]);

  return input;
}
