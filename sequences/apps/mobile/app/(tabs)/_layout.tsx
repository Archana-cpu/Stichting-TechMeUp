import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { 
          backgroundColor: 'hsl(224, 71%, 4%)',
        },
        headerTintColor: 'hsl(213, 31%, 91%)',
        headerShadowVisible: false,
        tabBarActiveTintColor: 'hsl(217, 91%, 60%)',
        tabBarInactiveTintColor: 'hsl(217, 10%, 64%)',
        tabBarStyle: {
          backgroundColor: 'hsl(224, 71%, 4%)',
          borderTopColor: 'hsl(215, 28%, 17%)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          position: 'absolute',
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="storyboard"
        options={{
          title: 'Storyboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lifetree"
        options={{
          title: 'Life Tree',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="git-network" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
