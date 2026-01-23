import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Sidebar } from '../../src/components/sidebar';

export default function StoryboardScreen() {
  const router = useRouter();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const { data: sequences, isLoading, error, refetch } = useQuery({
    queryKey: ['sequences'],
    queryFn: async () => {
      const url = `${apiUrl}/api/sequences`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const json = await res.json();
      return json;
    },
  });

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeIn.delay(index * 50)} exiting={FadeOut}>
      <Pressable
        onPress={() => router.push(`/sequence/${item.id}`)}
        className="rounded-xl bg-card p-5 active:bg-muted border border-border mb-4"
      >
        <View className="flex-row items-center gap-3 mb-3">
          <Text className="text-xl">{item.emotion?.icon}</Text>
          <Text className="text-base text-primary font-semibold">{item.emotion?.key}</Text>
          <Text className="text-base text-muted-foreground">
            {new Date(item.eventDate).toLocaleDateString()}
          </Text>
        </View>
        <Text className="text-xl font-semibold text-foreground mb-2">
          {item.title}
        </Text>
        <Text className="text-base text-muted-foreground" numberOfLines={2}>
          {item.summary}
        </Text>
      </Pressable>
    </Animated.View>
  );

  const renderEmpty = () => (
    <View className="items-center py-12 px-4">
      <Ionicons name="film-outline" size={48} color="hsl(217, 10%, 64%)" />
      <Text className="mt-4 text-lg text-muted-foreground">No sequences yet</Text>
      <Pressable
        onPress={() => router.push('/create')}
        className="mt-6 rounded-xl bg-primary px-6 py-3"
      >
        <Text className="font-semibold text-primary-foreground">Create First Sequence</Text>
      </Pressable>
    </View>
  );

  const renderError = () => (
    <View className="items-center py-12 px-4">
      <Ionicons name="alert-circle" size={48} color="hsl(0, 72%, 51%)" />
      <Text className="mt-4 text-lg text-muted-foreground">Error loading sequences</Text>
      <Text className="mt-2 text-sm text-muted-foreground text-center">
        {error?.message || 'Unknown error'}
      </Text>
      <Pressable
        onPress={() => refetch()}
        className="mt-6 rounded-xl bg-primary px-6 py-3"
      >
        <Text className="font-semibold text-primary-foreground">Retry</Text>
      </Pressable>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="flex-1 bg-background flex-row">
        {/* Fixed Sidebar */}
        <Sidebar />
        
        {/* Rulers */}
        <View className="absolute top-0 left-20 right-0 h-6 bg-card/80 border-b border-border z-10" />
        <View className="absolute top-0 left-20 bottom-0 w-6 bg-card/80 border-r border-border z-10" />
        
        <View className="flex-1">
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="hsl(217, 91%, 60%)" />
              <Text className="mt-4 text-muted-foreground text-base">Loading...</Text>
            </View>
          ) : error ? (
            renderError()
          ) : (
            <View className="flex-1 px-4 py-5">
              <FlatList
                data={sequences || []}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{
                  paddingBottom: 32,
                }}
                ListEmptyComponent={renderEmpty}
                refreshing={isLoading}
                onRefresh={refetch}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>
      </View>
    </>
  );
}
