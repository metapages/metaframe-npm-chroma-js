import { h, Fragment, FunctionalComponent } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import {
  Box,
  Button,
  ButtonGroup,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Grid,
  GridItem,
  IconButton,
  Input,
  Select,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, SettingsIcon } from "@chakra-ui/icons";
import { useHashParamJson } from "@metapages/metaframe-hook";

type OptionType = "string" | "boolean" | "option";

export type Option = {
  name: string;
  displayName: string;
  default?: string;
  type?: OptionType; // defaults to string
  options?: string[];
  validator?: (val: string) => string | undefined; // undefined == 👍, string is an error message
  map?: (val: string) => any; // convert value to proper type
};

export const OptionsMenuButton: FunctionalComponent<{ options: Option[] }> = ({
  options,
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const onClick = useCallback(() => {
    setOpen(!open);
  }, [open]);

  return (
    <Fragment>
      <IconButton
        verticalAlign="top"
        aria-label="Metaframe settings"
        // @ts-ignore
        icon={<SettingsIcon />}
        size="lg"
        onClick={onClick}
      />
      <OptionsMenu isOpen={open} setOpen={setOpen} options={options} />
    </Fragment>
  );
};

const OptionsMenu: FunctionalComponent<{
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  options: Option[];
}> = ({ isOpen, setOpen, options }) => {
  // isOpen = true; // for debugging/developing

  const [optionsInHashParams, setOptionsInHashParams] = useHashParamJson<
    Record<string, string>
  >(
    "options",
    Object.fromEntries(
      options
        .filter((o) => o.default)
        .map((option) => [option!.name!, option!.default!])
    )
  );

  const [localOptions, setLocalOptions] = useState<Record<string, string>>(
    optionsInHashParams || {}
  );
  const [errors, setErrors] = useState<Record<string, string> | undefined>(
    undefined
  );

  const handleOnChange = useCallback(
    (event: any) => {
      const { name, value } = event.target as HTMLInputElement;
      setLocalOptions({ ...localOptions, [name]: value });
    },
    [localOptions, setLocalOptions]
  );

  const onClose = useCallback(() => {
    setOpen(!isOpen);
  }, [setOpen, isOpen]);

  const onCloseAndAccept = useCallback(() => {
    // first validate if available
    const maybeErrors: Record<string, string> = {};
    Object.keys(localOptions).forEach((key) => {
      const option: Option | undefined = options.find((o) => o.name === key);
      if (option && option.validator) {
        const errorFromOption = option.validator(localOptions[key]);
        if (errorFromOption) {
          maybeErrors[key] = errorFromOption;
        }
      }
    });
    if (Object.keys(maybeErrors).length > 0) {
      setErrors(maybeErrors);
      return;
    }
    setErrors(undefined);

    // assume valid!
    // now maybe map to other values
    const convertedOptions: Record<string, any> = {};
    Object.keys(localOptions).forEach((key) => {
      const option: Option | undefined = options.find((o) => o.name === key);
      if (option && option.map) {
        convertedOptions[key] = option.map(localOptions[key]);
      } else {
        convertedOptions[key] = localOptions[key];
      }
    });

    setOpen(!isOpen);
    setOptionsInHashParams(convertedOptions);
  }, [
    setOpen,
    isOpen,
    options,
    localOptions,
    setOptionsInHashParams,
    setErrors,
  ]);

  // preact complains in dev mode if this is moved out of a functional component
  useEffect(() => {
    const onKeyup = (e: KeyboardEvent) => {
      if (e.key === "Enter" && isOpen) onCloseAndAccept();
    };
    window.addEventListener("keyup", onKeyup);
    return () => {
      window.removeEventListener("keyup", onKeyup);
    };
  }, [onCloseAndAccept, isOpen]);

  return (
    <Drawer placement="top" onClose={onCloseAndAccept} isOpen={isOpen}>
      <DrawerOverlay>
        <DrawerContent>
          <DrawerHeader borderBottomWidth="0px">
            Configure metaframe (stored in URL hash params )
          </DrawerHeader>
          <DrawerBody>
            <Box
              maxW="80%"
              p={2}
              borderWidth="4px"
              borderRadius="lg"
              overflow="hidden"
            >
              <Grid templateColumns="repeat(12, 1fr)" gap={6}>
                {options.map((option) => (
                  <Fragment>
                    <GridItem rowSpan={1} colSpan={4}>
                      <Box
                        w="100%"
                        h="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="flex-end"
                      >
                        <Text textAlign={"right"} verticalAlign="bottom">
                          {option.displayName || option.name}:
                        </Text>
                      </Box>
                    </GridItem>
                    <GridItem rowSpan={1} colSpan={8}>
                      {" "}
                      {renderInput(
                        option,
                        localOptions[option.name],
                        handleOnChange
                      )}
                    </GridItem>
                  </Fragment>
                ))}

                <GridItem rowSpan={1} colSpan={12}></GridItem>
                <GridItem rowSpan={1} colSpan={12}></GridItem>
                <GridItem rowSpan={1} colSpan={12}></GridItem>
                <GridItem rowSpan={1} colSpan={10}></GridItem>

                <GridItem rowSpan={0} colSpan={2}>
                  <Stack spacing={4}>
                    <ButtonGroup variant="outline" spacing="6">
                      {/*
                      // @ts-ignore */}
                      <IconButton
                        size="lg"
                        color="red"
                        icon={(<CloseIcon />) as any}
                        onClick={onClose}
                      />
                      {/*
                      // @ts-ignore */}
                      <IconButton
                        size="lg"
                        color="green"
                        icon={(<CheckIcon />) as any}
                        onClick={onCloseAndAccept}
                      />
                    </ButtonGroup>
                  </Stack>
                </GridItem>
              </Grid>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

const renderInput = (option: Option, value: any, onChange: any) => {
  switch (option.type) {
    case "option":
      return (
        <Select
          name={option.name}
          value={value}
          onChange={onChange}
          placeholder="Select option"
        >
          {option.options!.map((optionChoice) => (
            <option value={optionChoice}>{optionChoice}</option>
          ))}
        </Select>
      );
    case "boolean":
      return (
        <Switch
          name={option.name}
          // @ts-ignore
          rightIcon={<CheckIcon />}
          onChange={onChange}
          isChecked={value}
          value={value ? 1 : 0}
        />
      );
    default:
      return (
        <Box w="100%" h="10">
          <Input
            name={option.name}
            type="text"
            placeholder=""
            value={value}
            onInput={onChange}
          />
        </Box>
      );
  }
};
