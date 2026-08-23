"use client";

import { useEffect, useRef, useCallback } from "react";

export interface VehicleInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
}

export function useVehicleControls() {
  const input = useRef<VehicleInput>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        input.current.forward = true;
        break;
      case "KeyS":
      case "ArrowDown":
        input.current.backward = true;
        break;
      case "KeyA":
      case "ArrowLeft":
        input.current.left = true;
        break;
      case "KeyD":
      case "ArrowRight":
        input.current.right = true;
        break;
      case "Space":
        input.current.brake = true;
        break;
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        input.current.forward = false;
        break;
      case "KeyS":
      case "ArrowDown":
        input.current.backward = false;
        break;
      case "KeyA":
      case "ArrowLeft":
        input.current.left = false;
        break;
      case "KeyD":
      case "ArrowRight":
        input.current.right = false;
        break;
      case "Space":
        input.current.brake = false;
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return input;
}
