import { View, Text, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type SidebarItem = {
  name: string;
  path: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const sidebarItems: SidebarItem[] = [
  { name: 'Home', path: '/(tabs)/', icon: 'home' },
  { name: 'Storyboard', path: '/(tabs)/storyboard', icon: 'grid' },
  { name: 'Life Tree', path: '/(tabs)/lifetree', icon: 'git-network' },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="w-20 bg-card border-r border-border items-center py-6 gap-6">
      {sidebarItems.map((item) => {
        const isActive = 
          pathname === item.path || 
          (item.path === '/(tabs)/' && pathname === '/(tabs)') ||
          pathname?.includes(item.path.replace('/(tabs)/', ''));
        return (
          <Pressable
            key={item.path}
            onPress={() => router.push(item.path as any)}
            className={`w-16 h-16 items-center justify-center rounded-xl ${
              isActive ? 'bg-primary' : 'bg-transparent'
            }`}
          >
            <Ionicons
              name={item.icon}
              size={30}
              color={isActive ? 'hsl(0, 0%, 100%)' : 'hsl(217, 10%, 64%)'}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
