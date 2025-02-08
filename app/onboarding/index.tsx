import React from "react";
import { Image, StyleSheet, Platform, Pressable, Text, View, Button, ScrollView, SafeAreaView } from "react-native";

function onboardingSplash() {
    return (
      <SafeAreaView className="flex-1 bg-orange">
        <Text>HOWWHW</Text>
        <View className="flex flex-col">
            <Image source={require("../../assets/images/starry.png")} className="h-96 w-96"></Image>
            <Image source={{uri: "../../assets/images/ReMind.png"}} className="h-96"></Image>
        </View>
      </SafeAreaView>
    )
}

export default onboardingSplash;