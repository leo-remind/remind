import { View } from 'react-native'
import { useRouter } from 'expo-router'
import MemoryGame from '@/utils/MemoryGame'
import React from 'react'

export default function MemoryGameScreen() {
  const router = useRouter()

  const handleGameComplete = (score: number) => {
    // Here you can handle the game completion
    // For example, update the streak or store the score
    router.back()
  }

  return (
    <View className="flex-1">
      <MemoryGame onGameComplete={handleGameComplete} />
    </View>
  )
}