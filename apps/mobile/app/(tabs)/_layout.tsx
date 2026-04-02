import { Tabs } from 'expo-router';
import { View, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const TAB_ICONS: Record<string, { active: MCIName; inactive: MCIName }> = {
  home:    { active: 'home',             inactive: 'home-outline' },
  records: { active: 'archive',          inactive: 'archive-outline' },
  report:  { active: 'bookmark',         inactive: 'bookmark-outline' },
  mypage:  { active: 'cog',             inactive: 'cog-outline' },
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const c = useTheme();
  const icons = TAB_ICONS[name];
  const iconName = focused ? icons.active : icons.inactive;

  return (
    <View style={{
      alignItems: 'center', justifyContent: 'center',
      width: 44, height: 44, borderRadius: 12,
      backgroundColor: focused ? '#cce8e4' : 'transparent',
    }}>
      <MaterialCommunityIcons
        name={iconName}
        size={22}
        color={focused ? '#2e6863' : c.textSecondary}
      />
    </View>
  );
}

export default function TabsLayout() {
  const c = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2e6863',
        tabBarInactiveTintColor: c.textSecondary,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.92)',
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: '#2c333a',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.06,
          shadowRadius: 24,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: Platform.OS === 'ios' ? 80 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
        headerStyle: { backgroundColor: c.bg },
        headerTintColor: c.textPrimary,
        headerTitleStyle: { fontFamily: 'Manrope_700Bold', fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => <TabIcon name="records" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => <TabIcon name="report" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="mypage" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
