# API 테스트 결과

- **테스트 일시**: 2026-03-31
- **서버**: `http://localhost:8080/api`
- **테스트 환경**: curl (로컬 백엔드 서버 직접 호출)

---

## 1. 익명 인증 `POST /auth/anonymous`

### Request
```http
POST /api/auth/anonymous
Content-Type: application/json
```

### Response `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "externalId": "fece74e0-b3ff-4763-be63-f1bae3f859cc"
}
```

**결과**: ✅ 정상 — JWT 토큰 및 externalId 발급

---

## 2. 기록 생성 `POST /records`

### Request
```http
POST /api/records
Authorization: Bearer {token}
Content-Type: application/json

{
  "occurredAt": "2026-03-31T10:00:00Z",
  "situation": "테스트 상황입니다",
  "myAction": "테스트 행동",
  "result": "테스트 결과",
  "cause": "테스트 원인",
  "nextAction": "테스트 다음 행동",
  "mistakeType": "PROCRASTINATION",
  "emotion": "ANXIETY",
  "intensityLevel": 3
}
```

### Response `200 OK`
```json
{
  "id": 20,
  "occurredAt": "2026-03-31T10:00:00Z",
  "situation": "테스트 상황입니다",
  "myAction": "테스트 행동",
  "result": "테스트 결과",
  "cause": "테스트 원인",
  "nextAction": "테스트 다음 행동",
  "recurrenceTrigger": null,
  "recurrenceAction": null,
  "nextActionDone": false,
  "mistakeType": "PROCRASTINATION",
  "emotion": "ANXIETY",
  "intensityLevel": 3,
  "createdAt": "2026-03-31T06:07:48.310267Z",
  "updatedAt": "2026-03-31T06:07:48.310267Z"
}
```

**결과**: ✅ 정상 — ID 20으로 기록 생성됨

> **주의**: `occurredAt`은 반드시 UTC ISO 8601 포맷(`2026-03-31T10:00:00Z`)이어야 함. timezone 없이 `2026-03-31T10:00:00`만 보내면 400 에러 발생.

---

## 3. 기록 목록 조회 `GET /records`

### Request
```http
GET /api/records?page=0&size=5
Authorization: Bearer {token}
```

### Response `200 OK`
```json
{
  "content": [...],
  "totalElements": 1,
  "totalPages": 1,
  "size": 5,
  "number": 0
}
```

**결과**: ✅ 정상 — 페이징 포함 목록 반환

---

## 4. 기록 단건 조회 `GET /records/:id`

### Request
```http
GET /api/records/20
Authorization: Bearer {token}
```

### Response `200 OK`
```json
{
  "id": 20,
  "situation": "테스트 상황입니다",
  ...
}
```

**결과**: ✅ 정상

---

## 5. 기록 수정 `PATCH /records/:id`

### Request
```http
PATCH /api/records/20
Authorization: Bearer {token}
Content-Type: application/json

{
  "nextActionDone": true
}
```

### Response `200 OK`
```json
{
  "id": 20,
  "nextActionDone": true,
  ...
}
```

**결과**: ✅ 정상 — `nextActionDone` 필드 업데이트 확인

---

## 6. 패턴 리포트 `GET /reports/patterns`

### Request
```http
GET /api/reports/patterns?days=7
Authorization: Bearer {token}
```

### Response `200 OK`
```json
{
  "days": 7,
  "since": "...",
  "generatedAt": "...",
  "topMistakeTypes": [
    { "key": "PROCRASTINATION", "count": 1 }
  ],
  "topEmotions": [],
  "topTriggers": []
}
```

**결과**: ✅ 정상 — 7일 기준 패턴 집계 반환

---

## 7. 기록 삭제 `DELETE /records/:id`

### Request
```http
DELETE /api/records/20
Authorization: Bearer {token}
```

### Response `204 No Content`

**결과**: ✅ 정상

---

## 전체 결과 요약

| API | 메서드 | 엔드포인트 | 상태 |
|-----|--------|-----------|------|
| 익명 인증 | POST | `/auth/anonymous` | ✅ |
| 기록 생성 | POST | `/records` | ✅ |
| 기록 목록 | GET | `/records` | ✅ |
| 기록 단건 | GET | `/records/:id` | ✅ |
| 기록 수정 | PATCH | `/records/:id` | ✅ |
| 패턴 리포트 | GET | `/reports/patterns` | ✅ |
| 기록 삭제 | DELETE | `/records/:id` | ✅ |

**전체 7개 API 모두 정상 동작**

---

## 발견된 이슈

### occurredAt 포맷 제약
- **현상**: `occurredAt`에 timezone 정보 없이 전송 시 400 에러
- **원인**: 서버가 `java.time.Instant` 타입으로 파싱하므로 UTC offset 필수
- **해결**: 프론트엔드에서 날짜 전송 시 반드시 `Z` 또는 `+00:00` 포함 필요
  ```ts
  // 잘못된 예
  "2026-03-31T10:00:00"
  // 올바른 예
  new Date().toISOString() // "2026-03-31T10:00:00.000Z"
  ```
