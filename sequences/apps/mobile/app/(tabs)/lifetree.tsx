import { View, Text, Pressable, Image, Dimensions, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Sidebar } from '../../src/components/sidebar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type PersonPosition = {
  id: string;
  x: number;
  y: number;
};

export default function LifeTreeScreen() {
  const router = useRouter();
  const { data: people, isLoading } = useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/people`);
      return res.json();
    },
  });

  const [positions, setPositions] = useState<Record<string, PersonPosition>>({});
  const [scale, setScale] = useState(1);

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
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 bg-background items-center justify-center">
          <Text className="text-muted-foreground">Loading...</Text>
        </View>
      </>
    );
  }

  if (!people || people.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 bg-background flex-row">
          <Sidebar />
          <View className="flex-1 items-center justify-center px-4">
            <Ionicons name="git-network-outline" size={64} color="hsl(217, 10%, 64%)" />
            <Text className="mt-4 text-lg font-semibold text-foreground">No people yet</Text>
            <Text className="mt-2 text-center text-muted-foreground">
              People will appear here when added
            </Text>
          </View>
        </View>
      </>
    );
  }

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
        
        <GestureHandlerRootView className="flex-1">
          <ScrollView 
            className="flex-1"
            contentContainerStyle={{
              width: (SCREEN_WIDTH - 80) * 3,
              height: SCREEN_HEIGHT * 3,
            }}
            scrollEnabled
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <View
              style={{
                transform: [{ scale }],
                width: (SCREEN_WIDTH - 80) * 3,
                height: SCREEN_HEIGHT * 3,
              }}
            >
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
                    onResize={(width, height) => {
                      // Save size if needed
                    }}
                    rotation={index % 3 === 0 ? -2 : index % 3 === 1 ? 2 : 0}
                  />
                );
              })}
            </View>
          </ScrollView>

          <View className="absolute bottom-4 right-4 flex gap-2">
              <Pressable
                onPress={() => setScale((s) => Math.min(s + 0.1, 2))}
                className="h-14 w-14 items-center justify-center rounded-full bg-card border border-border shadow-lg"
              >
                <Ionicons name="add" size={28} color="hsl(217, 91%, 60%)" />
              </Pressable>
              <Pressable
                onPress={() => setScale((s) => Math.max(s - 0.1, 0.5))}
                className="h-14 w-14 items-center justify-center rounded-full bg-card border border-border shadow-lg"
              >
                <Ionicons name="remove" size={28} color="hsl(217, 91%, 60%)" />
              </Pressable>
            </View>
        </GestureHandlerRootView>
      </View>
    </>
  );
}

function PersonPolaroid({
  person,
  position,
  onPositionChange,
  onResize,
  rotation = 0,
}: {
  person: any;
  position: PersonPosition;
  onPositionChange: (x: number, y: number) => void;
  onResize?: (width: number, height: number) => void;
  rotation?: number;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(position.x);
  const startY = useSharedValue(position.y);
  const width = useSharedValue(200);
  const height = useSharedValue(260);
  const resizeTranslateX = useSharedValue(0);
  const resizeTranslateY = useSharedValue(0);
  const resizeStartX = useSharedValue(0);
  const resizeStartY = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: startX.value + translateX.value,
      top: startY.value + translateY.value,
      width: width.value + resizeTranslateX.value,
      height: height.value + resizeTranslateY.value,
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const handleMove = (event: any) => {
    'worklet';
    translateX.value = event.translationX;
    translateY.value = event.translationY;
  };

  const handleMoveEnd = () => {
    'worklet';
    const newX = startX.value + translateX.value;
    const newY = startY.value + translateY.value;
    startX.value = newX;
    startY.value = newY;
    translateX.value = 0;
    translateY.value = 0;
    onPositionChange(newX, newY);
  };

  const handleResize = (event: any, corner: 'tl' | 'tr' | 'bl' | 'br') => {
    'worklet';
    let deltaX = event.translationX;
    let deltaY = event.translationY;
    
    // Adjust based on corner
    if (corner === 'tl' || corner === 'bl') {
      deltaX = -deltaX; // Left corners move opposite
    }
    if (corner === 'tl' || corner === 'tr') {
      deltaY = -deltaY; // Top corners move opposite
    }
    
    const newWidth = Math.max(150, Math.min(400, width.value + deltaX));
    const newHeight = Math.max(200, Math.min(500, height.value + deltaY));
    resizeTranslateX.value = newWidth - width.value;
    resizeTranslateY.value = newHeight - height.value;
    
    // Adjust position for top/left corners
    if (corner === 'tl') {
      translateX.value = -deltaX;
      translateY.value = -deltaY;
    } else if (corner === 'bl') {
      translateX.value = -deltaX;
    } else if (corner === 'tr') {
      translateY.value = -deltaY;
    }
  };

  const handleResizeEnd = () => {
    'worklet';
    const newWidth = width.value + resizeTranslateX.value;
    const newHeight = height.value + resizeTranslateY.value;
    width.value = newWidth;
    height.value = newHeight;
    resizeTranslateX.value = 0;
    resizeTranslateY.value = 0;
    if (onResize) {
      onResize(newWidth, newHeight);
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={handleMove}
      onHandlerStateChange={(event) => {
        if (event.nativeEvent.state === State.END) {
          handleMoveEnd();
        }
      }}
    >
      <Animated.View
        style={[
          {
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 10,
            paddingBottom: 14,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          },
          containerStyle,
        ]}
      >
        <Animated.View 
          className="w-full bg-gray-200 mb-2 rounded overflow-hidden" 
          style={useAnimatedStyle(() => {
            const containerHeight = height.value + resizeTranslateY.value - 60; // Subtract padding and text
            return {
              height: Math.max(160, containerHeight),
              width: '100%',
            };
          })}
        >
          {person.image ? (
            <Image
              source={{ uri: person.image }}
              style={{ 
                width: '100%', 
                height: '100%',
                resizeMode: 'cover',
              }}
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gray-200">
              <Ionicons name="person" size={56} color="hsl(217, 10%, 64%)" />
            </View>
          )}
        </Animated.View>

        <View className="px-2">
          <Text className="text-base font-bold text-gray-800 text-center" numberOfLines={1}>
            {person.name}
          </Text>
          {person._count?.sequences > 0 && (
            <Text className="text-sm text-gray-600 text-center mt-1">
              {person._count.sequences} sequences
            </Text>
          )}
        </View>

        {/* Resize handles - 4 corners */}
        {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => {
          const positions = {
            tl: { top: -3.5, left: -3.5 },
            tr: { top: -3.5, right: -3.5 },
            bl: { bottom: -3.5, left: -3.5 },
            br: { bottom: -3.5, right: -3.5 },
          };
          
          return (
            <PanGestureHandler
              key={corner}
              onGestureEvent={(event) => handleResize(event, corner)}
              onHandlerStateChange={(event) => {
                if (event.nativeEvent.state === State.END) {
                  handleResizeEnd();
                }
              }}
            >
              <Animated.View
                className="absolute w-7 h-7 bg-primary rounded-full border-2 border-white"
                style={positions[corner]}
              />
            </PanGestureHandler>
          );
        })}
      </Animated.View>
    </PanGestureHandler>
  );
}
