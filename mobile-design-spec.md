# 변명아카이브 모바일 디자인 스펙

> React Native (Expo) / expo-router 기반
> 다크·라이트 두 가지 테마 지원

---

## 1. 색상 시스템

### 토큰 구조 (`useTheme`)

| 토큰 | 다크 | 라이트 | 용도 |
|---|---|---|---|
| `bg` | `#202631` | `#F4F6FB` | 전체 배경 |
| `card` | `#2B3340` | `#FFFFFF` | 카드·헤더·탭바 배경 |
| `elevated` | `#1A2030` | `#F0F4FA` | 인풋, 태그, 내부 배경 |
| `border` | `#343C47` | `#CBD5E1` | 테두리, 구분선 |
| `accent` | `#55D2C6` | `#55D2C6` | 포인트 컬러 (두 테마 동일) |
| `textPrimary` | `#EAF0FA` | `#1A2030` | 주요 텍스트 |
| `textSecondary` | `#9CA3AF` | `#64748B` | 보조 텍스트 |
| `textMuted` | `#6B7280` | `#94A3B8` | 흐린 텍스트, placeholder |
| `heatmapEmpty` | `#2B3340` | `#E2E8F0` | 히트맵 빈 셀 |

### 고정 시멘틱 색상 (테마 무관)

| 색상 | 코드 | 용도 |
|---|---|---|
| 스트릭/경고 | `#FB923C` | 연속 기록 배너, 미완료 뱃지, 강도 높음 |
| 미완료 배너 | `#3B82F6` / `#60A5FA` | 미완료 행동 배너 |
| 오류 | `#f87171` / `#EF4444` | 에러 메시지, 강도 5단계 |
| 강도 낮음 | `#4ade80` | 히트맵·강도 1~2 |
| 강도 보통 | `#facc15` | 히트맵·강도 3 |
| 강도 강함 | `#fb923c` | 히트맵·강도 4 |
| 감정 태그 | `#A855F7` | 감정 선택 칩 |

### 투명도 관례

```
accent + '15'  → 배경 매우 연하게 (마이페이지 테마 선택)
accent + '20'  → 버튼·뱃지 배경 (완료 뱃지, CTA 배경)
accent + '25'  → 완료 뱃지 기록 목록
accent + '40'  → 아바타 테두리
accent + '50'  → 버튼 테두리 기본
accent + '60'  → 버튼 테두리 강조, 히트맵 레전드
```

---

## 2. 타이포그래피

| 역할 | fontSize | fontWeight | 색상 |
|---|---|---|---|
| 앱 타이틀 | 26 | 700 | `textPrimary` |
| 화면 제목 (H1) | 22 | 700 | `textPrimary` |
| 섹션 제목 (H2) | 16–17 | 600–700 | `textPrimary` |
| 카드 제목 | 14 | 600 | `textPrimary` |
| 본문 기본 | 14 | 400–500 | `textPrimary` |
| 보조 설명 | 13 | 400 | `textSecondary` |
| 라벨·태그 | 11–12 | 400–500 | `textMuted` / `textSecondary` |
| 통계 숫자 (큰) | 22–24 | 700 | `textPrimary` / `accent` |
| 캡션 | 10–11 | 400 | `textMuted` |

---

## 3. 간격·모서리

| 항목 | 값 |
|---|---|
| 화면 좌우 패딩 | 16 |
| 화면 상단 패딩 | 24 |
| 화면 하단 패딩 | 32–40 |
| 카드 패딩 | 16–20 |
| 카드 margin-bottom | 10–16 |
| 카드 borderRadius | 14–20 |
| 버튼 borderRadius | 10–14 |
| 태그/칩 borderRadius | 6 (각형), 20 (알약) |
| 인풋 borderRadius | 12 |
| 탭 전환 컨테이너 radius | 12 |
| 탭 전환 내부 버튼 radius | 9 |
| 스텝 인디케이터 원 | 32×32, radius 16 |
| 아바타 | 60×60, radius 30 |

---

## 4. 네비게이션 구조

```
/                → (tabs)
├── /            → 홈 (index.tsx)         🏠
├── /records     → 기록 목록 (records.tsx) 📝
├── /report      → 패턴 리포트 (report.tsx) 📊
└── /mypage      → 마이페이지 (mypage.tsx)  👤

/records/new     → 기록 작성 (modal-style)
/records/:id     → 기록 상세
/login           → 로그인·회원가입
```

**탭바**
- 배경: `card`
- 상단 테두리: `border` 1px
- 활성 색: `accent`
- 비활성 색: `textMuted`
- 헤더 배경: `card`, 타이틀색: `textPrimary`

---

## 5. 컴포넌트 카탈로그

### 5-1. 카드 (공통 패턴)

```
backgroundColor: card
borderRadius: 14–20
padding: 16–20
borderWidth: 1
borderColor: border
marginBottom: 10–16
```

### 5-2. CTA 버튼 (주요 액션)

```
배경: accent + '20'
테두리: 1px, accent + '60'
텍스트: accent, fontWeight 600
paddingVertical: 16
borderRadius: 14
```

**저장/완료 버튼** (강조)
```
배경: accent (불투명)
텍스트: bg색 (다크에서 #202631), fontWeight 700
비활성: border
```

### 5-3. 탭 전환 (세그먼트 컨트롤)

```
컨테이너: card 배경, radius 12, padding 4, border 1px
활성 탭: accent+'20' 배경, 1px accent+'60' 테두리, accent 텍스트
비활성 탭: transparent, textMuted 텍스트
paddingVertical: 9–10, borderRadius: 9
```

### 5-4. 태그 / 칩

**각형 (실수유형, 감정)**
```
paddingHorizontal: 8, paddingVertical: 2–3
backgroundColor: elevated
borderRadius: 6, borderWidth: 1, borderColor: border
텍스트: textMuted or textSecondary, fontSize 11
```

**알약형 (선택 가능 칩)**
```
paddingHorizontal: 12, paddingVertical: 6
borderRadius: 20, borderWidth: 1
비선택: elevated 배경 / border 테두리 / textSecondary 텍스트
선택됨 (실수유형): accent+'20' / accent 테두리 / accent 텍스트
선택됨 (감정): #A855F720 / #A855F7 테두리 / #A855F7 텍스트
```

**완료 뱃지 (카드 우상단)**
```
paddingHorizontal: 8, paddingVertical: 3–4
backgroundColor: accent+'20'–'25'
borderRadius: 20, borderWidth: 1, borderColor: accent+'50'–'60'
텍스트: accent, fontSize 11
```

**미완료 뱃지**
```
backgroundColor: #FB923C20
borderColor: #FB923C60
텍스트: #FB923C
```

### 5-5. 텍스트 인풋

```
backgroundColor: elevated
borderWidth: 1, borderColor: border (에러 시 #f87171)
borderRadius: 12
paddingHorizontal: 14, paddingVertical: 12
fontSize: 14, color: textPrimary
placeholder: textMuted
multiline: minHeight 80, textAlignVertical: 'top'
```

**라벨**
```
fontSize: 12–13, fontWeight: 500, color: textSecondary
marginBottom: 6
필수 * : color #f87171
```

### 5-6. 에러 박스

```
backgroundColor: #EF444420
borderWidth: 1, borderColor: #EF444440
borderRadius: 10, padding: 10
텍스트: #F87171, fontSize 12
```

### 5-7. 인포 배너 (스트릭 등)

**스트릭 (주황)**
```
backgroundColor: #FB923C10
borderWidth: 1, borderColor: #FB923C30
borderRadius: 14, padding: 16
flexDirection: row, alignItems: center
```

**미완료 (파랑)**
```
backgroundColor: #3B82F610
borderWidth: 1, borderColor: #3B82F630
```

**힌트 (악센트)**
```
backgroundColor: accent+'15'
borderWidth: 1, borderColor: accent+'30'
borderRadius: 12, padding: 12
```

### 5-8. 아바타

```
width: 60, height: 60, borderRadius: 30
backgroundColor: accent+'20'
borderWidth: 2, borderColor: accent+'50'
텍스트 (이니셜): fontSize 20, fontWeight 700, color accent
```

---

## 6. 화면별 구성

### 홈 (index.tsx)

```
ScrollView (bg)
└── paddingHorizontal:16, paddingTop:24, paddingBottom:32
    ├── 헤더 (앱명 + 서브타이틀, center)
    ├── 스트릭 배너 (streak > 0)
    ├── 미완료 배너 (pendingCount > 0)
    ├── 새 기록 CTA 버튼
    ├── CalendarHeatmap (카드 안)
    │   ├── 타이틀 + 레전드 (row)
    │   └── ScrollView horizontal
    │       ├── 월 라벨 행
    │       ├── 요일 라벨 열 (일~토, 홀수만 표시)
    │       └── 14×14 셀 그리드 (gap:4)
    ├── 주간 요약 카드 (3열 통계)
    ├── 최근 기록 섹션 헤더 + 전체보기
    └── RecordCard × 3 + 패턴 분석 바로가기 카드
```

**히트맵 셀 색상**
```
없음:            heatmapEmpty
있음 강도=0:     #55D2C640
있음 강도 1–2:   #4ade80
있음 강도 3:     #facc15
있음 강도 4:     #fb923c
있음 강도 5:     #f87171
오늘:            borderWidth 1.5, borderColor accent
셀 크기:         14×14, borderRadius 3, gap 4
```

### 기록 목록 (records.tsx)

```
View (bg)
├── 헤더 (내 기록 + 새 기록 버튼)
├── 필터 탭 (전체 / 미완료)
└── FlatList<RecordCard>
    └── 하단 페이지네이션 (이전/다음, page/total)
```

### 패턴 리포트 (report.tsx)

```
ScrollView (bg)
└── padding 16
    ├── 헤더 + 7일/30일 세그먼트
    ├── 기간 표시 텍스트
    ├── PatternSection × 3 (실수유형, 감정, 트리거)
    │   └── PatternBar: 라벨(80px) + 바(flex) + 숫자(24px)
    ├── IntensityTrendChart (바 차트)
    │   └── 높이 96, 바 색상: 강도별
    └── 설명 카드
```

**바 차트 색상**
```
avg > 3:  #f87171 (높음)
avg > 2:  #facc15 (보통)
그 외:    #4ade80 (낮음)
opacity: 0.7
```

### 마이페이지 (mypage.tsx)

```
ScrollView (bg)
└── padding 16/24/40
    ├── 프로필 카드
    │   ├── 아바타 (이니셜 60×60)
    │   ├── 닉네임 (인라인 편집 가능)
    │   ├── 이메일
    │   └── 통계 그리드 2열 (총 기록 수 / 가입일)
    ├── 테마 설정 카드
    │   └── ThemeSelector (☀️ 라이트 / 🌙 다크 2버튼)
    └── 계정 카드
        └── 로그아웃 버튼 (🚪, Alert 확인)
```

**ThemeSelector 버튼**
```
활성: accent+'15' 배경, accent+'50' 테두리, accent 텍스트
비활성: elevated 배경, border 테두리, textSecondary 텍스트
paddingVertical: 16, borderRadius: 14
```

### 기록 작성 (records/new.tsx)

```
ScrollView (bg)
└── padding 16/32
    ├── 헤더 (← + 제목 + 단계 설명)
    ├── StepIndicator (3단계)
    │   └── 원(32×32) + 라벨 + 연결선(height 2)
    ├── [Step 0] 상황·행동·결과 Field × 3
    ├── [Step 1] 원인 Field + 실수유형 칩 + 감정 칩 + 강도 선택
    ├── [Step 2] 힌트 배너 + 다음행동·트리거·방지 Field
    └── 버튼 행 (이전/취소 + 다음/저장)
```

**강도 선택 (1–5)**
```
원형 44×44, borderRadius 22
선택: 해당 강도색+'30' 배경, 2px 강도색 테두리
비선택: elevated 배경, transparent 테두리
```

**StepIndicator**
```
완료된 단계: accent 배경, 체크 '✓', bg색 텍스트
현재 단계:   accent+'20' 배경, accent 테두리, accent 텍스트
미래 단계:   elevated 배경, border 테두리, textMuted 텍스트
연결선: 완료 accent, 미완료 border
```

### 로그인 (login.tsx)

```
KeyboardAvoidingView (bg)
└── ScrollView (center, padding 24)
    ├── 로고 (앱명 + 서브타이틀, center)
    ├── 탭 전환 (로그인 / 회원가입)
    ├── 폼 카드
    │   ├── 이메일 Field
    │   ├── [회원가입] 닉네임 Field
    │   ├── 비밀번호 Field
    │   ├── [회원가입] 비밀번호 확인 Field
    │   ├── 에러 박스 (있을 때)
    │   └── 주요 버튼 (로그인/회원가입)
    └── 하단 캡션
```

---

## 7. 상태 패턴

| 상태 | 구현 |
|---|---|
| 로딩 | `ActivityIndicator color={accent}` |
| 빈 상태 | 카드 안 안내 텍스트 + accent 색 링크 |
| 오류 | `Alert.alert` (모바일) |
| 미완료 | `#FB923C` 계열 뱃지 |
| 완료 | `accent` 계열 뱃지 |
| 비활성 버튼 | `border` 배경, `opacity` 미사용 |

---

## 8. 테마 시스템 구조

```
expo-secure-store ──저장/복원──▶ themeStore (Zustand)
                                      │ isDark
                                      ▼
                               useTheme() hook
                                      │ DARK | LIGHT 팔레트
                                      ▼
                            const c = useTheme()
                            c.bg, c.accent, c.card ...
```

- 기본값: 다크 모드
- 저장 키: `excuse_archive_theme`
- 초기화: `TabsLayout`의 `useEffect`에서 `initializeTheme()` 호출
- 전환: 마이페이지 → 테마 설정 카드에서만 변경 가능
