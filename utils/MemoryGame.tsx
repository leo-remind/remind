import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Image, TouchableOpacity, Alert, Dimensions, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface Card {
  id: number
  value: number
  isFlipped: boolean
  isMatched: boolean
  imageUrl: any
}

const cardImages = {
  1: require('../assets/images/MemoryGamePics/card1.png'),
  2: require('../assets/images/MemoryGamePics/card2.png'),
  3: require('../assets/images/MemoryGamePics/card3.png'),
  4: require('../assets/images/MemoryGamePics/card4.png'),
  5: require('../assets/images/MemoryGamePics/card5.png'),
  6: require('../assets/images/MemoryGamePics/card6.png'),
  7: require('../assets/images/MemoryGamePics/card7.png'),
  8: require('../assets/images/MemoryGamePics/card8.png'),
}

const AnimatedCard = ({ card, onPress, cardWidth, cardHeight }: { 
  card: Card
  onPress: () => void
  cardWidth: number
  cardHeight: number 
}) => {
  const flipAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(flipAnimation, {
      toValue: card.isFlipped || card.isMatched ? 1 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start()
  }, [card.isFlipped, card.isMatched])

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg']
  })

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  })

  return (
    <TouchableOpacity
      onPress={onPress}
      className="m-1"
      style={{ width: cardWidth, height: cardHeight }}
    >
      <View style={{ width: '100%', height: '100%' }}>
        <Animated.View
          className="absolute w-full h-full"
          style={[{ transform: [{ rotateY: backInterpolate }] }]}
        >
          <Image
            source={require('../assets/images/MemoryGamePics/card_back.jpeg')}
            style={{ width: '100%', height: '100%', borderRadius: 8 }}
            resizeMode="cover"
          />
        </Animated.View>
        <Animated.View
          className="absolute w-full h-full"
          style={[
            { transform: [{ rotateY: frontInterpolate }], backfaceVisibility: 'hidden' }
          ]}
        >
          <Image
            source={card.imageUrl}
            style={{ width: '100%', height: '100%', borderRadius: 8 }}
            resizeMode="cover"
          />
        </Animated.View>
      </View>
    </TouchableOpacity>
  )
}

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const windowWidth = Dimensions.get('window').width
  const cardWidth = (windowWidth - 40) / 4
  const cardHeight = cardWidth * 1.4

  useEffect(() => {
    initializeGame()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startTimer = () => {
    setIsGameActive(true)
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsGameActive(false)
  }

  const initializeGame = () => {
    const cardValues = [1, 2, 3, 4, 5, 6, 7, 8]
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
    setTimer(0)
    stopTimer()
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
    if (!isGameActive) startTimer()
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
            stopTimer()
            Alert.alert(
              'Congratulations! 🎉',
              `Time: ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}\nMoves: ${moves + 1}\nScore: ${score + 10}`,
              [{ text: 'Play Again', onPress: initializeGame }]
            )
          }
        }, 500)
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-row justify-between items-center p-4">
        <View className="flex-row items-center space-x-2">
          <Text className="text-lg font-bold">Moves: </Text>
          <Text className="text-lg">{moves}</Text>
        </View>
        <View className="flex-row items-center space-x-2">
          <Text className="text-lg font-bold">Time: </Text>
          <Text className="text-lg">{formatTime(timer)}</Text>
        </View>
        <View className="flex-row items-center space-x-2">
          <Text className="text-lg font-bold">Score: </Text>
          <Text className="text-lg">{score}</Text>
        </View>
      </View>

      <View className="flex-1 px-4">
        <View className="flex-row flex-wrap justify-center">
          {cards.map((card) => (
            <AnimatedCard 
              key={card.id} 
              card={card}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              onPress={() => handleCardPress(card.id)}
            />
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