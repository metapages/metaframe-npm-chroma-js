/**
 * Simple:
 *  - any input sets
 *    - the content to the editor
 *    - the name to the input name
 *    - the save button is deactivated
 *  The save button sends the editor content to the same input name
 */

import { h, FunctionalComponent } from "preact";
import { useEffect, useState, useCallback } from "preact/hooks";
import { config } from "ace-builds";
config.set(
  "basePath",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.4.8/src-noconflict/"
);
config.setModuleUrl(
  "ace/mode/json_worker",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.4.8/src-noconflict/worker-json.js"
);
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";

import {
  Badge,
  Box,
  Button,
  Code,
  Flex,
  Heading,
  VStack,
  Spacer,
  StackDivider,
} from "@chakra-ui/react";
import { useMetaframe } from "./hooks/metaframeHook";

export const App: FunctionalComponent = () => {
  const metaframe = useMetaframe();
  const [value, setValue] = useState<string>("");
  const [name, setname] = useState<string>("");

  useEffect(() => {
    const key = Object.keys(metaframe.inputs)[0];
    if (key) {
      if (typeof metaframe.inputs[key] === "string") {
        setValue(metaframe.inputs[key]);
      } else {
        setValue(JSON.stringify(metaframe.inputs[key], null, "  "));
      }
      setname(key);
    }
  }, [metaframe.inputs, setValue, setname]);

  const onChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
    },
    [setValue]
  );

  const onSave = useCallback(
    () => {
      if (metaframe.setOutputs) {
        const newOutputs: any = {};
        if (name.endsWith(".json")) {
          try {
            newOutputs[name] = JSON.parse(value);
          } catch(err) {
            newOutputs[name] = value;
          }
        } else {
          newOutputs[name] = value;
        }
        metaframe.setOutputs(newOutputs);
      }
    },
    [metaframe.setOutputs, value]
  );

  return (
    <Box w="100%" p={2} color="white">
      <VStack
        spacing={2}
        align="stretch"
      >
        <Flex>
          <Box p="4" color="black">
            Input: <Code variant="subtle" children={name} />
          </Box>
          <Spacer />

          <Button colorScheme="blue" onClick={onSave}>Save</Button>
        </Flex>

        <AceEditor
          // setOptions={{ useWorker: false }}
          mode="json"
          theme="github"
          name="UNIQUE_ID_OF_DIV"
          onChange={onChange}
          editorProps={{ $blockScrolling: true }}
          value={value}
          width="100%"
          // height="100%"
        />
      </VStack>
    </Box>
  );
};
