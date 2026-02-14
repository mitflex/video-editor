import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';

export default function Details() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: `Details ${id}` }} />
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="mb-4 text-2xl font-bold text-slate-900">Details Page</Text>
        <Text className="mb-8 text-lg text-slate-700">Received ID: {id}</Text>

        <Pressable
          className="rounded-xl bg-blue-500 px-6 py-3 active:bg-blue-600"
          onPress={() => router.back()}>
          <Text className="text-lg font-semibold text-white">Go Back</Text>
        </Pressable>
      </View>
    </>
  );
}
