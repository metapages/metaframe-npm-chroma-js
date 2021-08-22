import create from "zustand";
import { CodeResult } from "./hooks/codeHooks";

export type MessagePayload = {
  message: string;
  type: "error" | "warning" | "info";
  messages?: string[];
};

export type StoreState = {
  code: string | undefined;
  result: CodeResult<any> | undefined;
  running: boolean;
  setCode: (code: string | undefined) => void;
  setResult: (result: CodeResult<any> | undefined) => void;
  setRunning: (running: boolean) => void;
};

export const useStore = create<StoreState>((set) => ({
  code: undefined,
  result: undefined,
  running: false,
  setCode: (code: string | undefined) => set((state) => ({ code })),
  setResult: (result: CodeResult<any> | undefined) =>
    set((state) => ({ result })),
  setRunning: (running: boolean) => set((state) => ({ running })),
}));
