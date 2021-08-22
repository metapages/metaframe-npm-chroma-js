import { useCallback, useEffect } from "preact/hooks";
import { execJsCode } from "../hooks/codeHooks";
import { useStore } from "../store";
import { useMetaframe } from "@metapages/metaframe-hook";

// Exports lazy code executor
export const useExecuteCodeWithMetaframe: () => [
  (c: string | undefined) => Promise<void>,
  boolean,
  any
] = () => {
  const metaframeObject = useMetaframe();
  const setRunning = useStore((state) => state.setRunning);
  const setResult = useStore((state) => state.setResult);
  const result = useStore((state) => state.result);
  const running = useStore((state) => state.running);

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
        setRunning(false);
        setResult(undefined);
        return;
      }
      if (!metaframeObject.metaframe) {
        return;
      }
      setRunning(true);
      setResult(undefined);
      try {
        const result = await execJsCode(code, {
          metaframe: metaframeObject.metaframe,
        });
        setResult(result);
      } catch (err) {
        console.error(err);
        setResult({ failure: { error: err } });
      }
      setRunning(false);
    },
    [metaframeObject.metaframe, setRunning, setResult]
  );

  return [execute, running, result];
};
