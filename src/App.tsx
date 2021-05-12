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
  {
    name: "autosend",
    displayName: "Send once automatically",
    default: true,
    type: "boolean",
  },
];

type OptionBlob = {
  mode:string;
  autosend:boolean;
}

export const App: FunctionalComponent = () => {
  const metaframe: MetaframeObject = useMetaframe();
  const [name, setName] = useHashParamBase64("name", "");
  // Proposed way to tell metaframe: I am configuring you
  const [metaframeConfigure] = useHashParam("metaframe-configure");
  const [options] = useHashParamJson<OptionBlob>("options", {
    mode: "json",
    autosend: true,
  });

  // Split these next two otherwise editing is too slow as it copies to/from the URL
  const [valueHashParam, setValueHashParam] = useHashParamBase64("text", undefined);
  // Use a local copy because directly using hash params is too slow for typing
  const [ localValue, setLocalValue] = useState<string>(valueHashParam || "");
  // Send the text at least once, even if the user doesn't click "Send"
  const [ sendOnce, setSendOnce ] = useState<boolean>(false);

  // source of truth: the URL param #?text=<HashParamBase64>
  // if that changes, set the local value
  // the local value changes fast from editing
  useEffect(() => {
    setLocalValue(valueHashParam || "");
  }, [valueHashParam, setLocalValue]);

  useEffect(() => {
    if (metaframe.metaframe) {
      metaframe.metaframe.notifyOnHashUrlChange();
    }
  }, [metaframe.metaframe]);

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
    if (metaframe.setOutputs && name && name.length > 0 && isIframe()) {
      const newOutputs: any = maybeConvertJsonValues(name, localValue);
      metaframe.setOutputs(newOutputs);
    }
  }, [metaframe.setOutputs, localValue, name, setValueHashParam]);

  // send current script at least once
  useEffect(() => {
    // don't autosend metapage definitions ugh you get an ugly loop.
    // configurating it specially is cumbersome
    if (name !== "metapage/definition" && options?.autosend && metaframe.setOutputs && localValue && localValue.length > 0 && name && name.length > 0 && !sendOnce && isIframe()) {
        const newOutputs: any = maybeConvertJsonValues(name, localValue);
        metaframe.setOutputs(newOutputs);
        console.log('editor metaframe.setOutputs(newOutputs)')
        setSendOnce(true);
    }
  }, [metaframe.setOutputs, localValue, name, sendOnce, setSendOnce, options]);

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

const maybeConvertJsonValues = (name:string, text:string) => {
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
}
