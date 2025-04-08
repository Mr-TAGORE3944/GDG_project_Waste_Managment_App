import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { MaterialIcons, FontAwesome, Feather } from "@expo/vector-icons";

const API_BASE_URL = "http://192.168.1.20:5000/api/";

// Replace with your actual backend URL

const geminiApiKey = "AIzaSyDyn9P47XMqXQtFAmUXUtxQ22Mm7DQn8Zc";

type CollectionTask = {
  _id: string;
  location: string;
  wasteType: string;
  amount: string;
  status: "pending" | "in_progress" | "completed" | "verified";
  createdAt: string;
};

type VerificationResult = {
  wasteTypeMatch: boolean;
  quantityMatch: boolean;
  confidence: number;
};

export default function CollectScreen() {
  const [tasks, setTasks] = useState<CollectionTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null);
  const [file, setFile] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "failure"
  >("idle");
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("143"); // Replace with actual user ID

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tasks/${userId}`);
      setTasks(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch tasks");
      console.error("Fetch tasks error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update task status in backend
  const updateTaskStatus = async (
    taskId: string,
    newStatus: CollectionTask["status"]
  ) => {
    try {
      await axios.put(`${API_BASE_URL}/tasks/${taskId}/status`, {
        status: newStatus,
      });
      fetchTasks(); // Refresh tasks after update
    } catch (error) {
      Alert.alert("Error", "Failed to update task status");
      console.error("Update task error:", error);
    }
  };

  // Verify task completion in backend
  const verifyTaskCompletion = async (
    taskId: string,
    verificationData: VerificationResult
  ) => {
    try {
      await axios.post(`${API_BASE_URL}/tasks/${taskId}/verify`, {
        verificationData,
        image: file,
      });
      fetchTasks(); // Refresh tasks after verification
    } catch (error) {
      Alert.alert("Error", "Failed to verify task");
      console.error("Verify task error:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userId]);

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

  const readFileAsBase64 = async (uri: string) => {
    let response = await fetch(uri);
    let blob = await response.blob();
    return new Promise<string>((resolve) => {
      let reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

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

      const prompt = `You are an expert in waste management. Analyze this image and compare it to the expected waste:
      - Expected Type: ${selectedTask.wasteType}
      - Expected Amount: ${selectedTask.amount}
      
      Respond in JSON format:
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
        ) as VerificationResult;

        if (parsedResult.confidence > 0.7) {
          setVerificationResult(parsedResult);
          setVerificationStatus("success");
          await verifyTaskCompletion(selectedTask._id, parsedResult);
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
        Alert.alert("Error", "Failed to parse verification response");
      }
    } catch (error) {
      setVerificationStatus("failure");
      Alert.alert("Error", "Verification failed");
      console.error("Verification error:", error);
    }
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: CollectionTask["status"]
  ) => {
    await updateTaskStatus(taskId, newStatus);
    if (newStatus === "in_progress") {
      setSelectedTask(tasks.find((task) => task._id === taskId) || null);
    }
  };

  const renderTaskItem = (task: CollectionTask) => (
    <View key={task._id} style={styles.taskCard}>
      <Text style={styles.taskLocation}>📍 {task.location}</Text>
      <Text>Type: {task.wasteType}</Text>
      <Text>Amount: {task.amount}</Text>
      <Text>Date: {new Date(task.createdAt).toLocaleDateString()}</Text>
      <Text>Status: {task.status.replace("_", " ")}</Text>

      {task.status === "pending" && (
        <TouchableOpacity
          onPress={() => handleStatusChange(task._id, "in_progress")}
          style={styles.actionButton}
        >
          <Text style={styles.buttonText}>Start Collection</Text>
        </TouchableOpacity>
      )}

      {task.status === "in_progress" && (
        <TouchableOpacity
          onPress={() => setSelectedTask(task)}
          style={[styles.actionButton, { backgroundColor: "#28a745" }]}
        >
          <Text style={styles.buttonText}>Complete & Verify</Text>
        </TouchableOpacity>
      )}

      {task.status === "verified" && (
        <Text style={styles.verifiedText}>✅ Verified</Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>Waste Collection Tasks</Text>

      {tasks.length === 0 ? (
        <Text style={styles.noTasksText}>No tasks available</Text>
      ) : (
        tasks.map(renderTaskItem)
      )}

      {selectedTask && (
        <View style={styles.verificationContainer}>
          <Text style={styles.verificationHeader}>Verify Collection</Text>

          <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
            <Text>📤 Upload Image</Text>
          </TouchableOpacity>

          {file && <Image source={{ uri: file }} style={styles.imagePreview} />}

          <TouchableOpacity
            onPress={handleVerify}
            disabled={verificationStatus === "verifying"}
            style={[
              styles.verifyButton,
              verificationStatus === "verifying" && styles.disabledButton,
            ]}
          >
            {verificationStatus === "verifying" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify Collection</Text>
            )}
          </TouchableOpacity>

          {verificationResult && (
            <View style={styles.verificationResult}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  taskCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  taskLocation: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
  verifiedText: {
    color: "green",
    fontWeight: "bold",
    marginTop: 8,
  },
  noTasksText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  verificationContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  verificationHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  verifyButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  verificationResult: {
    backgroundColor: "#d4edda",
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
});
