import { Link } from "expo-router";
import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

export default function Rewards() {
  return (
    <ScrollView className="p-4 bg-gray-100 mt-6">
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
            <Text className="text-3xl mr-3">💰</Text> {/* Coins emoji */}
            <View>
              <Text className="text-4xl font-bold text-green-500">100</Text>{" "}
              {/* Placeholder balance */}
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
          {/* Transaction Item */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <Text className="text-lg mr-3">⬆️</Text>{" "}
              {/* ArrowUpRight emoji */}
              <View>
                <Text className="font-medium text-gray-800">
                  Earned from Report
                </Text>
                <Text className="text-sm text-gray-500">2023-10-01</Text>
              </View>
            </View>
            <Text className="font-semibold text-green-500">+50</Text>
          </View>

          {/* Transaction Item */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <Text className="text-lg mr-3">⬇️</Text>{" "}
              {/* ArrowDownRight emoji */}
              <View>
                <Text className="font-medium text-gray-800">
                  Redeemed Reward
                </Text>
                <Text className="text-sm text-gray-500">2023-09-30</Text>
              </View>
            </View>
            <Text className="font-semibold text-red-500">-20</Text>
          </View>

          {/* No Transactions Placeholder */}
          <View className="p-4">
            <Text className="text-center text-gray-500">
              No transactions yet
            </Text>
          </View>
        </View>
      </View>
      <Link href="/leaderboard" asChild className=" mx-auto ">
        <TouchableOpacity className="m-10 w-full bg-blue-500 p-6 rounded-lg items-center ">
          <Text className="text-white">Leader Board</Text>
          {/* <Text>→</Text> */}
        </TouchableOpacity>
      </Link>
      {/* Available Rewards Section */}
      <View className="mb-[150px]">
        <Text className="text-2xl font-semibold mb-4 text-gray-800">
          Available Rewards
        </Text>
        <View className="space-y-4">
          {/* Reward Item */}
          <View className="bg-white p-4 rounded-xl shadow-md">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-semibold text-gray-800">
                Gift Card
              </Text>
              <Text className="text-green-500 font-semibold">50 points</Text>
            </View>
            <Text className="text-gray-600 mb-2">
              Redeem for a $10 gift card.
            </Text>
            <Text className="text-sm text-gray-500 mb-4">
              Collect at any store.
            </Text>
            <TouchableOpacity className="w-full bg-green-500 p-3 rounded-lg items-center">
              <Text className="text-white">🎁 Redeem Reward</Text>{" "}
              {/* Gift emoji */}
            </TouchableOpacity>
          </View>

          {/* Reward Item */}
          <View className="bg-white p-4 rounded-xl shadow-md">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-semibold text-gray-800">
                Discount Coupon
              </Text>
              <Text className="text-green-500 font-semibold">30 points</Text>
            </View>
            <Text className="text-gray-600 mb-2">
              Get 20% off on your next purchase.
            </Text>
            <Text className="text-sm text-gray-500 mb-4">
              Valid for 30 days.
            </Text>
            <TouchableOpacity className="w-full bg-green-500 p-3 rounded-lg items-center">
              <Text className="text-white">🎁 Redeem Reward</Text>{" "}
              {/* Gift emoji */}
            </TouchableOpacity>
          </View>

          {/* No Rewards Placeholder */}
          <View className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">⚠️</Text>{" "}
              {/* AlertCircle emoji */}
              <Text className="text-yellow-700">
                No rewards available at the moment.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
