import React from "react";
import { View, Text, ScrollView } from "react-native";

export default function Leaderboard() {
  return (
    <ScrollView className="p-4 bg-gray-100">
      {/* Header */}
      <Text className="text-3xl font-semibold mb-6 text-gray-800 text-center">
        Leaderboard
      </Text>

      {/* Leaderboard Container */}
      <View className="bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Top Performers Banner */}
        <View className="bg-gradient-to-r from-green-500 to-green-600 p-6">
          <View className="flex-row justify-between items-center">
            <Text className="text-3xl">🏆</Text> {/* Trophy emoji */}
            <Text className="text-2xl font-bold text-white">
              Top Performers
            </Text>
            <Text className="text-3xl">🏅</Text> {/* Award emoji */}
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
            {/* Row 1 */}
            <View className="flex-row items-center py-3">
              <Text className="flex-1 text-sm font-medium text-gray-900">
                🥇
              </Text>{" "}
              {/* Crown emoji */}
              <View className="flex-1 flex-row items-center">
                <Text className="text-2xl mr-2">👤</Text> {/* User emoji */}
                <Text className="text-sm font-medium text-gray-900">
                  User 1
                </Text>
              </View>
              <View className="flex-1 flex-row items-center">
                <Text className="text-2xl mr-2">🏅</Text> {/* Award emoji */}
                <Text className="text-sm font-semibold text-gray-900">
                  1,000
                </Text>
              </View>
              <Text className="flex-1 text-sm font-semibold text-indigo-800">
                Level 5
              </Text>
            </View>

            {/* Row 2 */}
            <View className="flex-row items-center py-3">
              <Text className="flex-1 text-sm font-medium text-gray-900">
                🥈
              </Text>{" "}
              {/* Crown emoji */}
              <View className="flex-1 flex-row items-center">
                <Text className="text-2xl mr-2">👤</Text> {/* User emoji */}
                <Text className="text-sm font-medium text-gray-900">
                  User 2
                </Text>
              </View>
              <View className="flex-1 flex-row items-center">
                <Text className="text-2xl mr-2">🏅</Text> {/* Award emoji */}
                <Text className="text-sm font-semibold text-gray-900">800</Text>
              </View>
              <Text className="flex-1 text-sm font-semibold text-indigo-800">
                Level 4
              </Text>
            </View>

            {/* Row 3 */}
            <View className="flex-row items-center py-3">
              <Text className="flex-1 text-sm font-medium text-gray-900">
                🥉
              </Text>{" "}
              {/* Crown emoji */}
              <View className="flex-1 flex-row items-center">
                <Text className="text-2xl mr-2">👤</Text> {/* User emoji */}
                <Text className="text-sm font-medium text-gray-900">
                  User 3
                </Text>
              </View>
              <View className="flex-1 flex-row items-center">
                <Text className="text-2xl mr-2">🏅</Text> {/* Award emoji */}
                <Text className="text-sm font-semibold text-gray-900">600</Text>
              </View>
              <Text className="flex-1 text-sm font-semibold text-indigo-800">
                Level 3
              </Text>
            </View>

            {/* Row 4 */}
            <View className="flex-row items-center py-3">
              <Text className="flex-1 text-sm font-medium text-gray-900">
                4
              </Text>
              <View className="flex-1 flex-row items-center">
                <Text className="text-2xl mr-2">👤</Text> {/* User emoji */}
                <Text className="text-sm font-medium text-gray-900">
                  User 4
                </Text>
              </View>
              <View className="flex-1 flex-row items-center">
                <Text className="text-2xl mr-2">🏅</Text> {/* Award emoji */}
                <Text className="text-sm font-semibold text-gray-900">400</Text>
              </View>
              <Text className="flex-1 text-sm font-semibold text-indigo-800">
                Level 2
              </Text>
            </View>

            {/* Row 5 */}
            <View className="flex-row items-center py-3">
              <Text className="flex-1 text-sm font-medium text-gray-900">
                5
              </Text>
              <View className="flex-1 flex-row items-center">
                <Text className="text-2xl mr-2">👤</Text> {/* User emoji */}
                <Text className="text-sm font-medium text-gray-900">
                  User 5
                </Text>
              </View>
              <View className="flex-1 flex-row items-center">
                <Text className="text-2xl mr-2">🏅</Text> {/* Award emoji */}
                <Text className="text-sm font-semibold text-gray-900">200</Text>
              </View>
              <Text className="flex-1 text-sm font-semibold text-indigo-800">
                Level 1
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
