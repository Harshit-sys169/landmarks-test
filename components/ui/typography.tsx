import { Text, TextProps } from "react-native";

type Props = TextProps & {
  variant?: "h1" | "body";
};

export function Typography({
  variant = "body",
  style,
  children,
  ...props
}: Props) {
  return (
    <Text
      {...props}
      style={[
        variant === "h1"
          ? {
              fontSize: 32,
              fontWeight: "700",
            }
          : {
              fontSize: 16,
            },
        style,
      ]}
    >
      {children}
    </Text>
  );
}