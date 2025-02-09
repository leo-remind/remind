import PeopleGrid from "@/components/ui/memories/PeopleOverview";
import { chat } from "@/utils/rag/rag";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { SQLiteAnyDatabase } from "expo-sqlite/build/NativeStatement";
import React, { Suspense, useEffect, useLayoutEffect, useState } from "react";
import { Image, StyleSheet, Platform, Pressable, Text, View, Button, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useNavigation } from 'expo-router';

var chatDone = false;

function App() {
  const { query } = useLocalSearchParams();
  const db = useSQLiteContext();

  const navigation = useNavigation();


  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Search your Memories`, // Customize title based on `mid`
    });
  }, [navigation, query]);

    return (
        <SafeAreaView className="flex-1 bg-white">
           <ScrollView>
            <View className="flex-row justify-between items-start px-8 pt-8">
                <ChatComponent query={query} />
                <ChatResponse query={query} db={db}/>
            </View>
           </ScrollView>
        </SafeAreaView>
    )
}

function ChatComponent({ query }: {query: any}) {

  const router = useRouter();

  const submitEnded = () => {
      console.log("Submitted");
      // Redirect to the chat page with the query
      chatDone = true;
      router.replace(`/chat/${value}`);
  }
  const [value,setValue] = useState(query);

    return <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          zIndex: 1,
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: "#fff",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
            borderRadius: 25,
            paddingHorizontal: 16,
            height: 46,
          }}
        >
          <TextInput
            onSubmitEditing={submitEnded}
            onChangeText ={ newValue => setValue(newValue)}
            placeholder={value}
            style={{
              flex: 1,
              fontSize: 16,
              color: "#333",
            }}
          />
          <MaterialIcons name="send" size={24} color="#666" />
        </View>
      </View>
}


const SkeletonLoader = () => {
  return (
    <View role="status" className="max-w-sm animate-pulse">
      <View className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></View>
      <View className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></View>
      <View className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></View>
      <View className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></View>
      <View className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></View>
      <View className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></View>
    </View>
  );
};

export default function ChatResponse({ db, query }) {
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    let isMounted = true;
    
    async function fetchChat() {
      const response = await chat(db, query);
      if (isMounted) {
        setAnswer(response.answer);
      }
    }

    fetchChat();

    return () => {
      isMounted = false; // Cleanup function to prevent memory leaks
    };
  }, [db, query]); // Runs only when `db` or `query` changes

  return (
    <View className="flex flex-col mt-12">
      <Text className="text-blue text-lg text-blue font-black mt-4">ANSWER</Text>
      <Text className="text-xl font-bold pb-4">{answer}</Text>
      
      <Text className="text-lg mt-4 font-black text-blue">PHOTOS</Text>
      <View className="flex-row flex flex-wrap">
      <Text className="text-xl font-bold pb-4">No photos available for Query!</Text>
        {/* <Image source={{ uri: "https://enterthegungeon.wiki.gg/images/thumb/9/96/SS_2.png/400px-SS_2.png" }} className="w-[33%] h-96 aspect-square" />
        <Image source={{ uri: "https://enterthegungeon.wiki.gg/images/thumb/9/96/SS_2.png/400px-SS_2.png" }} className="w-[33%] aspect-square" />
        <Image source={{ uri: "https://enterthegungeon.wiki.gg/images/thumb/9/96/SS_2.png/400px-SS_2.png" }} className="w-[33%] aspect-square" />
        <Image source={{ uri: "https://enterthegungeon.wiki.gg/images/thumb/9/96/SS_2.png/400px-SS_2.png" }} className="w-[33%] h-96 aspect-square" />
        <Image source={{ uri: "https://enterthegungeon.wiki.gg/images/thumb/9/96/SS_2.png/400px-SS_2.png" }} className="w-[33%] aspect-square" />
        <Image source={{ uri: "https://enterthegungeon.wiki.gg/images/thumb/9/96/SS_2.png/400px-SS_2.png" }} className="w-[33%] aspect-square" /> */}
      </View>

      {/* <PeopleGrid
        profiles={[
      { "imageUrl": "https://res.cloudinary.com/devolver-digital/image/upload/v1637791227/mothership/enter-the-gungeon/mothership-etg-poster.png", text: "Arnav Rustagi" },
      { "imageUrl": "https://res.cloudinary.com/devolver-digital/image/upload/v1637791227/mothership/enter-the-gungeon/mothership-etg-poster.png", text: "Arnav Rustagi" },
      { "imageUrl": "https://res.cloudinary.com/devolver-digital/image/upload/v1637791227/mothership/enter-the-gungeon/mothership-etg-poster.png", text: "Arnav Rustagi" },

        ]}
      /> */}

    </View>
  );
}

export default App;