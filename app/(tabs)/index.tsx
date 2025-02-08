import { Image, StyleSheet, Platform, Pressable, Text, View, Button, ScrollView } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import DiaryCard from "@/components/ui/memories/DiaryCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { insertDummyConversations } from "@/utils/dummy";
import { migrateDbIfNeeded } from "@/utils/database";
import { useSQLiteContext } from "expo-sqlite";
import ReminderItem from "@/components/ReminderItem";
import React from "react";

export default function HomeScreen() {
  return (
      <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
      <View className="flex-row justify-between items-start px-8 pt-8">
        <View>
          <Text className="text-4xl font-sans">Welcome</Text>
          <Text className="text-4xl font-sans text-blue font-bold">Arbaaz</Text>
        </View>
        <Text className="text-8xl font-sans text-blue">*</Text>
        </View>
      <DiaryCard message="" className="bg-light-blue mt-6" />
      <View className="px-8 pt-8">
        <Text className="font-sans text-3xl mb-4 font-bold text-black/50">Reminders</Text>
        <View className="bg-light-blue/50 p-4 rounded-xl">
          <Text className="text-4xl font-bold color-blue m-auto">+</Text>
        </View>
      </View>
        <ReminderItem heading="Eat your medicine" subtitle="5 pills of benydryl" timeLeft="3 HOURS"/>
        <ReminderItem heading="Eat your medicine" subtitle="5 pills of benydryl" timeLeft="3 HOURS"/>
        <ReminderItem heading="Eat your medicine" subtitle="5 pills of benydryl" timeLeft="3 HOURS"/>
        <ReminderItem heading="Eat your medicine" subtitle="5 pills of benydryl" timeLeft="3 HOURS"/>
        <Link href={{pathname: "/onboarding"}} className="p-24 bg-green">Onboarding Survey</Link>
      </ScrollView>
      </SafeAreaView>
  );
}
