import { Tabs } from 'expo-router';
import { Sun, PenLine, BookMarked, Award, Settings } from 'lucide-react-native';
import { ChildColors, ComponentSize } from '../../src/design/tokens';

export default function ChildLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ChildColors.primary,
        tabBarInactiveTintColor: ChildColors.textTertiary,
        tabBarStyle: {
          backgroundColor: ChildColors.surface1,
          borderTopWidth: 1,
          borderTopColor: ChildColors.divider,
          height: ComponentSize.tabBarHeight + 16,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'Pretendard-Medium',
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: '오늘',
          tabBarIcon: ({ color }) => <Sun size={22} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="write/book-input"
        options={{
          title: '쓰기',
          tabBarIcon: ({ color }) => <PenLine size={22} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="bookshelf/index"
        options={{
          title: '책장',
          tabBarIcon: ({ color }) => <BookMarked size={22} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="stamps"
        options={{
          title: '도장',
          tabBarIcon: ({ color }) => <Award size={22} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color }) => <Settings size={22} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen name="write/card" options={{ href: null }} />
      <Tabs.Screen name="write/complete" options={{ href: null }} />
      <Tabs.Screen name="bookshelf/[bookTitle]" options={{ href: null }} />
    </Tabs>
  );
}
