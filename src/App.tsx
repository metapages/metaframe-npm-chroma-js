/**
 * Simple:
 *  - any input sets
 *    - the content to the editor
 *    - the name to the input name
 *    - the save button is deactivated
 *  The save button sends the editor content to the same input name
 */

import { FunctionalComponent } from "preact";
import { useEffect, useState, useCallback } from "preact/hooks";
import {
  Box,
  Button,
  Flex,
  HStack,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import {
  MetaframeObject,
  useMetaframe,
  useHashParamJson,
  useHashParamBase64,
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
  {
    name: "noautosendonce",
    displayName: "Only send when Save/Send is clicked",
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
];

type OptionBlob = {
  mode: string;
  noautosendonce: boolean;
  theme: string;
};

export const App: FunctionalComponent = () => {
  const metaframe: MetaframeObject = useMetaframe();
  const [name, setName] = useHashParamBase64("name", "");
  // Proposed way to tell metaframe: I am configuring you
  // const [metaframeConfigure] = useHashParam("metaframe-configure");
  const [options] = useHashParamJson<OptionBlob>("options", {
    mode: "json",
    noautosendonce: false,
    theme: "light",
  });

  // Split these next two otherwise editing is too slow as it copies to/from the URL
  const [valueHashParam, setValueHashParam] = useHashParamBase64(
    "text",
    undefined
  );
  // Use a local copy because directly using hash params is too slow for typing
  const [localValue, setLocalValue] = useState<string|undefined>(valueHashParam || "");
  // Send the text at least once, even if the user doesn't click "Send"
  const [sendOnce, setSendOnce] = useState<boolean>(false);

  // source of truth: the URL param #?text=<HashParamBase64>
  // if that changes, set the local value
  // the local value changes fast from editing
  useEffect(() => {
    setLocalValue(valueHashParam || "");
  }, [valueHashParam, setLocalValue]);

  // make sure the file name is up-to-date
  // either from #?name=<HashParamBase64> or from the latest input name
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
    if (metaframe.setOutputs && name && name.length > 0 && isIframe() && localValue) {
      const newOutputs: any = maybeConvertJsonValues(name, localValue);
      metaframe.setOutputs(newOutputs);
    }
  }, [metaframe.setOutputs, localValue, name, setValueHashParam]);

  // send current script at least once
  useEffect(() => {
    // don't autosend metapage definitions ugh you get an ugly loop.
    // configurating it specially is cumbersome
    if (
      name !== "metapage/definition" &&
      !options?.noautosendonce &&
      metaframe.setOutputs &&
      localValue &&
      localValue.length > 0 &&
      name &&
      name.length > 0 &&
      !sendOnce &&
      isIframe()
    ) {
      const newOutputs: any = maybeConvertJsonValues(name, localValue);
      metaframe.setOutputs(newOutputs);
      setSendOnce(true);
    }
  }, [metaframe.setOutputs, localValue, name, sendOnce, setSendOnce, options]);

  return (
    <Box w="100%" p={2}>
      <VStack spacing={2} align="stretch">
        <Flex alignItems="center">
          <HStack>
            <EditableText
              value={name ? name : ""}
              setValue={setName}
              defaultValue="Name"
            />

            <OptionsMenuButton options={appOptions} />
          </HStack>

          <Spacer />

          <Button colorScheme="blue" onClick={onSave}>
            Save
          </Button>
        </Flex>

        <Editor
          mode={options?.mode || "json"}
          theme={options?.theme || "light"}
          setValue={setLocalValue}
          value={localValue}
        />
      </VStack>
    </Box>
  );
};

const maybeConvertJsonValues = (name: string, text: string) => {
  const newOutputs: any = {};
  if (name.endsWith(".json")) {
    try {
      newOutputs[name] = JSON.parse(text || "");
    } catch (err) {
      newOutputs[name] = text;
    }
  } else {
    newOutputs[name] = text;
  }
  return newOutputs;
};
