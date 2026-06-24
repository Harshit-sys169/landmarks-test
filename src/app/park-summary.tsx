import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { Button } from "../../components/ui/button";
import { Typography } from "../../components/ui/typography";
import { fetchParkAISummary, ParkAISummary } from "../../lib/park-summary";

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default function ParkSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ parkName?: string | string[] }>();
  const parkName = useMemo(
    () => firstValue(params.parkName) ?? "National Park",
    [params.parkName]
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ParkAISummary | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchParkAISummary(parkName);
        setSummary(result);
      } catch (err: any) {
        setError(err?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    };

    void loadSummary();
  }, [parkName]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.handle} />
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Feather name="x" size={18} color="#0F172A" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Typography variant="h1" style={styles.title}>
            {parkName}
          </Typography>

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#208AEF" />
              <Typography variant="body">Generating summary...</Typography>
            </View>
          ) : error ? (
            <View style={styles.errorCard}>
              <Typography variant="h3" style={styles.errorTitle}>
                Could not load summary
              </Typography>
              <Typography variant="body" style={styles.errorText}>
                {error}
              </Typography>
              <Button title="Try Again" onPress={() => router.replace(`/park-summary?parkName=${encodeURIComponent(parkName)}`)} />
            </View>
          ) : summary ? (
            <View style={styles.body}>
              <View style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>
                  Summary
                </Typography>
                <Typography variant="body" style={styles.paragraph}>
                  {summary.summary}
                </Typography>
              </View>

              <View style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>
                  Best time to visit
                </Typography>
                <Typography variant="body" style={styles.paragraph}>
                  {summary.bestTimeToVisit}
                </Typography>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.96)",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  topRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  handle: {
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#CBD5E1",
    marginBottom: 14,
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
    paddingBottom: 32,
    gap: 18,
  },
  title: {
    fontSize: 28,
  },
  loading: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  errorCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  errorTitle: {
    fontSize: 18,
  },
  errorText: {
    color: "#475569",
  },
  body: {
    gap: 16,
  },
  section: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
  },
  paragraph: {
    color: "#334155",
    lineHeight: 23,
  },
});