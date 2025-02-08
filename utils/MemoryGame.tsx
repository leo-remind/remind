// utils/MemoryGame.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, Image, TouchableOpacity, Alert, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface Card {
  id: number
  value: number
  isFlipped: boolean
  isMatched: boolean
  imageUrl: any
}

// Sample card images - replace with your actual images
const cardImages = {
  1: require('../assets/card1.png'),
  2: require('../assets/card2.png'),
  3: require('../assets/card3.png'),
  4: require('../assets/card4.png'),
  5: require('../assets/card5.png'),
  6: require('../assets/card6.png'),
  7: require('../assets/card7.png'),
  8: require('../assets/card8.png'),
}

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [score, setScore] = useState(0)
  const windowWidth = Dimensions.get('window').width

  // Calculate card dimensions for 4x4 grid
  const cardWidth = (windowWidth - 40) / 4 // 40 for padding
  const cardHeight = cardWidth * 1.4 // maintain aspect ratio

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    // Create pairs of cards (16 cards = 8 pairs)
    const cardValues = [1, 2, 3, 4, 5, 6, 7, 8]
    const initialCards: Card[] = []
    
    // Create pairs of cards
    cardValues.forEach((value) => {
      for (let i = 0; i < 2; i++) {
        initialCards.push({
          id: initialCards.length,
          value,
          isFlipped: false,
          isMatched: false,
          imageUrl: cardImages[value],
        })
      }
    })

    setCards(shuffleArray(initialCards))
    setFlippedCards([])
    setMoves(0)
    setScore(0)
  }

  const shuffleArray = (array: Card[]) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const handleCardPress = (cardId: number) => {
    if (flippedCards.length === 2) return
    
    const card = cards.find((c) => c.id === cardId)
    if (!card || card.isMatched || card.isFlipped) return

    const updatedCards = cards.map((c) =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    )
    setCards(updatedCards)

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1)
      checkForMatch(newFlippedCards, updatedCards)
    }
  }

  const checkForMatch = (flippedCardIds: number[], currentCards: Card[]) => {
    const [firstId, secondId] = flippedCardIds
    const firstCard = currentCards.find((c) => c.id === firstId)
    const secondCard = currentCards.find((c) => c.id === secondId)

    if (firstCard && secondCard) {
      if (firstCard.value === secondCard.value) {
        // Match found
        setTimeout(() => {
          setCards(currentCards.map((c) =>
            c.id === firstId || c.id === secondId
              ? { ...c, isMatched: true }
              : c
          ))
          setFlippedCards([])
          setScore((prev) => prev + 10)
          
          // Check for game completion
          const allMatched = currentCards.every((c) => 
            (c.id === firstId || c.id === secondId) ? true : c.isMatched
          )
          if (allMatched) {
            Alert.alert(
              'Congratulations! 🎉',
              `You completed the game in ${moves + 1} moves!\nFinal Score: ${score + 10}`,
              [{ text: 'Play Again', onPress: initializeGame }]
            )
          }
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          setCards(currentCards.map((c) =>
            c.id === firstId || c.id === secondId
              ? { ...c, isFlipped: false }
              : c
          ))
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  const CardComponent = ({ card }: { card: Card }) => (
    <TouchableOpacity
      onPress={() => handleCardPress(card.id)}
      className="m-1 rounded-lg overflow-hidden"
      style={{ width: cardWidth, height: cardHeight }}
    >
      <Image
        source={card.isFlipped || card.isMatched ? card.imageUrl : require('../assets/card-back.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-row justify-between items-center p-4">
        <View className="flex-row items-center">
          <Text className="text-lg font-bold">Moves: </Text>
          <Text className="text-lg">{moves}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-lg font-bold">Score: </Text>
          <Text className="text-lg">{score}</Text>
        </View>
      </View>

      <View className="flex-1 px-4">
        <View className="flex-row flex-wrap justify-center">
          {cards.map((card) => (
            <CardComponent key={card.id} card={card} />
          ))}
        </View>
      </View>

      <View className="p-4">
        <TouchableOpacity
          onPress={initializeGame}
          className="bg-blue-500 p-4 rounded-xl"
        >
          <Text className="text-white text-center text-lg font-bold">New Game</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default MemoryGame