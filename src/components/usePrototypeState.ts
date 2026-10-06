"use client";

import { useSyncExternalStore } from "react";
import {
  getPrototypeClientSnapshot,
  getPrototypeServerSnapshot,
  subscribePrototypeStore,
} from "@/lib/storage";

export function usePrototypeState() {
  return useSyncExternalStore(
    subscribePrototypeStore,
    getPrototypeClientSnapshot,
    getPrototypeServerSnapshot,
  );
}
