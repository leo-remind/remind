import React from "react"
import { View, Text, Image, type ImageSourcePropType, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"

interface GameCardProps {
  title: string
  imageUrl: ImageSourcePropType
  gameType: string
}

export const GameCard: React.FC<GameCardProps> = ({ title, imageUrl, gameType }) => {
  const router = useRouter()

  const handlePress = () => {
    if (gameType === 'memory') {
      router.push('/games/memory') 
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="h-[200px] rounded-2xl overflow-hidden mx-4 my-2"
    >
      <Image source={imageUrl} className="object-cover" style={{ height: "100%", width: "100%" }} />
      <View className="absolute top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.3)] justify-end p-4">
        <Text className="text-white text-2xl font-bold">{title}</Text>
      </View>
    </TouchableOpacity>
  )
}