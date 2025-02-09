import { GameCard } from "@/components/GameCard";
import PeopleGrid from "@/components/ui/memories/PeopleOverview";
import { chat } from "@/utils/rag/rag";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { SQLiteAnyDatabase } from "expo-sqlite/build/NativeStatement";
import React, { Suspense, useEffect, useState } from "react";
import { Image, StyleSheet, Platform, Pressable, Text, View, Button, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

var chatDone = false;

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

function App() {
    const { tid } = useLocalSearchParams();
    const db = useSQLiteContext();
    let trip = db.getFirstSync(`SELECT * FROM trips WHERE id = ${tid}`)

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="p-8 flex flex-col">
                <View className="flex flex-col">
                    <View className="w-full h-96">
                        <Image source={{uri: trip.url }} className="w-full h-full object-fit"/>
                        <View className="absolute bottom-4 left-4">
                            <Text className="text-2xl font-bold">
                                {trip.trip_name}
                            </Text>
                            <Text className="text-lg font-semibold">
                                formatDateRange(new Date(trip.start_date), new Date(trip.end_date))
                            </Text>
                        </View>
                    </View>
                            <Text className="text-xl font-bold">Summary</Text>
                            <Text className="text-lg">
                                {trip.trip_summary}
                            </Text>
                    <View className="flex-row flex flex-wrap">
        <Image source={{ uri: "https://enterthegungeon.wiki.gg/images/thumb/9/96/SS_2.png/400px-SS_2.png" }} className="w-[33%] h-96 aspect-square" />
        <Image source={{ uri: "https://enterthegungeon.wiki.gg/images/thumb/9/96/SS_2.png/400px-SS_2.png" }} className="w-[33%] aspect-square" />
        <Image source={{ uri: "https://enterthegungeon.wiki.gg/images/thumb/9/96/SS_2.png/400px-SS_2.png" }} className="w-[33%] aspect-square" />
        <Image source={{ uri: "https://enterthegungeon.wiki.gg/images/thumb/9/96/SS_2.png/400px-SS_2.png" }} className="w-[33%] h-96 aspect-square" />
        <Image source={{ uri: "https://enterthegungeon.wiki.gg/images/thumb/9/96/SS_2.png/400px-SS_2.png" }} className="w-[33%] aspect-square" />
        <Image source={{ uri: "https://enterthegungeon.wiki.gg/images/thumb/9/96/SS_2.png/400px-SS_2.png" }} className="w-[33%] aspect-square" />
      </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
