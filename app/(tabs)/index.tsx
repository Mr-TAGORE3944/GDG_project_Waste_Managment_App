import { icons } from "@/constants/icons";
import { Link } from "expo-router";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import * as Animatable from "react-native-animatable";

export default function Index() {
  return (
    <ScrollView contentContainerStyle={styles.iconContainer} className="">
      {/* Animated Globe */}
      <View style={styles.globeContainer} className="mt-4">
        {/* Outer Pulse Layer */}
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={2000}
          easing="ease-out"
          // style={[styles.globeLayer, styles.globeLayer1]}
        />

        {/* Rotating Layer
        <Animatable.View
          animation="rotate"
          iterationCount="infinite"
          duration={5000}
          easing="linear"
          style={[styles.globeLayer, styles.globeLayer3]}
        /> */}

        {/* Bouncing Layer
        <Animatable.View
          animation="bounce"
          iterationCount="infinite"
          duration={1500}
          easing="ease-in-out"
          style={[styles.globeLayer, styles.globeLayer4]}
        /> */}

        {/* Leaf Icon
        <Animatable.Text
          animation="pulse"
          iterationCount="infinite"
          duration={2000}
          easing="ease-out"
          style={styles.leafIcon}
        > */}
        <Image
          source={icons.leaf}
          style={styles.leafIcon}
          className="object-contain z-10 w-[60%] h-[60%]"
        />
        {/* </Animatable.Text> */}
      </View>

      {/* Main Heading */}
      <Text style={styles.heading}>
        Swachch Bharat <Text style={styles.greenText}>Waste Management</Text>
      </Text>

      {/* Description */}
      <Text style={styles.description}>
        Join our community in making waste management more efficient and
        rewarding!
      </Text>

      {/* Get Started Button */}
      <Link href="/report" asChild>
        <TouchableOpacity style={styles.button} className="m-10">
          <Text style={styles.buttonText}>Get Started</Text>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
      </Link>

      {/* Feature Cards */}
      <View style={styles.featureContainer}>
        <View style={styles.featureCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🍃</Text>
          </View>
          <Text style={styles.featureTitle}>Eco-Friendly</Text>
          <Text style={styles.featureDescription}>
            Contribute to a cleaner environment by reporting and collecting
            waste.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>💰</Text>
          </View>
          <Text style={styles.featureTitle}>Earn Rewards</Text>
          <Text style={styles.featureDescription}>
            Get tokens for your contributions to waste management efforts.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>👥</Text>
          </View>
          <Text style={styles.featureTitle}>Community-Driven</Text>
          <Text style={styles.featureDescription}>
            Be part of a growing community committed to sustainable practices.
          </Text>
        </View>
      </View>

      {/* Impact Section */}
      <View style={styles.impactContainer}>
        <Text style={styles.impactHeading}>Our Impact</Text>
        <View style={styles.impactGrid}>
          <View style={styles.impactCard}>
            <Text style={styles.impactIcon}>♻️</Text>
            <Text style={styles.impactValue}>0 kg</Text>
            <Text style={styles.impactTitle}>Waste Collected</Text>
          </View>

          <View style={styles.impactCard}>
            <Text style={styles.impactIcon}>📍</Text>
            <Text style={styles.impactValue}>0</Text>
            <Text style={styles.impactTitle}>Reports Submitted</Text>
          </View>

          <View style={styles.impactCard}>
            <Text style={styles.impactIcon}>💰</Text>
            <Text style={styles.impactValue}>0</Text>
            <Text style={styles.impactTitle}>Tokens Earned</Text>
          </View>

          <View style={styles.impactCard}>
            <Text style={styles.impactIcon}>🍃</Text>
            <Text style={styles.impactValue}>0 kg</Text>
            <Text style={styles.impactTitle}>CO2 Offset</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Globe Container
  globeContainer: {
    width: 160, // Increased size for better visibility
    height: 160,
    borderRadius: 80, // Perfect circle
    backgroundColor: "white", // Base green color
    opacity: 1, // Slightly transparent
    marginBottom: 32, // Spacing below the globe
    alignSelf: "center", // Center horizontally
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    position: "relative", // For absolute positioning of layers
    overflow: "hidden", // Ensure layers don't overflow the container
  },

  // Base Style for Globe Layers
  globeLayer: {
    position: "absolute", // Layers stack on top of each other
    borderRadius: 80, // Circular shape
    backgroundColor: "#22c55e", // Green color
  },

  // Outer Layer (Slowest Pulse)
  globeLayer1: {
    width: "100%", // Full size
    height: "100%",
    opacity: 0.2, // Lightest opacity
  },

  // Middle Layer (Medium Pulse)
  globeLayer2: {
    width: "80%", // Slightly smaller
    height: "80%",
    opacity: 0.4, // Medium opacity
  },

  // Inner Layer (Rotating)
  globeLayer3: {
    width: "60%", // Smaller than the middle layer
    height: "60%",
    opacity: 0.6, // More visible
  },

  // Innermost Layer (Bouncing)
  globeLayer4: {
    width: "40%", // Smallest layer
    height: "40%",
    opacity: 0.8, // Most visible
  },

  // Leaf Icon
  leafIcon: {
    fontSize: 64, // Large size
    color: "#166534", // Dark green color
    zIndex: 1, // Ensure the leaf stays on top of the layers
  },

  // Heading
  heading: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e293b",
    marginBottom: 16,
  },

  // Green Text
  greenText: {
    color: "#22c55e",
  },

  // Description
  description: {
    fontSize: 18,
    textAlign: "center",
    color: "#475569",
    marginBottom: 32,
    paddingHorizontal: 24,
  },

  // Button
  button: {
    flexDirection: "row",
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  // Button Text
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "500",
  },

  // Arrow Icon
  arrowIcon: {
    fontSize: 18,
    color: "#ffffff",
    marginLeft: 8,
  },

  // Feature Container
  featureContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 32,
  },

  // Feature Card
  featureCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Icon Container
  iconContainer: {
    backgroundColor: "#dcfce7",
    padding: 12,
    borderRadius: 24,
    marginBottom: 16,
  },

  // Icon
  icon: {
    fontSize: 24,
  },

  // Feature Title
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },

  // Feature Description
  featureDescription: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
  },

  // Impact Container
  impactContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 100,
  },

  // Impact Heading
  impactHeading: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e293b",
    marginBottom: 24,
  },

  // Impact Grid
  impactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    gap: 16,
  },

  // Impact Card
  impactCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    width: "40%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },

  // Impact Icon
  impactIcon: {
    fontSize: 24,
    marginBottom: 16,
  },

  // Impact Value
  impactValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },

  // Impact Title
  impactTitle: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
  },
});
