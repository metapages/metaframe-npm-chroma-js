import { FunctionalComponent } from "preact";
import { useCallback } from "preact/hooks";
import { Button } from "@chakra-ui/react";
import {
  MetaframeObject,
  useMetaframe,
  useHashParamBase64,
} from "@metapages/metaframe-hook";
import { useStore } from "../store";
import { useExecuteCodeWithMetaframe } from "../hooks/useExecuteCodeWithMetaframe";

export const ButtonRun: FunctionalComponent = () => {
  const metaframe: MetaframeObject = useMetaframe();
  const isRunning = useStore((state) => state.running);
  const codeInStore = useStore((state) => state.code);
  const [runCode] = useExecuteCodeWithMetaframe();

  // Split these next two otherwise editing is too slow as it copies to/from the URL
  const [valueHashParam, setValueHashParam] = useHashParamBase64(
    "text",
    undefined
  );

  const onRun = useCallback(() => {
    // If the values are different, update, this will trigger a new execution
    if (valueHashParam !== codeInStore) {
      setValueHashParam(codeInStore);
    } else {
      // The code values are the same, but the user clicked the button, so execute
      if (runCode) {
        runCode(codeInStore);
      }
    }
  }, [
    metaframe.setOutputs,
    isRunning,
    codeInStore,
    valueHashParam,
    runCode,
    setValueHashParam,
  ]);

  return (
    <Button colorScheme="blue" onClick={onRun}>
      Save + Run
    </Button>
  );
};
