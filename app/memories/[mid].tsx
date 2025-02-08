import { StyleSheet, Image, Platform } from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";

import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect } from "react";

export default function MemoriesScreen() {
  const { mid } = useLocalSearchParams();

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Memory: ${mid}`, // Customize title based on `mid`
    });
  }, [navigation, mid]);
  
  return <ThemedText>Hi, This is Memories... {mid}</ThemedText>;
}
