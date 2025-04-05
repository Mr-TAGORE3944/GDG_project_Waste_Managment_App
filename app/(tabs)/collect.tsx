import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your Google Gemini API key
const geminiApiKey = "AIzaSyDyn9P47XMqXQtFAmUXUtxQ22Mm7DQn8Zc";

// Task type definition
type CollectionTask = {
  id: number;
  location: string;
  wasteType: string;
  amount: string;
  status: "pending" | "in_progress" | "completed" | "verified";
  date: string;
};

export default function Report() {
  const [tasks, setTasks] = useState<CollectionTask[]>([
    {
      id: 1,
      location: "Main Street",
      wasteType: "Plastic",
      amount: "5 kg",
      status: "pending",
      date: "2025-03-20",
    },
    {
      id: 2,
      location: "Green Park",
      wasteType: "Paper",
      amount: "3 kg",
      status: "in_progress",
      date: "2025-03-21",
    },
  ]);
  const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null);
  const [file, setFile] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    wasteTypeMatch: boolean;
    quantityMatch: boolean;
    confidence: number;
  } | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "failure"
  >("idle");

  // Pick an image from the gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setFile(result.assets[0].uri);
      setVerificationStatus("idle");
      setVerificationResult(null);
    }
  };

  // Convert image to base64
  const readFileAsBase64 = async (uri: string) => {
    let response = await fetch(uri);
    let blob = await response.blob();
    return new Promise<string>((resolve) => {
      let reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  // Verify waste using Google Gemini API
  const handleVerify = async () => {
    if (!selectedTask || !file) {
      Alert.alert("Missing Data", "Please upload an image and select a task.");
      return;
    }

    setVerificationStatus("verifying");

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const base64Data = await readFileAsBase64(file);
      const imageParts = [
        {
          inlineData: {
            data: base64Data.split(",")[1],
            mimeType: "image/jpeg",
          },
        },
      ];

      const prompt = `You are an expert in waste management. Analyze this image and provide:
        {
          "wasteTypeMatch": true/false,
          "quantityMatch": true/false,
          "confidence": confidence level between 0 and 1
        }`;

      const result = await model.generateContent([prompt, ...imageParts]);
      const responseText = result.response.text();

      try {
        const parsedResult = JSON.parse(
          responseText.replace(/```json|```/g, "").trim()
        );

        if (
          parsedResult.wasteTypeMatch &&
          parsedResult.quantityMatch &&
          parsedResult.confidence > 0.7
        ) {
          setVerificationResult(parsedResult);
          setVerificationStatus("success");

          // Update task status to "verified"
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === selectedTask.id
                ? { ...task, status: "verified" }
                : task
            )
          );
          Alert.alert("Success", "Verification successful!");
        } else {
          setVerificationStatus("failure");
          Alert.alert(
            "Verification Failed",
            "Waste does not match the report."
          );
        }
      } catch (error) {
        setVerificationStatus("failure");
      }
    } catch (error) {
      setVerificationStatus("failure");
    }
  };

  // Update task status
  const handleStatusChange = (
    taskId: number,
    newStatus: CollectionTask["status"]
  ) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  return (
    <ScrollView
      style={{ padding: 16, backgroundColor: "#f5f5f5", marginTop: 6 }}
    >
      {/* Header */}
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        Waste Collection Tasks
      </Text>

      {tasks.map((task) => (
        <View
          key={task.id}
          style={{
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600" }}>
            📍 {task.location}
          </Text>
          <Text>Type: {task.wasteType}</Text>
          <Text>Amount: {task.amount}</Text>
          <Text>Date: {task.date}</Text>
          <Text>Status: {task.status.replace("_", " ")}</Text>

          {task.status === "pending" && (
            <TouchableOpacity
              onPress={() => handleStatusChange(task.id, "in_progress")}
              style={{
                backgroundColor: "#007bff",
                padding: 10,
                borderRadius: 8,
                marginTop: 8,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center" }}>
                Start Collection
              </Text>
            </TouchableOpacity>
          )}

          {task.status === "in_progress" && (
            <TouchableOpacity
              onPress={() => setSelectedTask(task)}
              style={{
                backgroundColor: "#28a745",
                padding: 10,
                borderRadius: 8,
                marginTop: 8,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center" }}>
                Complete & Verify
              </Text>
            </TouchableOpacity>
          )}

          {task.status === "verified" && (
            <Text style={{ color: "green", fontWeight: "bold" }}>
              ✅ Verified
            </Text>
          )}
        </View>
      ))}

      {selectedTask && (
        <View
          style={{
            padding: 16,
            backgroundColor: "#fff",
            borderRadius: 12,
            marginTop: 16,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
            Verify Collection
          </Text>
          <TouchableOpacity
            onPress={pickImage}
            style={{
              backgroundColor: "#f0f0f0",
              padding: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text>📤 Upload Image</Text>
          </TouchableOpacity>

          {file && (
            <Image
              source={{ uri: file }}
              style={{
                width: "100%",
                height: 200,
                borderRadius: 12,
                marginTop: 12,
              }}
            />
          )}

          <TouchableOpacity
            onPress={handleVerify}
            disabled={verificationStatus === "verifying"}
            style={{
              backgroundColor:
                verificationStatus === "verifying" ? "#ccc" : "#007bff",
              padding: 12,
              borderRadius: 8,
              marginTop: 12,
            }}
          >
            {verificationStatus === "verifying" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", textAlign: "center" }}>
                Verify Collection
              </Text>
            )}
          </TouchableOpacity>

          {verificationResult && (
            <View
              style={{
                backgroundColor: "#d4edda",
                padding: 12,
                borderRadius: 12,
                marginTop: 16,
              }}
            >
              <Text>
                ✅ Waste Type Match:{" "}
                {verificationResult.wasteTypeMatch ? "Yes" : "No"}
              </Text>
              <Text>
                ✅ Quantity Match:{" "}
                {verificationResult.quantityMatch ? "Yes" : "No"}
              </Text>
              <Text>
                🔍 Confidence:{" "}
                {(verificationResult.confidence * 100).toFixed(2)}%
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
