import { TextInput, StyleSheet, TextInputProps } from "react-native";

export function Input(props: TextInputProps) {
  return <TextInput {...props} style={[styles.input, props.style]} />;
}

const styles = StyleSheet.create({
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
  },
});