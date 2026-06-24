import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    image: require("../../../assets/onboarding/onboarding-1.jpg"),
    title: "Discover Amazing Places",
    description:
      "Explore breathtaking landmarks and hidden gems around the world.",
  },
  {
    id: "2",
    image: require("../../../assets/onboarding/onboarding-2.jpg"),
    title: "Share Your Adventures",
    description:
      "Capture memorable moments and inspire other explorers.",
  },
  {
    id: "3",
    image: require("../../../assets/onboarding/onboarding-3.jpg"),
    title: "Connect With Explorers",
    description:
      "Join a community of travelers who love discovering new places.",
  },
];

export default function OnboardingCarousel() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      router.replace("/(auth)/sign-in");
    }
  };

  const skip = () => {
    router.replace("/(auth)/sign-in");
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <ImageBackground
              source={item.image}
              style={styles.image}
            >
              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(0,0,0,0.2)",
                  "rgba(0,0,0,0.85)",
                ]}
                style={styles.gradient}
              />

              <View style={styles.content}>
                <Text style={styles.title}>
                  {item.title}
                </Text>

                <Text style={styles.description}>
                  {item.description}
                </Text>
              </View>
            </ImageBackground>
          </View>
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity onPress={skip}>
          <Text style={styles.actionText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index &&
                  styles.activeDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity onPress={nextSlide}>
          <Text style={styles.actionText}>
            {currentIndex === slides.length - 1
              ? "Get Started"
              : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  slide: {
    width,
    height,
  },

  image: {
    flex: 1,
    justifyContent: "flex-end",
  },

  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  content: {
    paddingHorizontal: 30,
    paddingBottom: 160,
  },

  title: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "700",
    marginBottom: 12,
  },

  description: {
    color: "#E2E8F0",
    fontSize: 17,
    lineHeight: 24,
  },

  footer: {
    position: "absolute",
    bottom: 60,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dots: {
    flexDirection: "row",
    gap: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },

  activeDot: {
    backgroundColor: "#fff",
    width: 20,
  },

  actionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});