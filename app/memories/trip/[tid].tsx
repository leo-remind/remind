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
    const { query } = useLocalSearchParams();
    const db = useSQLiteContext();
    let trips = db.getAllSync(`SELECT start_date, end_date, trip_name, url FROM trips`)

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="p-8 flex flex-col">
                {
                    trips.map((trip) => <GameCard header={trip.trip_name} subtitle={formatDateRange(new Date(trip.start_date), new Date(trip.end_date))} imageUrl={trip.url} />)
                }
            </ScrollView>
        </SafeAreaView>
    )
}
