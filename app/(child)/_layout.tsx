// 아이 탭바 (4탭) — write/card, write/complete는 탭바 숨김
import { Tabs } from 'expo-router';
import { ChildColors, ComponentSize } from '../../src/design/tokens';
import { usePraiseStore } from '../../src/stores/praise.store';

export default function ChildLayout() {
  const { unseenCount } = usePraiseStore();
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
          height: ComponentSize.tabBarHeight,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen name="today" options={{ title: '오늘' }} />
      <Tabs.Screen name="write/book-input" options={{ title: '쓰기' }} />
      <Tabs.Screen name="bookshelf/index" options={{ title: '책장' }} />
      <Tabs.Screen
        name="stamps"
        options={{
          title: '도장',
          tabBarBadge: unseenCount > 0 ? unseenCount : undefined,
        }}
      />
      {/* 탭바 숨김 화면 */}
      <Tabs.Screen
        name="write/card"
        options={{ href: null, tabBarStyle: { display: 'none' } }}
      />
      <Tabs.Screen
        name="write/complete"
        options={{ href: null, tabBarStyle: { display: 'none' } }}
      />
    </Tabs>
  );
}
