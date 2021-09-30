/**
 * Simple:
 *  - any input sets
 *    - the content to the editor
 *    - the name to the input name
 *    - the save button is deactivated
 *  The save button sends the editor content to the same input name
 */

import { FunctionalComponent } from "preact";
import { useEffect } from "preact/hooks";
import { Box, Flex, Spacer, VStack } from "@chakra-ui/react";
import {
  useHashParamJson,
  useHashParamBase64,
} from "@metapages/metaframe-hook";
import { Editor } from "./components/Editor";
import { Option, OptionsMenuButton } from "./components/OptionsMenu";
import { CodeResults } from "./components/CodeResults";
import { Mode, useStore } from "./store";
import { useExecuteCodeWithMetaframe } from "./hooks/useExecuteCodeWithMetaframe";
import { ButtonRun } from "./components/ButtonRun";
import { ButtonHelp } from "./components/ButtonHelp";

const appOptions: Option[] = [
  {
    name: "theme",
    displayName: "Light/Dark theme",
    default: "light",
    type: "option",
    options: ["light", "vs-dark"],
  },
];

type OptionBlob = {
  theme: string;
};

export const App: FunctionalComponent = () => {
  // metaframe configuration
  const [options] = useHashParamJson<OptionBlob>("options", {
    theme: "light",
  });
  const codeInStore = useStore((state) => state.code);
  const setCodeInStore = useStore((state) => state.setCode);
  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);
  const [runCode] = useExecuteCodeWithMetaframe();

  // Split these next two otherwise editing is too slow as it copies to/from the URL
  const [valueHashParam] = useHashParamBase64("text", undefined);

  // If state === Mode.Start, transition to Mode.Running.
  // If there is no code, it's a no-op
  useEffect(() => {
    if (mode === Mode.Start) {
      setMode(Mode.Running);
    }
  }, [mode, setMode]);

  // If state === Mode.Running, exec the code
  useEffect(() => {
    if (mode !== Mode.Running) {
      return;
    }

    // The code values are the same, but the user clicked the button, so execute
    if (runCode) {
      runCode(codeInStore);
    }
  }, [mode, codeInStore, runCode]);

  // source of truth: the URL param #?text=<HashParamBase64>
  // if that changes, set the local value
  // the local value changes fast from editing
  useEffect(() => {
    setCodeInStore(valueHashParam);
    if (runCode) {
      runCode(valueHashParam);
    }
  }, [valueHashParam, setCodeInStore, runCode]);

  const menu = (
    <VStack spacing={2} alignItems="flex-start">
      <Flex width="100%">
        <ButtonRun />
        <Spacer />
        <ButtonHelp />
        <OptionsMenuButton options={appOptions} />
      </Flex>
      <CodeResults />
    </VStack>
  );

  return (
    <Box w="100%" p={2}>
      <VStack spacing={2} alignItems="flex-start">
        {mode === Mode.Editing ? (
          <Box w="100%">
            <Editor
              mode="javascript"
              theme={options?.theme || "light"}
              setValue={setCodeInStore}
              value={codeInStore}
            />
          </Box>
        ) : (
          <div id="render" />
        )}

        <Box w="30%">{menu}</Box>
      </VStack>
    </Box>
  );
};
