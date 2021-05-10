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
import {
  Box,
  Button,
  Flex,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  MetaframeObject,
  useMetaframe,
  useHashParamJson,
  useHashParamBase64,
  useHashParam,
} from "@metapages/metaframe-hook";
import { Editor } from "./components/Editor";
import { Option, OptionsMenuButton } from "./components/OptionsMenu";
import { EditableText } from "./components/EditableText";
import { isIframe } from "./utils/util";

const appOptions: Option[] = [
  {
    name: "mode",
    displayName: "Editor code mode",
    default: "json",
    type: "option",
    options: ["json", "javascript", "python", "sh"],
  },
];

export const App: FunctionalComponent = () => {
  const metaframe: MetaframeObject = useMetaframe();
  const [name, setName] = useHashParamBase64("name", "");
  // Proposed way to tell metaframe: I am configuring you
  const [metaframeConfigure] = useHashParam("metaframe-configure");
  const [options] = useHashParamJson<{ mode: string }>("options", {
    mode: "json",
  });
  // Split these next two otherwise editing is too slow as it copies to/from the URL
  const [valueHashParam, setValueHashParam] = useHashParamBase64("text", undefined);
  // Use a local copy because directly using hash params is too slow for typing
  const [ localValue, setLocalValue] = useState<string>(valueHashParam || "");

  useEffect(() => {
    setLocalValue(valueHashParam || "");
  }, [valueHashParam, setLocalValue])

  useEffect(() => {
    const key = Object.keys(metaframe.inputs)[0];
    if (key) {
      if (typeof metaframe.inputs[key] === "string") {
        setValueHashParam(metaframe.inputs[key]);
      } else {
        setValueHashParam(JSON.stringify(metaframe.inputs[key], null, "  "));
      }
      setName(key);
    }
  }, [metaframe.inputs, setValueHashParam, setName]);

  const onSave = useCallback(() => {
    setValueHashParam(localValue);
    if (metaframe.setOutputs && name) {
      const newOutputs: any = {};
      if (name.endsWith(".json")) {
        try {
          newOutputs[name] = JSON.parse(localValue || "");
        } catch (err) {
          newOutputs[name] = localValue;
        }
      } else {
        newOutputs[name] = localValue;
      }
      if (isIframe()) {
        metaframe.setOutputs(newOutputs);
      }
    }
  }, [metaframe.setOutputs, localValue, name, setValueHashParam]);

  return (
    <Box w="100%" p={2} color="white">
      <VStack spacing={2} align="stretch">
        <Flex alignItems="center">
          {metaframeConfigure === "true" || !isIframe() ? (
            <OptionsMenuButton options={appOptions} />
          ) : null}

          <Box p="3" color="black">
            <Text fontSize="xm" >Name:{" "}</Text>
          </Box>

          <EditableText
            value={name ? name : ""}
            setValue={setName}
          />

          <Spacer pr="8px" />

          <Button colorScheme="blue" onClick={onSave}>
            {metaframeConfigure === "true" || !isIframe() ? "Save" : "Send"}
          </Button>
        </Flex>

        <Editor
          mode={options?.mode || "json"}
          setValue={setLocalValue}
          value={localValue}
        />
      </VStack>
    </Box>
  );
};
