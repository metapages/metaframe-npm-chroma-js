import { useCallback, useEffect } from "preact/hooks";
import { execJsCode } from "../hooks/codeHooks";
import { Mode, useStore } from "../store";
import { useMetaframe } from "@metapages/metaframe-hook";
import * as hashParamUtils from "@metapages/metaframe-hook";
import chroma from 'chroma-js';

// Exports lazy code executor
export const useExecuteCodeWithMetaframe: () => [
  (c: string | undefined) => Promise<void>,
  any
] = () => {
  const metaframeObject = useMetaframe();
  const setMode = useStore((state) => state.setMode);
  const setResult = useStore((state) => state.setResult);
  const result = useStore((state) => state.result);

  // if new results, cancel existing running code
  useEffect(() => {
    return () => {
      if (result?.result && typeof result?.result === "function") {
        try {
          result.result();
        } catch (err) {
          console.error("Failed to cancel without error:", err);
        }
      }
    };
  }, [result]);

  const execute = useCallback(
    async (code: string | undefined) => {
      if (!code || code.trim().length === 0) {
        setMode(Mode.Finished);
        setResult(undefined);
        return;
      }
      if (!metaframeObject.metaframe) {
        return;
      }
      setResult(undefined);
      try {
        const result = await execJsCode(code, {
          metaframe: metaframeObject.metaframe,
          chroma,
          HASHTOOLS: hashParamUtils,
        });
        setResult(result);
      } catch (err) {
        console.error(err);
        setResult({ failure: { error: err } });
      }
      setMode(Mode.Finished);
    },
    [metaframeObject.metaframe, setMode, setResult]
  );

  return [execute, result];
};
