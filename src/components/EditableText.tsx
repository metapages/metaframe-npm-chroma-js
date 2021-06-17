import { h, Fragment, FunctionalComponent } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import {
  Box,
  Editable,
  EditableInput,
  EditablePreview,
  HStack,
  IconButton,
  useEditableControls,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";

export const EditableText: FunctionalComponent<{
  value: string | undefined;
  setValue: (v: string | undefined) => void;
  defaultValue?: string | undefined;
}> = ({ defaultValue, value, setValue }) => {
  const [localValue, setLocalValue] = useState<string | undefined>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value, setLocalValue]);

  const EditableControls = useCallback(() => {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls();

    return isEditing ? (
      <Fragment>
        {/*
            // @ts-ignore */}
        <IconButton
          size="lg"
          color="green"
          icon={(<CheckIcon />) as any}
          {...getSubmitButtonProps()}
        />
        {/*
            // @ts-ignore */}
        <IconButton
          size="lg"
          color="red"
          icon={(<CloseIcon />) as any}
          {...getCancelButtonProps()}
        />
      </Fragment>
    ) : (
      // @ts-ignore
      <IconButton
        size="lg"
        icon={(<EditIcon />) as any}
        {...getEditButtonProps()}
      />
    );
  }, []);

  const onSubmit = useCallback(
    (val: string) => {
      setValue(val);
    },
    [setValue]
  );

  return (
    <Editable
      textAlign="left"
      defaultValue={defaultValue}
      value={localValue ? localValue : undefined}
      fontSize="lg"
      isPreviewFocusable={false}
      onSubmit={onSubmit}
      onChange={setLocalValue}
    >
      <HStack>
        <Box
          maxW="100%"
          width="100%"
          minW={"250px"}
          p={1}
          borderWidth="4px"
          borderRadius="lg"
          overflow="hidden"
        >
          <EditablePreview textSize="sm" width="100%" textColor="black" />
          <EditableInput width="100%" textColor="black" />
        </Box>
        <EditableControls />
      </HStack>
    </Editable>
  );
};
