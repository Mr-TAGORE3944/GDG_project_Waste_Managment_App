import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router"; // Import Link for navigation
import "./global.css";

// Chatbot Component
const Chatbot = () => {
  return (
    <Link href="/chatbot" asChild>
      <TouchableOpacity style={styles.chatbotButton}>
        <Text style={styles.chatbotButtonText}>💬</Text> {/* Chat emoji */}
      </TouchableOpacity>
    </Link>
  );
};

export default function RootLayout() {
  return (
    <>
      {/* Set Status Bar Color */}
      <StatusBar hidden={true} />

      {/* Stack Navigation */}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="chatbot"
          options={{ headerTitle: "Chatbot", headerShown: false }}
        />
      </Stack>

      {/* Chatbot Component (Fixed for Every Page) */}
      <Chatbot />
    </>
  );
}

// Styles
const styles = StyleSheet.create({
  chatbotButton: {
    position: "absolute",
    bottom: 120,
    right: 20,
    backgroundColor: "#22C55E",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  chatbotButtonText: {
    fontSize: 24,
  },
});
