import React, { useState, useMemo, useLayoutEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isAfter, isSameMonth, addMonths, subMonths } from 'date-fns';
// import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import "../../global.css";
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

interface Conversation {
  id: number;
  person: string;
  text: string;
  imageUrl: string;
}

const CalendarScreen: React.FC = () => {
  const { date } = useLocalSearchParams();
  const parsedDate = Array.isArray(date) ? date[0] : date;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(parseFloat(parsedDate)));
  const [showMonthView, setShowMonthView] = useState<boolean>(false);

  const currentMonth = useMemo(() => format(selectedDate, 'MMMM yyyy'), [selectedDate]);
  const monthStart = useMemo(() => startOfMonth(selectedDate), [selectedDate]);
  const monthEnd = useMemo(() => endOfMonth(selectedDate), [selectedDate]);
  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const weekEnd = useMemo(() => endOfWeek(selectedDate), [selectedDate]);

  const navigation = useNavigation();


  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Memory: ${format(new Date(parseFloat(parsedDate)), 'dd MMMM yyyy')}`, // Customize title based on `mid`
    });
  }, [navigation, date]);

  const calendarDays = useMemo(() => {
    if (showMonthView) {
      const start = startOfWeek(monthStart);
      const end = endOfWeek(monthEnd);
      return eachDayOfInterval({ start, end });
    }
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [monthStart, monthEnd, weekStart, weekEnd, showMonthView]);

  const handleDayPress = (day: Date) => {
    if (!isAfter(day, new Date())) {
      setSelectedDate(day);
      setShowMonthView(false);
    }
  };

  const handleMonthPress = () => {
    setShowMonthView(!showMonthView);
  };

  const handlePreviousMonth = () => {
    setSelectedDate(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(addMonths(selectedDate, 1));
  };

  const handleConversationPress = (conversation: Conversation) => {
    alert(`${conversation.person}: ${conversation.text}`);
  };

  const getDayClasses = (day: Date): string => {
    const baseClasses = "w-14 h-12 flex items-center justify-center rounded-full";
    const classes = [baseClasses];

    if (format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) {
      classes.push('bg-blue');
    }

    if (isAfter(day, new Date())) {
      classes.push('opacity-50 cursor-not-allowed');
    }

    if (showMonthView && !isSameMonth(day, selectedDate)) {
      classes.push('opacity-50');
    }

    return classes.join(' ');
  };

  const getDayTextClasses = (day: Date): string => {
    const classes = ['text-base'];

    if (isAfter(day, new Date()) || (showMonthView && !isSameMonth(day, selectedDate))) {
      classes.push('text-gray-400');
    }

    if (format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) {
      classes.push('text-white');
    }

    return classes.join(' ');
  };

  const conversations: Conversation[] = [
    {
      id: 1,
      person: "Arnav",
      text: "You talked to Arnav about shopping",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/38/Flower_July_2011-2_1_cropped.jpg"
    },
    {
      id: 2,
      person: "Arbaaz",
      text: "Arbaaz told you about his Bali trip",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/38/Flower_July_2011-2_1_cropped.jpg"
    },
    {
      id: 3,
      person: "Sarah",
      text: "Had a conversation about Good Pizza, Great Pizza with Pranjal",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/38/Flower_July_2011-2_1_cropped.jpg"
    },
    {
      id: 4,
      person: "Mom",
      text: "Your mom talked to you about your father's birthday",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/38/Flower_July_2011-2_1_cropped.jpg"
    }
  ];


  const db = useSQLiteContext();

  let dateLol = format(selectedDate, 'yyyy-MM-dd');
  // let dateBeauty = dateLol.split("T")[0]

  console.log(dateLol);
  // const MemoryID = db.g
  const conversationsDB = db.getAllSync(`SELECT * FROM conversations WHERE DATE(time_created) = "${dateLol}";`);
  // const memory = db.getFirstSync("SELECT * FROM memory WHERE date = ? ORDER BY id DESC;", `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  console.log("conversations", conversationsDB.length);

  // const timeCreated = db.getAllSync(`SELECT DATE(time_created) FROM conversations;`);

  // console.log("tc", timeCreated);

  const renderConversationSummary = () => {
    if (!showMonthView) {
      return (
        <ScrollView className="flex-1 p-4 bg-gray-50 overflow-y-auto">
          <View className="mb-5">
            <Text className="text-lg font-bold text-gray-800 mb-1">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </Text>
            <Text className="text-base text-gray-600">Today's Conversations</Text>
          </View>

          <View className="bg-white rounded-xl p-4 shadow-sm">
            {conversationsDB.map((convo, index) => (
              <TouchableOpacity
                key={convo.id}
                // onPress={() => handleConversationPress(convo)}
                onPress={() => {}}
                className={`flex flex-row items-center py-3 ${index !== conversations.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
              >
                {/* <Image
                  source={{ uri: convo.imageUrl }}
                  alt={convo.person}
                  className="w-12 h-12 rounded-full mr-3"
                /> */}
                <View className="flex-1">
                  <Text className="text-sm text-gray-800">
                    {convo.summary}
                  </Text>
                </View>
              
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      );
    }
    return null;
  };

  return (
    <View className="flex flex-col h-full bg-white">
      <View className="flex flex-row justify-between items-center px-4 py-2">
        <TouchableOpacity
          onPress={handlePreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          {/* <ChevronLeft className="w-6 h-6" /> */}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleMonthPress}
          className="text-xl font-bold"
        >
          <Text>{currentMonth}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          {/* <ChevronRight className="w-6 h-6" /> */}
        </TouchableOpacity>
      </View>

      <View className="px-4">
        <View className="flex-row mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((weekday) => (
            <View key={weekday} className="flex-1 items-center">
              <Text className="text-sm font-semibold text-gray-500">{weekday}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row grid grid-cols-7 gap-2 m-auto">
          {calendarDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              className={`${getDayClasses(day)} w-1/7 aspect-square items-center justify-center`}
              onPress={() => handleDayPress(day)}
              disabled={isAfter(day, new Date())}
            >
              <Text className={`${getDayTextClasses(day)} text-center`}>
                {format(day, 'd')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {renderConversationSummary()}
    </View>
  );
};

export default CalendarScreen;
