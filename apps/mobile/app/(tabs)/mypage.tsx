import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';

function SettingRow({
  icon, label, subtitle, onPress,
}: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; subtitle?: string; onPress?: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name={icon} size={20} color={c.textSecondary} />
        </View>
        <View>
          <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: c.textPrimary }}>{label}</Text>
          {subtitle && (
            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 10, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={14} color={c.outlineVariant} />
    </Pressable>
  );
}

export default function MyPageScreen() {
  const c = useTheme();
  const { isDark, toggleTheme } = useTheme();
  const { token, clearAuth } = useAuthStore();

  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.getMe(),
    enabled: !!token,
  });

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Sign out from Archive?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => clearAuth() },
    ]);
  };

  const initials = profile?.displayName
    ? profile.displayName.slice(0, 2).toUpperCase()
    : profile?.email
    ? profile.email.slice(0, 2).toUpperCase()
    : '??';

  const joinDate = profile?.createdAt
    ? (() => {
        const d = new Date(profile.createdAt);
        return `${d.toLocaleString('en-US', { month: 'short' })} '${String(d.getFullYear()).slice(2)}`;
      })()
    : '—';

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View style={{
        height: 64, backgroundColor: c.bg,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 24,
      }}>
        <MaterialCommunityIcons name="menu" size={22} color={c.textPrimary} />
        <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 18, color: '#2e6863', letterSpacing: 0.9, textTransform: 'uppercase' }}>
          EXCUSE ARCHIVE
        </Text>
        <MaterialCommunityIcons name="magnify" size={22} color={c.textPrimary} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 48, gap: 64 }}>

          {/* Profile Section */}
          <View style={{ height: 279 }}>
            {/* Avatar */}
            <View style={{ position: 'absolute', top: 0, alignSelf: 'center', alignItems: 'center', left: 115 }}>
              <View style={{
                width: 112, height: 112, borderRadius: 12,
                backgroundColor: c.section,
                borderWidth: 3, borderColor: '#76afa9',
                padding: 7,
              }}>
                <View style={{
                  flex: 1, borderRadius: 8,
                  backgroundColor: c.container,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontFamily: 'Manrope_800ExtraBold', fontSize: 28, color: '#2e6863' }}>
                    {initials}
                  </Text>
                </View>
              </View>
              {/* Edit button */}
              <View style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: '#76afa9',
                borderWidth: 4, borderColor: c.bg,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <MaterialCommunityIcons name="pencil" size={12} color="#ffffff" />
              </View>
            </View>

            {/* Name */}
            <View style={{ position: 'absolute', top: 136, left: 0, right: 0, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Manrope_800ExtraBold', fontSize: 24, color: c.textPrimary, letterSpacing: -0.6 }}>
                {profile?.displayName || 'Your Name'}
              </Text>
            </View>

            {/* Email */}
            <View style={{ position: 'absolute', top: 172, left: 0, right: 0, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 14, color: c.textSecondary }}>
                {profile?.email || 'your@email.com'}
              </Text>
            </View>

            {/* Stats */}
            <View style={{ position: 'absolute', top: 232, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 48 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 24, color: c.textPrimary, textAlign: 'center' }}>
                  {profile?.recordCount ?? 0}
                </Text>
                <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 10, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Archived
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 24, color: c.textPrimary, textAlign: 'center' }}>
                  {joinDate}
                </Text>
                <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 10, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Joined
                </Text>
              </View>
            </View>
          </View>

          {/* Functional Sections */}
          <View style={{ gap: 48 }}>

            {/* Visual Preferences */}
            <View style={{ backgroundColor: c.section, borderRadius: 32, padding: 32, gap: 32 }}>
              <Text style={{
                fontFamily: 'Manrope_700Bold', fontSize: 10, color: c.textSecondary,
                textTransform: 'uppercase', letterSpacing: 2, paddingHorizontal: 8,
              }}>
                Visual Preferences
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons name="weather-sunny" size={22} color={c.textSecondary} />
                  </View>
                  <View>
                    <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 16, color: c.textPrimary }}>Appearance</Text>
                    <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: c.textSecondary }}>
                      {isDark ? 'Currently in Dark Mode' : 'Currently in Light Mode'}
                    </Text>
                  </View>
                </View>
                {/* Toggle */}
                <Pressable onPress={toggleTheme}>
                  <View style={{
                    width: 48, height: 24, borderRadius: 12,
                    backgroundColor: '#cce8e4',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                    alignItems: isDark ? 'flex-end' : 'flex-start',
                  }}>
                    <View style={{
                      width: 16, height: 16, borderRadius: 12,
                      backgroundColor: '#76afa9',
                      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
                    }} />
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Account Systems */}
            <View style={{ gap: 24 }}>
              <Text style={{
                fontFamily: 'Manrope_700Bold', fontSize: 10, color: c.textSecondary,
                textTransform: 'uppercase', letterSpacing: 2, paddingHorizontal: 16,
              }}>
                Account Systems
              </Text>
              <View style={{ gap: 8 }}>
                <SettingRow icon="bell-outline" label="Notifications" />
                <SettingRow icon="shield-outline" label="Security & Access" />
                <SettingRow icon="translate" label="Language" subtitle="English (US)" />
              </View>
            </View>

            {/* Danger Zone */}
            <View style={{ borderTopWidth: 1, borderTopColor: c.containerHigh, paddingTop: 25 }}>
              <Pressable
                onPress={handleLogout}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 16 }}
              >
                <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name="logout" size={18} color="#a83836" />
                </View>
                <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 16, color: '#a83836', letterSpacing: -0.4 }}>
                  Sign Out from Archive
                </Text>
              </Pressable>
            </View>

          </View>
        </View>
      </ScrollView>
    </View>
  );
}
