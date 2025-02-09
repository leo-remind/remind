import DiaryCard from "@/components/ui/memories/DiaryCard";
import { useSQLiteContext } from "expo-sqlite";
import { StyleSheet, Image, Platform, View, Text, SafeAreaView, ScrollView } from "react-native";
import React, { useLayoutEffect } from "react"
import { addDummyData } from "@/lib/conversations";
import { populateDummyData } from "@/utils/DummyDataCreator";

export default function MemoriesScreen() {

  return <SafeAreaView className="flex-1 bg-white">
    <ScrollView>
      <View className="flex-row justify-between items-start px-8 pt-8 mt-2">
        <View>
          <Text className="text-4xl font-sans">Your</Text>
          <Text className="text-4xl font-sans text-orange font-bold">Memories</Text>
        </View>
        <Text className="text-8xl font-sans text-orange">*</Text>
      </View>
      <View className="flex flex-row justify-between px-8 mb-2">
        <Text className="text-xl font-bold font-sans">Calender</Text>
      </View>
      <DiaryCard message="" className="bg-light-orange" />
      <View className="flex flex-row justify-between px-8 mt-4 mb-2">
        <Text className="text-xl font-bold font-sans">Trips</Text>
        <Text className="text-orange font-sans text-xl">List All</Text>
      </View>
      <Trips />

      <View className="flex flex-row justify-between px-8 mt-4 mb-2">
        <Text className="text-xl font-bold font-sans">People</Text>
        <Text className="text-orange font-sans text-xl">List All</Text>
      </View>
      <People />
    </ScrollView>

  </SafeAreaView>
}

function Trips() {
  const db = useSQLiteContext();
  let trips = db.getAllSync(`SELECT start_date, end_date, trip_name FROM trips`)

  return <View className="bg-white overflow-y-auto">
    <TripCarousel items={trips.map((trip) => {
      return { "heading": trip.trip_name, "subheading": formatDateRange(trip.start_date, trip.end_date) }
    })} />
  </View>
}

function formatDateRange(start_date, end_date) {
  const getOrdinal = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const day1 = start_date.getDate();
  const day2 = end_date.getDate();
  const month = end_date.toLocaleString('default', { month: 'long' });

  return `${day1}${getOrdinal(day1)} - ${day2}${getOrdinal(day2)} ${month}`;
}

const imgToUri = (arr: null | Uint8Array): string => {
  if (!arr) {
    return `data:image/jpeg;base64,`
  }
  const b64d = Array.from(arr)
    .map(byte => String.fromCharCode(byte))
    .join('');

  const b64s = btoa(b64d);
  return `data:image/jpeg;base64,${b64s}`
}

function People() {
  const db = useSQLiteContext()
  const persons: { 'name': string, 'photo_data': Uint8Array }[] = db.getAllSync("SELECT * FROM persons;")

  const parsedPersons = persons.map(({ name, photo_data }) => {
    return { "imageUri": imgToUri(photo_data), "text": name }
  })

  return (
    <View className="m-auto">
      <PeopleGrid profiles={parsedPersons} />
    </View >
  )
}

interface People {
  imageUri?: string;
  text: string;
}

interface PeopleGridProps {
  profiles: People[];
  imageSize?: 'sm' | 'md' | 'lg';
}

const PeopleGrid: React.FC<PeopleGridProps> = ({
  profiles,
  imageSize = 'lg'
}) => {

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-40 h-40'
  };

  return (
    <View className="flex mt-4 flex-wrap gap-8 flex-row w-96 justify-center">
      {profiles.map((profile, index) => (
        <View key={index} className="flex flex-col items-center">
          <View
            className={`
              rounded-full 
              overflow-hidden 
              ${sizeClasses[imageSize]} 
            `}
          >
            <Image
              source={{ uri: profile.imageUri }}
              alt={profile.text}
              className="w-full h-full object-cover"
            />
          </View>
          <Text className="mt-2 text-center text-lg font-sans">{profile.text}</Text>
        </View>
      ))}
    </View>
  );
};

interface CarouselItem {
  src: string;
  heading: string;
  subheading: string;
}

interface TripCarouselProps {
  items: CarouselItem[];
}

const TripCarousel: React.FC<TripCarouselProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <ScrollView horizontal={true} className="w-full overflow-x-auto overflow-y-none pl-2">
      <View className="flex gap-4 p-4 flex-row">
        {items.map((item, index) => (
          <View
            key={index}
            className="relative flex-shrink-0 w-64 h-96 rounded-xl overflow-hidden"
          >
            <Image
              source={{ uri: item.src }}
              alt={item.heading}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
            <View className="absolute bottom-0 left-0 p-4">
              <Text className="text-3xl font-bold font-sans text-white">
                {item.heading}
              </Text>
              <Text className="text-lg  font-sans text-white">
                {item.subheading}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
