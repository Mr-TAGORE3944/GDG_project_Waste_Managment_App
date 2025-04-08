import { Link } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import axios from "axios";

// const API_BASE_URL = "http://10.0.2.2:5000/api";

const API_BASE_URL = "http://192.168.1.20:5000/api/";

// Replace with your backend URL

type Reward = {
  _id: string;
  name: string;
  description: string;
  pointsRequired: number;
  image?: string;
};

type Transaction = {
  _id: string;
  type: "earned" | "redeemed";
  amount: number;
  description: string;
  date: string;
};

export default function Rewards() {
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("143"); // Replace with actual user ID
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  // Fetch user points and rewards
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const [userResponse, rewardsResponse, transactionsResponse] =
        await Promise.all([
          axios.get(`${API_BASE_URL}/users/${userId}`),
          axios.get(`${API_BASE_URL}/rewards`),
          axios.get(`${API_BASE_URL}/transactions/${userId}`),
        ]);

      setPoints(userResponse.data.points);
      setRewards(rewardsResponse.data);
      setTransactions(transactionsResponse.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load rewards data");
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Redeem a reward
  const handleRedeem = async (rewardId: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/rewards/redeem`, {
        userId,
        rewardId,
      });

      // Update local state
      setPoints(response.data.remainingPoints);
      setTransactions((prev) => [
        {
          _id: Date.now().toString(),
          type: "redeemed",
          amount: rewards.find((r) => r._id === rewardId)?.pointsRequired || 0,
          description: `Redeemed: ${
            rewards.find((r) => r._id === rewardId)?.name
          }`,
          date: new Date().toISOString(),
        },
        ...prev,
      ]);

      Alert.alert("Success", "Reward redeemed successfully!");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to redeem reward"
      );
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView
      className="p-4 bg-gray-100 mt-6"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <Text className="text-3xl font-semibold mb-6 text-gray-800 text-center">
        Rewards
      </Text>

      {/* Reward Balance Section */}
      <View className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500 mb-8">
        <Text className="text-xl font-semibold mb-4 text-gray-800">
          Reward Balance
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-3xl mr-3">💰</Text>
            <View>
              <Text className="text-4xl font-bold text-green-500">
                {points}
              </Text>
              <Text className="text-sm text-gray-500">Available Points</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent Transactions Section */}
      <View className="mb-8">
        <Text className="text-2xl font-semibold mb-4 text-gray-800">
          Recent Transactions
        </Text>
        <View className="bg-white rounded-xl shadow-md">
          {transactions.length === 0 ? (
            <View className="p-4">
              <Text className="text-center text-gray-500">
                No transactions yet
              </Text>
            </View>
          ) : (
            transactions.map((transaction) => (
              <View
                key={transaction._id}
                className="flex-row items-center justify-between p-4 border-b border-gray-200"
              >
                <View className="flex-row items-center">
                  <Text className="text-lg mr-3">
                    {transaction.type === "earned" ? "⬆️" : "⬇️"}
                  </Text>
                  <View>
                    <Text className="font-medium text-gray-800">
                      {transaction.description}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Text
                  className={`font-semibold ${
                    transaction.type === "earned"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {transaction.type === "earned" ? "+" : "-"}
                  {transaction.amount}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>

      <Link href="/leaderboard" asChild className="mx-auto">
        <TouchableOpacity className="m-10 w-full bg-blue-500 p-6 rounded-lg items-center">
          <Text className="text-white">Leader Board</Text>
        </TouchableOpacity>
      </Link>

      {/* Available Rewards Section */}
      <View className="mb-[150px]">
        <Text className="text-2xl font-semibold mb-4 text-gray-800">
          Available Rewards
        </Text>
        <View className="space-y-4">
          {rewards.length === 0 ? (
            <View className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">⚠️</Text>
                <Text className="text-yellow-700">
                  No rewards available at the moment.
                </Text>
              </View>
            </View>
          ) : (
            rewards.map((reward) => (
              <View
                key={reward._id}
                className="bg-white p-4 rounded-xl shadow-md"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-lg font-semibold text-gray-800">
                    {reward.name}
                  </Text>
                  <Text className="text-green-500 font-semibold">
                    {reward.pointsRequired} points
                  </Text>
                </View>
                <Text className="text-gray-600 mb-2">{reward.description}</Text>
                <TouchableOpacity
                  className={`w-full p-3 rounded-lg items-center ${
                    points >= reward.pointsRequired
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                  onPress={() => handleRedeem(reward._id)}
                  disabled={points < reward.pointsRequired}
                >
                  <Text className="text-white">🎁 Redeem Reward</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
