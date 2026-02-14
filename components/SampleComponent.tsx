import React from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleTheme, increment } from '../store/slices/uiSlice';
import { useGetPostsQuery } from '../store/api/sampleApi';

export default function SampleComponent() {
  const dispatch = useAppDispatch();
  const { theme, counter } = useAppSelector((state) => state.ui);
  const { data: posts, isLoading, error } = useGetPostsQuery();

  // Reanimated Shared Value
  const scale = useSharedValue(1);

  // Gesture Handler
  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(1.2);
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
    })
    .onEnd(() => {
      // Trigger Redux action on tap
      // We need to run this on JS thread, but runOnJS is automatic for some helpers.
      // However, for simplicity in this specific setup, we'll just use the Pressable for the counter
      // and use the Gesture for the animation effect.
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const containerClass = theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50';
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const cardClass = theme === 'dark' ? 'bg-slate-800' : 'bg-white';

  return (
    <View className={`flex-1 p-4 ${containerClass}`}>
      <Text className={`mb-4 text-2xl font-bold ${textClass}`}>Tech Stack Verification</Text>

      {/* Redux State & Actions */}
      <View className={`mb-4 rounded-xl p-4 shadow-sm ${cardClass}`}>
        <Text className={`mb-2 text-lg font-semibold ${textClass}`}>Redux State</Text>
        <Text className={`mb-2 ${textClass}`}>Theme: {theme}</Text>
        <Text className={`mb-2 ${textClass}`}>Counter: {counter}</Text>

        <View className="mt-2 flex-row gap-2">
          <Pressable
            onPress={() => dispatch(toggleTheme())}
            className="rounded-lg bg-blue-500 px-4 py-2 active:bg-blue-600">
            <Text className="font-medium text-white">Toggle Theme</Text>
          </Pressable>
          <Pressable
            onPress={() => dispatch(increment())}
            className="rounded-lg bg-green-500 px-4 py-2 active:bg-green-600">
            <Text className="font-medium text-white">Increment</Text>
          </Pressable>
        </View>
      </View>

      {/* Expo Router Navigation */}
      <View className={`mb-4 rounded-xl p-4 shadow-sm ${cardClass}`}>
        <Text className={`mb-2 text-lg font-semibold ${textClass}`}>Navigation</Text>
        <Link href="/details/123" asChild>
          <Pressable className="items-center rounded-lg bg-orange-500 px-4 py-3 active:bg-orange-600">
            <Text className="font-bold text-white">Go to Details (ID: 123)</Text>
          </Pressable>
        </Link>
      </View>

      {/* Reanimated & Gesture Handler */}
      <View className={`mb-4 rounded-xl p-4 shadow-sm ${cardClass}`}>
        <Text className={`mb-2 text-lg font-semibold ${textClass}`}>Gestures & Animation</Text>
        <Text className={`mb-2 text-sm text-gray-500`}>
          Tap the box below to see Reanimated + Gesture Handler
        </Text>

        <GestureDetector gesture={tap}>
          <Animated.View
            className="h-20 w-full items-center justify-center rounded-xl bg-purple-500"
            style={animatedStyle}>
            <Text className="font-bold text-white">Tap Me!</Text>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* RTK Query */}
      <View className={`flex-1 rounded-xl p-4 shadow-sm ${cardClass}`}>
        <Text className={`mb-2 text-lg font-semibold ${textClass}`}>RTK Query API</Text>
        {isLoading && <ActivityIndicator size="large" color="#3b82f6" />}
        {error && <Text className="text-red-500">Error fetching posts</Text>}
        {posts && (
          <View>
            {posts.map((post) => (
              <View key={post.id} className="mb-2 border-b border-gray-200 pb-2 last:border-0">
                <Text className={`font-medium ${textClass}`} numberOfLines={1}>
                  {post.title}
                </Text>
                <Text className="text-xs text-gray-500" numberOfLines={1}>
                  User ID: {post.userId}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
