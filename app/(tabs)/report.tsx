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

export default function Report() {
  const [file, setFile] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    wasteType: string;
    quantity: string;
    confidence: number;
  } | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "failure"
  >("idle");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reports, setReports] = useState<
    { id: number; location: string; type: string; amount: string }[]
  >([]);

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
      setVerificationStatus("idle"); // Reset verification status if a new image is selected
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

      const prompt = `You are an AI expert in waste management. Analyze this image and return a JSON response with:
        {
          "wasteType": "Plastic",
          "quantity": "5 kg",
          "confidence": 0.95
        }`;

      const result = await model.generateContent([prompt, ...imageParts]);
      const responseText = result.response.text();

      try {
        const parsedResult = JSON.parse(
          responseText.replace(/```json|```/g, "").trim()
        );
        if (
          parsedResult.wasteType &&
          parsedResult.quantity &&
          parsedResult.confidence
        ) {
          setVerificationResult(parsedResult);
          setVerificationStatus("success");
        } else {
          setVerificationStatus("failure");
        }
      } catch (error) {
        setVerificationStatus("failure");
      }
    } catch (error) {
      setVerificationStatus("failure");
    }
  };

  // Submit Report
  const handleSubmit = () => {
    if (!location || verificationStatus !== "success") {
      Alert.alert(
        "Incomplete Data",
        "Please verify the waste and enter location."
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newReport = {
        id: reports.length + 1,
        location,
        type: verificationResult?.wasteType || "Unknown",
        amount: verificationResult?.quantity || "N/A",
      };

      setReports([newReport, ...reports]);
      setFile(null);
      setVerificationResult(null);
      setLocation("");
      setVerificationStatus("idle");
      setIsSubmitting(false);

      Alert.alert("Success", "Your waste report has been submitted.");
    }, 2000);
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
        Report Waste
      </Text>

      {/* Image Upload Section */}
      <View
        style={{
          backgroundColor: "#fff",
          padding: 16,
          borderRadius: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
          Upload Waste Image
        </Text>
        <TouchableOpacity
          onPress={pickImage}
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
            borderWidth: 2,
            borderStyle: "dashed",
            borderRadius: 12,
          }}
        >
          <Text style={{ fontSize: 24 }}>📤</Text>
          <Text style={{ fontSize: 14, color: "#666", marginTop: 8 }}>
            Upload a file
          </Text>
        </TouchableOpacity>

        {file && (
          <Image
            source={{ uri: file }}
            style={{
              width: "100%",
              height: 150,
              borderRadius: 12,
              marginTop: 16,
            }}
          />
        )}

        <TouchableOpacity
          onPress={handleVerify}
          disabled={verificationStatus === "success"} // Disable button after successful verification
          style={{
            backgroundColor:
              verificationStatus === "success" ? "#ccc" : "#007bff",
            padding: 12,
            borderRadius: 12,
            marginTop: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>
            {verificationStatus === "verifying"
              ? "Verifying..."
              : "Verify Waste"}
          </Text>
        </TouchableOpacity>

        {/* Display Verification Results */}
        {verificationStatus === "success" && verificationResult && (
          <View
            style={{
              backgroundColor: "#d4edda",
              padding: 12,
              borderRadius: 12,
              marginTop: 16,
            }}
          >
            <Text>✅ Verification Successful</Text>
            <Text>Waste Type: {verificationResult.wasteType}</Text>
            <Text>Quantity: {verificationResult.quantity}</Text>
            <Text>
              Confidence: {(verificationResult.confidence * 100).toFixed(2)}%
            </Text>
          </View>
        )}
      </View>

      {/* Location Input */}
      <View
        style={{
          backgroundColor: "#fff",
          padding: 16,
          borderRadius: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
          Enter Location
        </Text>
        <TextInput
          placeholder="Enter location"
          value={location}
          onChangeText={setLocation}
          style={{
            padding: 12,
            borderWidth: 1,
            borderRadius: 8,
            marginBottom: 8,
          }}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: "#28a745",
          padding: 12,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 16,
        }}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontSize: 16 }}>Submit Report</Text>
        )}
      </TouchableOpacity>

      {/* Recent Reports */}
      <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 24 }}>
        Recent Reports
      </Text>
      {reports.map((report) => (
        <View
          key={report.id}
          style={{
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 12,
            marginTop: 8,
          }}
        >
          <Text>📍 {report.location}</Text>
          <Text>Type: {report.type}</Text>
          <Text>Amount: {report.amount}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
