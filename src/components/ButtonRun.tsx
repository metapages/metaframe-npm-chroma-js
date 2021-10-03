import { FunctionalComponent } from "preact";
import { useCallback } from "preact/hooks";
import { IconButton } from "@chakra-ui/react";
import { EditIcon, CheckIcon } from "@chakra-ui/icons";

import {
  MetaframeObject,
  useMetaframe,
  useHashParamBase64,
} from "@metapages/metaframe-hook";
import { Mode, useStore } from "../store";

export const ButtonRun: FunctionalComponent = () => {
  const metaframe: MetaframeObject = useMetaframe();
  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);
  const codeInStore = useStore((state) => state.code);

  // Split these next two otherwise editing is too slow as it copies to/from the URL
  const [valueHashParam, setValueHashParam] = useHashParamBase64(
    "text",
    undefined
  );

  const onClick = useCallback(() => {
    switch (mode) {
      case Mode.Editing:
        // If the values are different, update, this will trigger a new execution
        if (valueHashParam !== codeInStore) {
          setValueHashParam(codeInStore);
        }
        setMode(Mode.Running);
        break;
      case Mode.Finished:
        setMode(Mode.Editing);
        break;
      case Mode.Running:
        setMode(Mode.Editing);
        break;
      case Mode.Start:
        break;
    }
  }, [
    metaframe.metaframe,
    codeInStore,
    valueHashParam,
    setValueHashParam,
    mode,
    setMode,
  ]);

  return (
    <IconButton
      verticalAlign="top"
      aria-label="Help"
      colorScheme={mode === Mode.Editing ? "blue" : undefined}
      // @ts-ignore
      icon={mode === Mode.Editing ? <CheckIcon /> : <EditIcon />}
      size="md"
      onClick={onClick}
      mr="4"
    />
  );
};
