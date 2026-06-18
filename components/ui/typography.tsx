import { Text, TextProps, StyleSheet } from "react-native";

type Props = TextProps & {
  variant?: "h1" | "h2" | "h3" | "body";
};

export function Typography({ variant = "body", style, ...props }: Props) {
  return <Text {...props} style={[styles.base, styles[variant], style]} />;
}

const styles = StyleSheet.create({
  base: {
    color: "#0F172A",
  },
  h1: {
    fontSize: 32,
    fontWeight: "700",
  },
  h2: {
    fontSize: 24,
    fontWeight: "700",
  },
  h3: {
    fontSize: 20,
    fontWeight: "600",
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
  },
});