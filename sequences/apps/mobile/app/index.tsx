import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-background px-6 pt-12">
      <View className="items-center">
        <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-primary/20">
          <Ionicons name="sparkles" size={32} color="hsl(217, 91%, 60%)" />
        </View>
        <Text className="text-3xl font-bold text-foreground">Sequences</Text>
        <Text className="mt-2 text-center text-muted-foreground">
          Track your emotional sequences
        </Text>
      </View>

      <View className="mt-12 gap-4">
        <Link href="/storyboard" asChild>
          <Pressable className="flex-row items-center justify-between rounded-xl bg-card p-4 active:bg-muted">
            <View className="flex-row items-center gap-3">
              <Ionicons name="grid" size={24} color="hsl(217, 91%, 60%)" />
              <Text className="text-lg font-medium text-foreground">Storyboard</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="hsl(217, 10%, 64%)" />
          </Pressable>
        </Link>

        <Link href="/create" asChild>
          <Pressable className="flex-row items-center justify-between rounded-xl bg-card p-4 active:bg-muted">
            <View className="flex-row items-center gap-3">
              <Ionicons name="add-circle" size={24} color="hsl(217, 91%, 60%)" />
              <Text className="text-lg font-medium text-foreground">New Sequence</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="hsl(217, 10%, 64%)" />
          </Pressable>
        </Link>

        <Link href="/lifetree" asChild>
          <Pressable className="flex-row items-center justify-between rounded-xl bg-card p-4 active:bg-muted">
            <View className="flex-row items-center gap-3">
              <Ionicons name="git-network" size={24} color="hsl(217, 91%, 60%)" />
              <Text className="text-lg font-medium text-foreground">Life Tree</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="hsl(217, 10%, 64%)" />
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
