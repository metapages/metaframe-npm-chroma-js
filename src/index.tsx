import { h, render, FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { Metaframe, MetaframeInputMap } from "@metapages/metapage";
import { ChakraProvider } from "@chakra-ui/react";
import { MetaframeObject, MetaframeContext } from "./hooks/metaframeHook";
import { App } from "./App";

// ALL this before the render is to set up the metaframe provider
// I tried putting useMetaframe into 'metaframeHook.ts'
// but preact crashed 🤷‍♀️
const useMetaframe = () => {
  const [metaframeObject, setMetaframeObject] = useState<MetaframeObject>({
    inputs: {},
  });
  const [metaframe, setMetaframe] = useState<Metaframe | undefined>(undefined);
  const [inputs, setInputs] = useState<MetaframeInputMap>(
    metaframeObject.inputs
  );

  useEffect(() => {
    const newMetaframe = new Metaframe();
    const onInputs = (newinputs: MetaframeInputMap): void => {
      setInputs(newinputs);
    };
    newMetaframe.onInputs(onInputs);
    setMetaframe(newMetaframe);
    return () => {
      // If the metaframe is cleaned up, also remove the inputs listener
      newMetaframe.removeListener(Metaframe.INPUTS, onInputs);
      newMetaframe.dispose();
    };
  }, [setMetaframe, setInputs]);

  useEffect(() => {
    if (inputs && metaframe) {
      setMetaframeObject({
        metaframe,
        inputs,
        setOutputs: metaframe.setOutputs,
      });
    }
  }, [inputs, metaframe]);

  return [metaframeObject];
};

const Index: FunctionalComponent = () => {
  const [metaframeObject] = useMetaframe();

  return (
    /* I tried to pull this out into it's own file but preact hates it */
    <MetaframeContext.Provider value={metaframeObject}>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </MetaframeContext.Provider>
  );
};

render(<Index />, document.getElementById("root")!);
