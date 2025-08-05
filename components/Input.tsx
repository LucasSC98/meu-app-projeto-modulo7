//componente input em react native expo cli

import React from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

type InputProps = TextInputProps;

export function Input(props: InputProps) {
  return <TextInput style={[styles.input, props.style]} {...props} />;
}
const styles = StyleSheet.create({
  input: {
    height: 45,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#0000001a",
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
    shadowColor: "#04007eff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.55,
    shadowRadius: 2.84,
    elevation: 20,
  },
  inputErro: {
    borderColor: "red",
  },
});
