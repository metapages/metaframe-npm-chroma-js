import { h, FunctionalComponent } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import { config } from "ace-builds";
config.set(
  "basePath",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.4.8/src-noconflict/"
);
config.setModuleUrl(
  "ace/mode/json_worker",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.4.8/src-noconflict/worker-json.js"
);
config.setModuleUrl(
  "ace/mode/javascript_worker",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.4.8/src-noconflict/worker-javascript.js"
);
config.setModuleUrl(
  "ace/mode/python_worker",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.4.8/src-noconflict/worker-python.js"
);
config.setModuleUrl(
  "ace/mode/sh_worker",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.4.8/src-noconflict/worker-sh.js"
);
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-sh";
import "ace-builds/src-noconflict/theme-github";

export type EditorProps = {
  mode: string;
  value: string;
  setValue: (value: string) => void;
};

export const Editor: FunctionalComponent<EditorProps> = ({
  mode,
  value,
  setValue,
}) => {

  // const [ localValue, setLocalValue] = useState<string>(value);

  // const onChange = useCallback(
  //   (newValue: string) => {
  //     setValue(newValue);
  //   },
  //   [setValue]
  // );

  return (
    <AceEditor
      // setOptions={{ useWorker: false }}
      mode={mode}
      theme="github"
      name="UNIQUE_ID_OF_DIV"
      onChange={setValue}
      editorProps={{ $blockScrolling: true }}
      value={value}
      width="100%"
      // height="100%"
    />
  );
};
