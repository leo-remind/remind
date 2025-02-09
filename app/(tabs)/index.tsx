import { Image, StyleSheet, Platform, Pressable, Text, View, Button, ScrollView, TouchableOpacity } from "react-native";

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
import React, { useEffect, useState } from "react";
import { addDummyData } from "@/lib/conversations";

import { AddReminderModal } from "@/components/AddReminder";
export default function HomeScreen() {

  const db = useSQLiteContext();

  let buttonPress = () => {
    insertDummyConversations(db);
  }

  useEffect(() => {
    const fn = async () => {
      await addDummyData(db);
      console.log("added dummy data")
    }
    fn()
  }, [])

  // <Button onPress={buttonPress} title="cooking"/>
  const remindersRes: { 'id': number, 'reminder_time': string, 'reminder_text': string, 'subtitle': string }[] = db.getAllSync("SELECT * FROM reminders;")
  const now = new Date()
  const reminders = remindersRes.map(({ id, reminder_time, reminder_text, subtitle }) => {
    const ts = new Date(reminder_time);
    let minutes: number = Math.floor((ts.getTime() - now.getTime()) / 60000);
    const hours = Math.floor(minutes / 60)
    minutes = minutes % 60;
    return { remg: hours == 0 ? `${minutes} mins` : `${hours} hours - ${minutes} mins`, text: reminder_text, subtitle: subtitle, id: id }
  })

  const [isModalVisible, setIsModalVisible] = useState(false);
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
          <TouchableOpacity onPress={() => setIsModalVisible(true)} className="bg-light-blue/50 p-4 rounded-xl">
            <Text className="text-4xl font-bold color-blue m-auto">+</Text>
          </TouchableOpacity>
          <AddReminderModal
            isVisible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
          />
        </View>
        {
          reminders.map(
            ({ remg, text, subtitle, id }) => {
              return (<ReminderItem key={id} timeLeft={remg} heading={text} subtitle={subtitle} />)
            }
          )
        }
      </ScrollView>
    </SafeAreaView>
  );
}
