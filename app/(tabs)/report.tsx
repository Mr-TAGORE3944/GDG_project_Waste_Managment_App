import React, { useState, useEffect } from "react";
import { submitReport } from "../../utils/api";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { GoogleGenerativeAI } from "@google/generative-ai";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons, FontAwesome, Feather } from "@expo/vector-icons";
import axios from "axios";

// Configure API base URL
const API_BASE_URL = "http://192.168.1.20:5000/api"; // Removed trailing slash

// Gemini AI Configuration
const geminiApiKey = "AIzaSyDyn9P47XMqXQtFAmUXUtxQ22Mm7DQn8Zc";

interface Report {
  id: string;
  location: string;
  wasteType: string;
  amount: string;
  createdAt: string;
  image?: string;
  verificationData?: {
    wasteType: string;
    quantity: string;
    confidence: number;
  };
}

interface VerificationResult {
  wasteType: string;
  quantity: string;
  confidence: number;
}

export default function ReportScreen() {
  const [file, setFile] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "failure"
  >("idle");
  const [location, setLocation] = useState("");
  const [wasteType, setWasteType] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [userId, setUserId] = useState("");

  // API Service Functions
  const fetchUserReports = async (userId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      throw error;
    }
  };

  const submitReportToAPI = async (reportData: {
    userId: string;
    image: string;
    location: string;
    wasteType: string;
    amount: string;
    verificationData: VerificationResult | null;
  }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/reports`, reportData);
      return response.data;
    } catch (error) {
      console.error("Failed to submit report:", error);
      throw error;
    }
  };

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      setUserId("current-user-id");

      const { status: cameraStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: locationStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (cameraStatus !== "granted") {
        Alert.alert(
          "Permission required",
          "We need access to your photos to upload images"
        );
      }

      if (locationStatus !== "granted") {
        Alert.alert("Permission required", "We need access to your location");
      }

      loadReports();
    })();
  }, []);

  const loadReports = async () => {
    try {
      if (!userId) return;
      const userReports = await fetchUserReports(userId);
      setReports(userReports);
    } catch (error) {
      Alert.alert("Error", "Failed to load reports");
    }
  };

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

  const getCurrentLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      // Reverse geocode to get address
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const addr = address[0];
        setLocation(
          `${addr.street}, ${addr.city}, ${addr.region}, ${addr.postalCode}, ${addr.country}`
        );
      }
    } catch (error) {
      Alert.alert("Error", "Could not get location");
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
    if (!file) {
      Alert.alert("No Image Selected", "Please upload an image first.");
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

      const prompt = `You are an expert in waste management and recycling. Analyze this image and provide:
        1. The type of waste (e.g., plastic, paper, glass, metal, organic)
        2. An estimate of the quantity or amount (in kg or liters)
        3. Your confidence level in this assessment (as a percentage)
        
        Respond in JSON format like this:
        {
          "wasteType": "type of waste",
          "quantity": "estimated quantity with unit",
          "confidence": confidence level as a number between 0 and 1
        }`;

      const result = await model.generateContent([prompt, ...imageParts]);
      const responseText = result.response.text();

      try {
        const parsedText = responseText.replace(/```json|```/g, "").trim();
        const parsedResult = JSON.parse(parsedText);

        if (
          parsedResult.wasteType &&
          parsedResult.quantity &&
          parsedResult.confidence
        ) {
          setVerificationResult(parsedResult);
          setVerificationStatus("success");
          setWasteType(parsedResult.wasteType);
          setAmount(parsedResult.quantity);
        } else {
          setVerificationStatus("failure");
          Alert.alert(
            "Verification Failed",
            "Could not analyze the waste properly."
          );
        }
      } catch (error) {
        console.error("Failed to parse response:", responseText);
        setVerificationStatus("failure");
        Alert.alert(
          "Verification Failed",
          "Could not understand the AI response."
        );
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus("failure");
      Alert.alert(
        "Verification Failed",
        "An error occurred during verification."
      );
    }
  };

  const handleSubmit = async () => {
    if (!location || verificationStatus !== "success" || !userId) {
      Alert.alert(
        "Incomplete Data",
        "Please verify the waste and enter location."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData = {
        userId,
        image: file!,
        location,
        wasteType,
        amount,
        verificationData: verificationResult,
      };

      const newReport = await submitReportToAPI(reportData);
      setReports([newReport, ...reports]);

      // Reset form
      resetForm();

      Alert.alert("Success", "Your waste report has been submitted.");
    } catch (error) {
      Alert.alert("Error", "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setVerificationResult(null);
    setLocation("");
    setWasteType("");
    setAmount("");
    setVerificationStatus("idle");
  };

  const renderReportItem = ({ item }: { item: Report }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <MaterialIcons name="location-on" size={18} color="#666" />
        <Text style={styles.reportLocation}>{item.location}</Text>
      </View>
      <View style={styles.reportDetails}>
        <Text style={styles.reportDetail}>Type: {item.wasteType}</Text>
        <Text style={styles.reportDetail}>Amount: {item.amount}</Text>
        <Text style={styles.reportDetail}>
          Date: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={{ width: "100%", height: 150, marginTop: 10, borderRadius: 8 }}
        />
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Report Waste</Text>

      {/* Image Upload Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upload Waste Image</Text>

        <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
          <MaterialIcons name="cloud-upload" size={32} color="#666" />
          <Text style={styles.uploadText}>Tap to upload an image</Text>
        </TouchableOpacity>

        {file && <Image source={{ uri: file }} style={styles.imagePreview} />}

        <TouchableOpacity
          onPress={handleVerify}
          disabled={
            !file ||
            verificationStatus === "verifying" ||
            verificationStatus === "success"
          }
          style={[
            styles.actionButton,
            (!file ||
              verificationStatus === "verifying" ||
              verificationStatus === "success") &&
              styles.disabledButton,
          ]}
        >
          {verificationStatus === "verifying" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify Waste</Text>
          )}
        </TouchableOpacity>

        {verificationStatus === "success" && verificationResult && (
          <View style={styles.successBox}>
            <View style={styles.successHeader}>
              <FontAwesome name="check-circle" size={20} color="#28a745" />
              <Text style={styles.successTitle}>Verification Successful</Text>
            </View>
            <Text style={styles.successText}>
              Waste Type: {verificationResult.wasteType}
            </Text>
            <Text style={styles.successText}>
              Quantity: {verificationResult.quantity}
            </Text>
            <Text style={styles.successText}>
              Confidence: {(verificationResult.confidence * 100).toFixed(2)}%
            </Text>
          </View>
        )}
      </View>

      {/* Location Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>

        <TouchableOpacity
          onPress={getCurrentLocation}
          style={styles.locationButton}
        >
          <Feather name="map-pin" size={18} color="#fff" />
          <Text style={styles.locationButtonText}>Use Current Location</Text>
        </TouchableOpacity>

        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          <Marker coordinate={region} />
        </MapView>

        <TextInput
          placeholder="Enter location manually"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
        />
      </View>

      {/* Waste Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Waste Details</Text>

        <TextInput
          placeholder="Waste type (auto-filled)"
          value={wasteType}
          onChangeText={setWasteType}
          style={[styles.input, styles.disabledInput]}
          editable={false}
        />

        <TextInput
          placeholder="Amount (auto-filled)"
          value={amount}
          onChangeText={setAmount}
          style={[styles.input, styles.disabledInput]}
          editable={false}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={[styles.submitButton, isSubmitting && styles.disabledButton]}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit Report</Text>
        )}
      </TouchableOpacity>

      {/* Recent Reports */}
      <Text style={styles.reportsHeader}>Recent Reports</Text>

      {reports.length === 0 ? (
        <Text style={styles.noReportsText}>No reports submitted yet</Text>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
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
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  uploadButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    borderColor: "#ddd",
  },
  uploadText: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 16,
    resizeMode: "contain",
  },
  actionButton: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  successBox: {
    backgroundColor: "#d4edda",
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
    padding: 12,
    borderRadius: 4,
    marginTop: 16,
  },
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#28a745",
    marginLeft: 8,
  },
  successText: {
    fontSize: 14,
    color: "#155724",
    marginVertical: 2,
  },
  locationButton: {
    backgroundColor: "#6c757d",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  locationButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 14,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  reportsHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  noReportsText: {
    textAlign: "center",
    color: "#666",
    marginVertical: 20,
  },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reportLocation: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
    color: "#333",
  },
  reportDetails: {
    marginLeft: 26,
  },
  reportDetail: {
    fontSize: 14,
    color: "#666",
    marginVertical: 2,
  },
});
