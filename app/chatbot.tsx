import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
} from "react-native";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ChatbotScreen = () => {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>(
    []
  );
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const genAI = new GoogleGenerativeAI(
        "AIzaSyD6gqF4iJWn9CXz0A1I6fJrltMAze58ahs"
      );
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt =
        "Hey! I am the Swachh Bharat chatbot. I'm here to help you with waste management and cleanliness initiatives. How can I assist you today? One Line.";

      try {
        const result = await model.generateContent(prompt);
        setResponse(result.response.text());
        simulateTyping(result.response.text());
      } catch (error) {
        console.error("Error generating content:", error);
        setResponse("Failed to load response. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const simulateTyping = (text: string) => {
    setIsTyping(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setTypingText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: text, isUser: false },
        ]);
        setTypingText("");
      }
    }, 50);
  };

  const handleSendMessage = async () => {
    if (userInput.trim() === "") return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: userInput, isUser: true },
    ]);
    setUserInput("");

    try {
      const genAI = new GoogleGenerativeAI(
        "AIzaSyD6gqF4iJWn9CXz0A1I6fJrltMAze58ahs"
      );
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(userInput);
      const aiResponse = result.response.text();

      simulateTyping(aiResponse);
    } catch (error) {
      console.error("Error generating content:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Failed to load response. Please try again.", isUser: false },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0} // Adjusted to remove large gap
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Swachh Bharat Chatbot</Text>
      </View>

      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#22C55E" />
        ) : (
          <>
            {messages.map((message, index) => (
              <View
                key={index}
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            ))}
            {isTyping && (
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <Text style={styles.messageText}>{typingText}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={userInput}
          onChangeText={setUserInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#22C55E",
    padding: 16,
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  chatContent: {
    paddingBottom: 10, // Reduced padding to avoid extra space
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#22C55E",
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 24,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#22C55E",
    padding: 12,
    borderRadius: 24,
  },
  sendButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});

export default ChatbotScreen;
