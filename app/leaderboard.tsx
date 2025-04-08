import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import axios from "axios";

const API_BASE_URL = "http://192.168.1.20:5000/api/";

// Replace with your backend URL
// const API_BASE_URL = ""; // Replace with your backend URL

type LeaderboardUser = {
  _id: string;
  name: string;
  points: number;
  level: number;
  rank: number;
  avatar?: string;
};

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/leaderboard`);
      setUsers(response.data.users);
      setCurrentUser(response.data.currentUser);
    } catch (error) {
      Alert.alert("Error", "Failed to load leaderboard");
      console.error("Fetch leaderboard error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return rank.toString();
    }
  };

  const getLevelColor = (level: number) => {
    const colors = [
      "text-indigo-800", // Level 1
      "text-indigo-700", // Level 2
      "text-indigo-600", // Level 3
      "text-indigo-500", // Level 4
      "text-indigo-400", // Level 5
    ];
    return colors[Math.min(level - 1, colors.length - 1)] || "text-indigo-800";
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView
      className="p-4 bg-gray-100"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <Text className="text-3xl font-semibold mb-6 text-gray-800 text-center">
        Leaderboard
      </Text>

      {/* Current User Stats (if available) */}
      {currentUser && (
        <View className="bg-white shadow-md rounded-xl p-4 mb-6 border-l-4 border-blue-500">
          <Text className="text-lg font-semibold mb-2 text-gray-800">
            Your Position
          </Text>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Text className="text-xl mr-3">👤</Text>
              <View>
                <Text className="text-sm font-medium text-gray-900">
                  {currentUser.name}
                </Text>
                <Text className="text-xs text-gray-500">
                  Rank #{currentUser.rank}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Text className="text-sm font-semibold text-gray-900 mr-2">
                {currentUser.points} pts
              </Text>
              <Text
                className={`text-sm font-semibold ${getLevelColor(
                  currentUser.level
                )}`}
              >
                Level {currentUser.level}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Leaderboard Container */}
      <View className="bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Top Performers Banner */}
        <View className="bg-gradient-to-r from-green-500 to-green-600 p-6">
          <View className="flex-row justify-between items-center">
            <Text className="text-3xl">🏆</Text>
            <Text className="text-2xl font-bold text-white">
              Top Performers
            </Text>
            <Text className="text-3xl">🏅</Text>
          </View>
        </View>

        {/* Leaderboard Table */}
        <View className="overflow-hidden">
          <View className="bg-gray-50 p-4">
            <View className="flex-row">
              <Text className="flex-1 text-xs font-semibold text-gray-500">
                Rank
              </Text>
              <Text className="flex-1 text-xs font-semibold text-gray-500">
                User
              </Text>
              <Text className="flex-1 text-xs font-semibold text-gray-500">
                Points
              </Text>
              <Text className="flex-1 text-xs font-semibold text-gray-500">
                Level
              </Text>
            </View>
          </View>

          {/* Leaderboard Rows */}
          <View className="p-4">
            {users.length === 0 ? (
              <View className="py-4">
                <Text className="text-center text-gray-500">
                  No users found
                </Text>
              </View>
            ) : (
              users.map((user) => (
                <View
                  key={user._id}
                  className={`flex-row items-center py-3 ${
                    currentUser?._id === user._id ? "bg-blue-50" : ""
                  }`}
                >
                  <Text className="flex-1 text-sm font-medium text-gray-900">
                    {getRankEmoji(user.rank)}
                  </Text>
                  <View className="flex-1 flex-row items-center">
                    <Text className="text-2xl mr-2">👤</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {user.name}
                    </Text>
                  </View>
                  <View className="flex-1 flex-row items-center">
                    <Text className="text-2xl mr-2">🏅</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {user.points.toLocaleString()}
                    </Text>
                  </View>
                  <Text
                    className={`flex-1 text-sm font-semibold ${getLevelColor(
                      user.level
                    )}`}
                  >
                    Level {user.level}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
