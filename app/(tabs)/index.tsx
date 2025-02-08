import { Image, StyleSheet, Platform, Pressable, Text, View, Button } from "react-native";

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

export default function HomeScreen() {
  
  const db = useSQLiteContext();

  let buttonPress = () => {
    insertDummyConversations(db);
  }

  return (
      <SafeAreaView className="flex-1 bg-white">
      <View>
      <View className="flex-row justify-between items-start px-8 pt-8 mb-[-1rem]">
        <View>
          <Text className="text-4xl font-sans">Welcome</Text>
          <Text className="text-4xl font-sans text-blue font-bold">Arbaaz</Text>
        </View>
        <Text className="text-8xl font-sans text-blue">*</Text>
        </View>
      <DiaryCard message="" className="bg-light-blue mt-6"/>
      </View>
      <Button onPress={buttonPress} title="cooking"/>
      </SafeAreaView>
  );
}
