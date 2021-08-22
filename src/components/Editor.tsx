import { FunctionalComponent } from "preact";
import MonacoEditor from "@monaco-editor/react";

export type EditorProps = {
  mode: string;
  value: string | undefined;
  setValue: (value: string | undefined) => void;
  theme: string;
};

export const Editor: FunctionalComponent<EditorProps> = ({
  mode,
  value,
  setValue,
  theme,
}) => {
  return (
    <MonacoEditor
      defaultLanguage={mode}
      theme={theme}
      options={{
        minimap: {enabled:false},
      }}
      onChange={setValue}
      value={value}
      width="100%"
      height="90vh"
    />
  );
};
