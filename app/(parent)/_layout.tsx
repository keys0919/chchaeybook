// 부모 탭바 (5탭)
import { Tabs } from 'expo-router';
import { ParentColors, ComponentSize } from '../../src/design/tokens';

export default function ParentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ParentColors.primary,
        tabBarInactiveTintColor: ParentColors.textTertiary,
        tabBarStyle: {
          backgroundColor: ParentColors.surface1,
          borderTopWidth: 1,
          borderTopColor: ParentColors.divider,
          height: ComponentSize.tabBarHeight,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: '홈' }} />
      <Tabs.Screen name="records/index" options={{ title: '기록' }} />
      <Tabs.Screen name="coaching/index" options={{ title: '코칭' }} />
      <Tabs.Screen name="child-manage/index" options={{ title: '자녀관리' }} />
      <Tabs.Screen name="settings/index" options={{ title: '설정' }} />
    </Tabs>
  );
}
