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
import { Box, Flex, HStack, Spacer, VStack } from "@chakra-ui/react";
import {
  useHashParamJson,
  useHashParamBase64,
} from "@metapages/metaframe-hook";
import { Editor } from "./components/Editor";
import { Option, OptionsMenuButton } from "./components/OptionsMenu";
import { CodeResults } from "./components/CodeResults";
import { useStore } from "./store";
import { useExecuteCodeWithMetaframe } from "./hooks/useExecuteCodeWithMetaframe";
import { ButtonRun } from "./components/ButtonRun";
import { ButtonHelp } from "./components/ButtonHelp";

const appOptions: Option[] = [
  {
    name: "mode",
    displayName: "Editor code mode",
    default: "json",
    type: "option",
    options: ["json", "javascript", "python", "sh"],
  },
  {
    name: "noautorun",
    displayName: "Only run when Run is clicked",
    default: false,
    type: "boolean",
  },
  {
    name: "theme",
    displayName: "Light/Dark theme",
    default: "light",
    type: "option",
    options: ["light", "vs-dark"],
  },
  {
    name: "hideeditor",
    displayName: "Hide editor",
    default: false,
    type: "boolean",
  },
];

type OptionBlob = {
  mode: string;
  noautorun: boolean;
  theme: string;
  hideeditor: boolean;
};

export const App: FunctionalComponent = () => {
  // metaframe configuration
  const [options] = useHashParamJson<OptionBlob>("options", {
    mode: "json",
    noautorun: false,
    theme: "light",
    hideeditor: false,
  });
  const codeInStore = useStore((state) => state.code);
  const setCodeInStore = useStore((state) => state.setCode);
  const [runCode] = useExecuteCodeWithMetaframe();

  // Split these next two otherwise editing is too slow as it copies to/from the URL
  const [valueHashParam, setValueHashParam] = useHashParamBase64(
    "text",
    undefined
  );

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
      {options?.hideeditor ? (
        menu
      ) : (
        <HStack spacing={2} alignItems="flex-start">
          <Box w="70%">
            <Editor
              mode={options?.mode || "json"}
              theme={options?.theme || "light"}
              setValue={setCodeInStore}
              value={codeInStore}
            />
          </Box>

          <Box w="30%">{menu}</Box>
        </HStack>
      )}
    </Box>
  );
};
