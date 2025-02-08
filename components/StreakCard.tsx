import type React from "react"
import { useEffect, useState } from "react"
import { View, Text } from "react-native"

interface DateProps {
  day: number
  isActive: boolean
  playedToday: boolean
}
const Day: React.FC<DateProps> = ({ day, isActive, playedToday }) => {
  return (
    <View className={`w-8 h-8 justify-center items-center ${isActive ? (playedToday ? 'bg-white rounded-2xl' : 'bg-[rgba(0,0,0,0.3)] rounded-2xl') : ''
      }`}>
      <Text className={`text-base font-medium ${isActive ? (playedToday ? 'text-green' : 'text-white') : 'text-white'
        }`}>
        {day}
      </Text>
    </View>
  )
}

interface StreakProps {
  streak: number,
  playedToday: boolean
}

export const StreakCard: React.FC<StreakProps> = ({ streak, playedToday }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [dates, setDates] = useState<Date[]>([]);

  const getDateRange = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1));
    const newDates = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      currentDay.setHours(0, 0, 0, 0);
      newDates.push(currentDay);
    }
    return newDates;
  }

  useEffect(() => {
    setDates(getDateRange())
  }, [])

  const streakStartDate = new Date();
  streakStartDate.setDate(today.getDate() - streak);
  const streakStart = streakStartDate < dates[0] ? dates[0].getDate() : streakStartDate.getDate()

  const streakStartIndex = dates.findIndex((date) => date.getDate() === streakStart)
  const streakEndIndex = dates.findIndex((date) => date.getDate() === today.getDate())

  return (
    <View className="bg-green rounded-3xl p-4 mx-4 my-2">
      <Text className="text-[34px] text-white font-normal mb-4">
        <Text className="font-semibold">{streak}</Text>{streak === 1 ? " Day" : " Days"}
      </Text>

      <View className="relative h-10 justify-center">
        <View
          className="absolute h-8 bg-[rgba(255,255,255,0.2)] rounded-2xl"
          style={{
            left: `${(streakStartIndex / 6) * 100}%`,
            right: `${(1 - (streakEndIndex) / 6) * 100}%`,
          }}
        />

        <View className="flex-row justify-between items-center">
          {dates.map((day, index) => (
            <Day key={index} day={day.getDate()} isActive={day.getDate() === today.getDate()} playedToday={playedToday} />
          ))}
        </View>
      </View>
    </View>
  )
}
