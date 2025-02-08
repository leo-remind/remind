import { View, Text, SafeAreaView, ScrollView } from "react-native"
import { StreakCard } from "@/components/StreakCard"
import { GameCard } from "@/components/GameCard"
import { useEffect, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import React from "react"
import { useRouter } from "expo-router"

export default function DailyPracticeScreen() {
  const router = useRouter()
  const [streak, setStreak] = useState(10)
  const [playedToday, setPlayedToday] = useState(false)

  useEffect(() => {
    loadStreak()
  }, [])

  useEffect(() => {
    incrementStreak()
  }, [playedToday])

  const loadStreak = async () => {
    try {
      const storedStreak = "1" // get from db
      if (storedStreak !== null) {
        setStreak(parseInt(storedStreak))
      }
    } catch (error) {
      console.error('Error loading streak:', error)
    }
  }

  const incrementStreak = async () => {
    try {
      const newStreak = streak + 1
      // store streak
      setStreak(newStreak)
    } catch (error) {
      console.error('Error saving streak:', error)
    }
  }

  const handleGameComplete = () => {
    setPlayedToday(true)
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-between items-start px-8 pt-8">
        <View>
          <Text className="text-4xl font-sans">Your</Text>
          <Text className="text-4xl font-sans text-green font-bold">Memories</Text>
        </View>
        <Text className="text-8xl font-sans text-green">*</Text>
      </View>
      <StreakCard streak={streak} playedToday={playedToday} />

      <ScrollView>
        <GameCard
          title="Memory Game"
          imageUrl={require("../../assets/images/group_14.png")}
          gameType="memory"
        />

        <GameCard 
          title="Game 2" 
          imageUrl={require("../../assets/images/group_14.png")} 
          gameType="other"
        />
      </ScrollView>
    </SafeAreaView>
  )
}