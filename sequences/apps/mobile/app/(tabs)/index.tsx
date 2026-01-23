import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Sidebar } from '../../src/components/sidebar';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background flex-row">
      <Sidebar />
      <View className="flex-1 px-4 justify-center py-8">
        <Animated.View entering={FadeInDown.delay(100)} className="items-center mb-14">
          <View className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-primary/20">
            <Ionicons name="sparkles" size={48} color="hsl(217, 91%, 60%)" />
          </View>
          <Text className="text-5xl font-bold text-foreground">Sequences</Text>
          <Text className="mt-4 text-center text-muted-foreground text-lg">
            Track your emotional sequences
          </Text>
        </Animated.View>

        <View className="gap-5">
          <Animated.View entering={FadeInDown.delay(200)}>
            <Pressable
              onPress={() => router.push('/storyboard')}
              className="flex-row items-center justify-between rounded-xl bg-card p-6 active:bg-muted border border-border"
            >
              <View className="flex-row items-center gap-4">
                <Ionicons name="grid" size={28} color="hsl(217, 91%, 60%)" />
                <Text className="text-xl font-semibold text-foreground">Storyboard</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="hsl(217, 10%, 64%)" />
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
            <Pressable
              onPress={() => router.push('/create')}
              className="flex-row items-center justify-between rounded-xl bg-card p-6 active:bg-muted border border-border"
            >
              <View className="flex-row items-center gap-4">
                <Ionicons name="add-circle" size={28} color="hsl(217, 91%, 60%)" />
                <Text className="text-xl font-semibold text-foreground">New Sequence</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="hsl(217, 10%, 64%)" />
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)}>
            <Pressable
              onPress={() => router.push('/lifetree')}
              className="flex-row items-center justify-between rounded-xl bg-card p-6 active:bg-muted border border-border"
            >
              <View className="flex-row items-center gap-4">
                <Ionicons name="git-network" size={28} color="hsl(217, 91%, 60%)" />
                <Text className="text-xl font-semibold text-foreground">Life Tree</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="hsl(217, 10%, 64%)" />
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
