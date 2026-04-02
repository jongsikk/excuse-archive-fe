import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';

type Tab = 'login' | 'register';

function Field({
  label, value, onChangeText, placeholder, secure, keyboardType,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; secure?: boolean; keyboardType?: 'email-address' | 'default';
}) {
  const c = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11, color: c.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={c.textMuted}
        secureTextEntry={secure}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize="none"
        style={{
          backgroundColor: focused ? c.card : c.section,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontFamily: 'Manrope_400Regular',
          fontSize: 15,
          color: c.textPrimary,
          borderWidth: focused ? 1.5 : 0,
          borderColor: c.accent + '40',
        }}
      />
    </View>
  );
}

export default function LoginScreen() {
  const c = useTheme();
  const { login, register, isLoading, error } = useAuthStore();

  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [localError, setLocalError] = useState('');

  const shownError = localError || error;

  const handleLogin = async () => {
    setLocalError('');
    if (!email.trim() || !password) { setLocalError('이메일과 비밀번호를 입력해주세요.'); return; }
    try { await login(email.trim(), password); router.replace('/'); } catch {}
  };

  const handleRegister = async () => {
    setLocalError('');
    if (!email.trim() || !password) { setLocalError('이메일과 비밀번호를 입력해주세요.'); return; }
    if (password.length < 8) { setLocalError('비밀번호는 8자 이상이어야 합니다.'); return; }
    if (password !== passwordConfirm) { setLocalError('비밀번호가 일치하지 않습니다.'); return; }
    try { await register(email.trim(), password, displayName.trim() || undefined); router.replace('/'); } catch {}
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28 }} keyboardShouldPersistTaps="handled">

        {/* 로고 */}
        <View style={{ alignItems: 'center', marginBottom: 44 }}>
          <Text style={{ fontFamily: 'Manrope_800ExtraBold', fontSize: 28, color: c.textPrimary, letterSpacing: -0.5, marginBottom: 6 }}>
            변명아카이브
          </Text>
          <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: c.textMuted }}>
            비난 대신 관찰, 후회를 성장으로
          </Text>
        </View>

        {/* 탭 전환 */}
        <View style={{ flexDirection: 'row', backgroundColor: c.section, borderRadius: 14, padding: 4, marginBottom: 24 }}>
          {(['login', 'register'] as Tab[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => { setTab(t); setLocalError(''); }}
              style={{
                flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center',
                backgroundColor: tab === t ? c.card : 'transparent',
              }}
            >
              <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: tab === t ? c.textPrimary : c.textMuted }}>
                {t === 'login' ? '로그인' : '회원가입'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 폼 */}
        <View style={{ gap: 16, marginBottom: 8 }}>
          <Field label="이메일" value={email} onChangeText={setEmail} placeholder="hello@example.com" keyboardType="email-address" />
          {tab === 'register' && (
            <Field label="닉네임 (선택)" value={displayName} onChangeText={setDisplayName} placeholder="표시될 이름" />
          )}
          <Field label="비밀번호" value={password} onChangeText={setPassword} placeholder={tab === 'register' ? '8자 이상' : '비밀번호 입력'} secure />
          {tab === 'register' && (
            <Field label="비밀번호 확인" value={passwordConfirm} onChangeText={setPasswordConfirm} placeholder="비밀번호 재입력" secure />
          )}
        </View>

        {/* 에러 */}
        {shownError ? (
          <View style={{ backgroundColor: '#f8717115', borderRadius: 12, padding: 12, marginTop: 8 }}>
            <Text style={{ fontFamily: 'Manrope_400Regular', color: '#f87171', fontSize: 13 }}>{shownError}</Text>
          </View>
        ) : null}

        {/* CTA */}
        <Pressable
          onPress={tab === 'login' ? handleLogin : handleRegister}
          disabled={isLoading}
          style={{ marginTop: 24 }}
        >
          <LinearGradient
            colors={isLoading ? [c.textMuted, c.textMuted] : [c.gradientStart, c.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 9999, paddingVertical: 16, alignItems: 'center' }}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={{ fontFamily: 'Manrope_700Bold', color: '#ffffff', fontSize: 16 }}>
                {tab === 'login' ? '로그인' : '회원가입'}
              </Text>
            )}
          </LinearGradient>
        </Pressable>

        <Text style={{ fontFamily: 'Manrope_400Regular', textAlign: 'center', fontSize: 12, color: c.textMuted, marginTop: 28 }}>
          실수와 후회를 솔직하게 기록하는 공간입니다
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
