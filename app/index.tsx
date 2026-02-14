/// <reference types="nativewind/types" />
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-[#0A0A0F]">
      <StatusBar style="light" />
      <Text className="text-2xl font-bold text-[#F1F5F9]">Video Editor</Text>
      <Text className="mt-2 text-sm text-[#94A3B8]">Premium short-video editor</Text>
    </View>
  );
}
