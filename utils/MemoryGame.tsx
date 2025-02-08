// utils/MemoryGame.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Alert, type ImageSourcePropType } from 'react-native'
import { GameCard } from '../components/GameCard'

interface Card {
  id: number
  value: number
  isFlipped: boolean
  isMatched: boolean
  imageUrl: ImageSourcePropType
}

// Sample card images - replace these with your actual images
const cardImages = {
  1: require('../assets/card1.png'),
  2: require('../assets/card2.png'),
  3: require('../assets/card3.png'),
  4: require('../assets/card4.png'),
  5: require('../assets/card5.png'),
  6: require('../assets/card6.png'),
  7: require('../assets/card7.png'),
  8: require('../assets/card8.png'),
  9: require('../assets/card9.png'),
  10: require('../assets/card10.png'),
  11: require('../assets/card11.png'),
  12: require('../assets/card12.png'),
  // Add more card images as needed
}

interface MemoryGameProps {
  numPairs?: number // Number of card pairs to show
  cardSize?: 'small' | 'medium' | 'large' // Optional size prop for different grid layouts
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ 
  numPairs = 6, // Default to 6 pairs (12 cards)
  cardSize = 'medium'
}) => {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [score, setScore] = useState(0)

  useEffect(() => {
    initializeGame()
  }, [])

  // Get card width based on size prop
  const getCardWidth = () => {
    switch (cardSize) {
      case 'small': return 'w-1/4' // 4 cards per row
      case 'large': return 'w-1/2' // 2 cards per row
      default: return 'w-1/3'      // 3 cards per row (medium)
    }
  }

  const initializeGame = () => {
    // Create array of numbers from 1 to numPairs
    const cardValues = Array.from({ length: numPairs }, (_, i) => i + 1)
    const initialCards: Card[] = []
    
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
        setTimeout(() => {
          setCards(currentCards.map((c) =>
            c.id === firstId || c.id === secondId
              ? { ...c, isMatched: true }
              : c
          ))
          setFlippedCards([])
          setScore((prev) => prev + 10)
          
          const allMatched = currentCards.every((c) => 
            (c.id === firstId || c.id === secondId) ? true : c.isMatched
          )
          if (allMatched) {
            Alert.alert(
              'Congratulations!',
              `You won in ${moves + 1} moves!\nScore: ${score + 10}`,
              [{ text: 'Play Again', onPress: initializeGame }]
            )
          }
        }, 1000)
      } else {
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

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row justify-between p-4">
        <Text className="text-lg">Moves: {moves}</Text>
        <Text className="text-lg">Score: {score}</Text>
      </View>
      
      <View className="flex-1 flex-row flex-wrap justify-center">
        {cards.map((card) => (
          <View key={card.id} className={`${getCardWidth()} p-1`}
            <GameCard
              title={card.isFlipped || card.isMatched ? `${card.value}` : "?"}
              imageUrl={card.isFlipped || card.isMatched ? card.imageUrl : require('../assets/card-back.png')}
              onPress={() => handleCardPress(card.id)}
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={initializeGame}
        className="m-4 p-4 bg-blue-500 rounded-lg"
      >
        <Text className="text-white text-center text-lg">New Game</Text>
      </TouchableOpacity>
    </View>
  )
}