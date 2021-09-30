import create from "zustand";
import { CodeResult } from "./hooks/codeHooks";

export type MessagePayload = {
  message: string;
  type: "error" | "warning" | "info";
  messages?: string[];
};

export enum Mode {
  Start,
  Editing,
  Running,
  Finished,
}

export type StoreState = {
  code: string | undefined;
  result: CodeResult<any> | undefined;
  mode: Mode;
  setCode: (code: string | undefined) => void;
  setResult: (result: CodeResult<any> | undefined) => void;
  setMode: (mode: Mode) => void;
};

export const useStore = create<StoreState>((set) => ({
  code: undefined,
  result: undefined,
  mode: Mode.Start,
  setCode: (code: string | undefined) => set((state) => ({ code })),
  setResult: (result: CodeResult<any> | undefined) =>
    set((state) => ({ result })),
  setMode: (mode: Mode) => set((state) => ({ mode })),
}));
