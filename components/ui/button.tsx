import { Pressable, Text, StyleSheet } from "react-native";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: "default" | "secondary";
};

export function Button({ title, onPress, variant = "default" }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        variant === "secondary" ? styles.secondary : styles.default,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === "secondary" ? styles.secondaryText : styles.defaultText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  default: {
    backgroundColor: "#111827",
  },
  secondary: {
    backgroundColor: "#E5E7EB",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  defaultText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: "#111827",
  },
});