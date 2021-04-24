/**
 * Via Context provide the metaframe inputs and outputs
 */

// Can we export a react AND preact compatible module?
import { useContext, useEffect, useState, createContext } from "react"
import { Metaframe, MetaframeInputMap } from "@metapages/metapage";

export interface MetaframeObject {
  inputs: MetaframeInputMap;
  setOutputs?: (outputs: MetaframeInputMap) => void;
  // This is only set when initialized
  metaframe?: Metaframe;
}

const defaultMetaframeObject: MetaframeObject = {
  inputs: {},
};

export const MetaframeContext = createContext<MetaframeObject>(defaultMetaframeObject);

export const useMetaframe = () => {
  return useContext(MetaframeContext);
};
