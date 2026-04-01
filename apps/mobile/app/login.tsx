import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';

type Tab = 'login' | 'register';

const ACCENT = '#55D2C6';
const BG = '#202631';
const CARD = '#2B3340';
const BORDER = '#343C47';

export default function LoginScreen() {
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
    if (!email.trim() || !password) {
      setLocalError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    try {
      await login(email.trim(), password);
      router.replace('/');
    } catch {
      // error는 store에 저장됨
    }
  };

  const handleRegister = async () => {
    setLocalError('');
    if (!email.trim() || !password) {
      setLocalError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    if (password.length < 8) {
      setLocalError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      setLocalError('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      await register(email.trim(), password, displayName.trim() || undefined);
      router.replace('/');
    } catch {
      // error는 store에 저장됨
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* 로고 */}
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          <Text style={{ fontSize: 26, fontWeight: '700', color: '#EAF0FA', marginBottom: 6 }}>
            변명아카이브
          </Text>
          <Text style={{ fontSize: 13, color: '#6B7280' }}>비난 대신 관찰, 후회를 성장으로</Text>
        </View>

        {/* 탭 */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: CARD,
            borderRadius: 12,
            padding: 4,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: BORDER,
          }}
        >
          {(['login', 'register'] as Tab[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => { setTab(t); setLocalError(''); }}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 9,
                alignItems: 'center',
                backgroundColor: tab === t ? ACCENT + '20' : 'transparent',
                borderWidth: tab === t ? 1 : 0,
                borderColor: ACCENT + '60',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: tab === t ? ACCENT : '#9CA3AF' }}>
                {t === 'login' ? '로그인' : '회원가입'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 폼 카드 */}
        <View
          style={{
            backgroundColor: CARD,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: BORDER,
            gap: 14,
          }}
        >
          <Field label="이메일" value={email} onChangeText={setEmail} placeholder="hello@example.com" keyboardType="email-address" />

          {tab === 'register' && (
            <Field label="닉네임 (선택)" value={displayName} onChangeText={setDisplayName} placeholder="표시될 이름" />
          )}

          <Field label="비밀번호" value={password} onChangeText={setPassword} placeholder={tab === 'register' ? '8자 이상' : '비밀번호 입력'} secure />

          {tab === 'register' && (
            <Field label="비밀번호 확인" value={passwordConfirm} onChangeText={setPasswordConfirm} placeholder="비밀번호 재입력" secure />
          )}

          {shownError ? (
            <View style={{ backgroundColor: '#EF444420', borderWidth: 1, borderColor: '#EF444440', borderRadius: 10, padding: 10 }}>
              <Text style={{ color: '#F87171', fontSize: 12 }}>{shownError}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={tab === 'login' ? handleLogin : handleRegister}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#374151' : ACCENT,
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: 'center',
              marginTop: 4,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#202631" size="small" />
            ) : (
              <Text style={{ color: '#202631', fontWeight: '700', fontSize: 15 }}>
                {tab === 'login' ? '로그인' : '회원가입'}
              </Text>
            )}
          </Pressable>
        </View>

        <Text style={{ textAlign: 'center', fontSize: 11, color: '#4B5563', marginTop: 24 }}>
          실수와 후회를 솔직하게 기록하는 공간입니다
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secure,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secure?: boolean;
  keyboardType?: 'email-address' | 'default';
}) {
  return (
    <View>
      <Text style={{ fontSize: 12, fontWeight: '500', color: '#9CA3AF', marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#4B5563"
        secureTextEntry={secure}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize="none"
        style={{
          backgroundColor: '#202631',
          borderWidth: 1,
          borderColor: '#343C47',
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 14,
          color: '#EAF0FA',
        }}
      />
    </View>
  );
}
