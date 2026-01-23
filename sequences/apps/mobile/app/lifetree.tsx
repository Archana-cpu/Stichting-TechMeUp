import { View, Text, ScrollView, Pressable, Image, Dimensions } from 'react-native';
import { Stack, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type PersonPosition = {
  id: string;
  x: number;
  y: number;
};

export default function LifeTreeScreen() {
  const { data: people, isLoading } = useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/people`);
      return res.json();
    },
  });

  const [positions, setPositions] = useState<Record<string, PersonPosition>>({});
  const [scale, setScale] = useState(1);

  // Initialize positions
  useEffect(() => {
    if (people && people.length > 0) {
      const initialPositions: Record<string, PersonPosition> = {};
      people.forEach((person: any, index: number) => {
        if (person.positionX !== null && person.positionY !== null) {
          initialPositions[person.id] = {
            id: person.id,
            x: person.positionX,
            y: person.positionY,
          };
        } else {
          // Scatter layout
          const cols = Math.ceil(Math.sqrt(people.length));
          const row = Math.floor(index / cols);
          const col = index % cols;
          initialPositions[person.id] = {
            id: person.id,
            x: col * 220 + 50,
            y: row * 280 + 50,
          };
        }
      });
      setPositions(initialPositions);
    }
  }, [people]);

  const savePosition = async (personId: string, x: number, y: number) => {
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/people/${personId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionX: x, positionY: y }),
      });
    } catch (error) {
      console.error('Failed to save position:', error);
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Life Tree' }} />
        <View className="flex-1 items-center justify-center bg-background">
          <Text className="text-muted-foreground">Loading...</Text>
        </View>
      </>
    );
  }

  if (!people || people.length === 0) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Life Tree',
          }}
        />
        <View className="flex-1 items-center justify-center bg-background px-4">
          <Ionicons name="git-network-outline" size={64} color="hsl(217, 10%, 64%)" />
          <Text className="mt-4 text-lg font-semibold text-foreground">No people yet</Text>
          <Text className="mt-2 text-center text-muted-foreground">
            People will appear here when added
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Life Tree',
        }}
      />
      <GestureHandlerRootView className="flex-1 bg-background">
        <View className="flex-1">
          {/* Infinite Canvas */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              minWidth: SCREEN_WIDTH * 3,
              minHeight: SCREEN_HEIGHT * 3,
              padding: 50,
            }}
            scrollEnabled
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <View style={{ transform: [{ scale }] }}>
              {people?.map((person: any, index: number) => {
                const pos = positions[person.id];
                if (!pos) return null;

                return (
                  <PersonPolaroid
                    key={person.id}
                    person={person}
                    position={pos}
                    onPositionChange={(x, y) => {
                      setPositions((prev) => ({
                        ...prev,
                        [person.id]: { ...prev[person.id], x, y },
                      }));
                      savePosition(person.id, x, y);
                    }}
                    rotation={index % 3 === 0 ? -2 : index % 3 === 1 ? 2 : 0}
                  />
                );
              })}
            </View>
          </ScrollView>

          {/* Controls */}
          <View className="absolute bottom-4 right-4 flex gap-2">
            <Pressable
              onPress={() => setScale((s) => Math.min(s + 0.1, 2))}
              className="h-12 w-12 items-center justify-center rounded-full bg-card border border-border shadow-lg"
            >
              <Ionicons name="add" size={24} color="hsl(217, 91%, 60%)" />
            </Pressable>
            <Pressable
              onPress={() => setScale((s) => Math.max(s - 0.1, 0.5))}
              className="h-12 w-12 items-center justify-center rounded-full bg-card border border-border shadow-lg"
            >
              <Ionicons name="remove" size={24} color="hsl(217, 91%, 60%)" />
            </Pressable>
          </View>
        </View>
      </GestureHandlerRootView>
    </>
  );
}

function PersonPolaroid({
  person,
  position,
  onPositionChange,
  rotation = 0,
}: {
  person: any;
  position: PersonPosition;
  onPositionChange: (x: number, y: number) => void;
  rotation?: number;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(position.x);
  const startY = useSharedValue(position.y);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  const handleGestureEvent = (event: any) => {
    'worklet';
    translateX.value = event.translationX;
    translateY.value = event.translationY;
  };

  const handleHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const newX = startX.value + translateX.value;
      const newY = startY.value + translateY.value;
      startX.value = newX;
      startY.value = newY;
      translateX.value = 0;
      translateY.value = 0;
      onPositionChange(newX, newY);
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={handleGestureEvent}
      onHandlerStateChange={handleHandlerStateChange}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: position.x,
            top: position.y,
            width: 180,
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 8,
            paddingBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          },
          animatedStyle,
        ]}
      >
        {/* Photo Area */}
        <View className="w-full h-40 bg-gray-200 mb-2 rounded overflow-hidden">
          {person.image ? (
            <Image
              source={{ uri: person.image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gray-200">
              <Ionicons name="person" size={48} color="hsl(217, 10%, 64%)" />
            </View>
          )}
        </View>

        {/* Label */}
        <View className="px-2">
          <Text className="text-sm font-bold text-gray-800 text-center" numberOfLines={1}>
            {person.name}
          </Text>
          {person._count?.sequences > 0 && (
            <Text className="text-xs text-gray-600 text-center mt-1">
              {person._count.sequences} sequences
            </Text>
          )}
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}
