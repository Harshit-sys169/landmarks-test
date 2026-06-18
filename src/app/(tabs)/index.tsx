import { StyleSheet, View } from "react-native";
import { Button } from "../../../components/ui/button";
import { Typography } from "../../../components/ui/typography";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Typography variant="h1" style={styles.title}>
        Landmarks
      </Typography>

      <Typography variant="body" style={styles.subtitle}>
        Discover and share amazing places
      </Typography>

      <View style={styles.spacer} />

      <Button title="Create Post" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  title: {
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    marginTop: 12,
  },

  spacer: {
    height: 20,
  },
});