# 프론트 인증 구현 순서

모든 API 응답은 아래 형태입니다.

```ts
type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
};
```

로그인 성공 후 받는 토큰 응답은 아래 형태입니다.

```ts
type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};
```

로그인 후 인증이 필요한 API는 항상 access token을 붙입니다.

```http
Authorization: Bearer {accessToken}
```

## 1. 회원가입 화면

회원가입 화면에서는 `username`, `password`, `passwordConfirm` 정도를 받으면 됩니다.

프론트 검증:

- username: 4~20자
- username: 영문 소문자, 숫자만 가능
- password: 8~20자
- password: 영문, 숫자, 특수문자 각각 1개 이상 포함
- passwordConfirm: password와 같은지 확인

### 1-1. 아이디 중복 확인

사용자가 아이디를 입력하고 중복 확인 버튼을 눌렀을 때 호출합니다.

```http
GET /api/auth/check-username?username={username}
```

예시:

```ts
const res = await fetch(
  `${API_BASE_URL}/api/auth/check-username?username=${encodeURIComponent(username)}`,
);

const body = await res.json();

if (body.ok) {
  // 사용 가능한 아이디
} else if (body.error === "A001") {
  // 이미 사용 중인 아이디
} else {
  // 입력값 오류 등
}
```

프론트에서 처리할 상태:

- 중복 확인 전: 회원가입 버튼 비활성화 권장
- 성공: "사용 가능한 아이디입니다."
- `A001`: "이미 사용 중인 아이디입니다."
- 그 외 실패: "아이디를 확인해주세요."

### 1-2. 회원가입 제출

사용자가 회원가입 버튼을 눌렀을 때 호출합니다.

```http
POST /api/auth/signup
Content-Type: application/json
```

Request:

```json
{
  "username": "testuser1",
  "password": "Password1!"
}
```

예시:

```ts
const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username,
    password,
  }),
});

const body = await res.json();

if (body.ok) {
  // 회원가입 성공
  // 선택 1: 로그인 페이지로 이동
  // 선택 2: 바로 로그인 API 호출
}
```

회원가입 성공 응답에는 토큰이 없습니다.

그래서 회원가입 성공 후 선택지는 둘 중 하나입니다.

- 로그인 페이지로 보내기
- 같은 username/password로 바로 로그인 API 호출하기

추천 흐름:

```text
회원가입 성공
-> POST /api/auth/login 자동 호출
-> 토큰 저장
-> 메인 화면 이동
```

## 2. 로그인 화면

로그인 화면에서는 `username`, `password`를 받습니다.

사용자가 로그인 버튼을 눌렀을 때 호출합니다.

```http
POST /api/auth/login
Content-Type: application/json
```

Request:

```json
{
  "username": "testuser1",
  "password": "Password1!"
}
```

예시:

```ts
const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username,
    password,
  }),
});

const body = await res.json();

if (body.ok) {
  const tokens = body.data;

  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);

  // 메인 화면으로 이동
} else {
  // 에러 메시지 표시
}
```

로그인 실패 메시지:

- `A002`: 아이디 또는 비밀번호가 올바르지 않습니다.
- `A003`: 로그인 시도가 많아 계정이 잠겼습니다. 잠시 후 다시 시도해주세요.
- `A004`: 탈퇴한 계정입니다.

## 3. 로그인 후 API 호출

로그인 후에는 저장한 access token을 꺼내서 API 요청마다 붙입니다.

```ts
const accessToken = localStorage.getItem("accessToken");

const res = await fetch(`${API_BASE_URL}/api/some-protected-api`, {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

인증이 필요한 API에서 `401`이 오면 access token이 만료됐을 수 있습니다.

그때는 바로 로그인 화면으로 보내지 말고, 먼저 토큰 재발급을 시도합니다.

## 4. 토큰 재발급

access token이 만료되면 인증 API에서 `401`이 발생할 수 있습니다.

이때 프론트는 로그인 화면으로 바로 보내지 말고, 먼저 refresh token으로 새 토큰을 받아야 합니다.

### 사용 API

```http
POST /api/auth/reissue
Content-Type: application/json
```

### Request

```json
{
  "refreshToken": "refresh-token"
}
```

### 성공하면

- 응답으로 새 `accessToken`, 새 `refreshToken`이 내려옵니다.
- 기존에 저장해둔 토큰을 둘 다 새 값으로 교체합니다.
- 방금 실패했던 원래 API 요청을 한 번 다시 보냅니다.

### 실패하면

- 저장된 `accessToken`, `refreshToken`을 삭제합니다.
- 로그인 화면으로 이동시킵니다.

### 프론트 예시

```ts
const refreshToken = localStorage.getItem("refreshToken");

const res = await fetch(`${API_BASE_URL}/api/auth/reissue`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    refreshToken,
  }),
});

const body = await res.json();

if (body.ok) {
  localStorage.setItem("accessToken", body.data.accessToken);
  localStorage.setItem("refreshToken", body.data.refreshToken);

  // 여기서 원래 실패했던 요청을 한 번 다시 호출
} else {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  // 로그인 화면으로 이동
}
```

### 주의할 점

- 재발급 성공 시 refresh token도 새로 바뀝니다.
- 새 access token만 저장하면 안 됩니다.
- 반드시 새 refresh token도 같이 저장해야 합니다.
- 여러 API가 동시에 `401`을 받으면 `/api/auth/reissue`가 여러 번 호출될 수 있습니다.
- 그래서 재발급 요청은 한 번만 보내고, 나머지 요청은 그 결과를 기다리게 처리하는 것이 좋습니다.

### 에러 메시지

- `A005`: 로그인 세션이 만료되었습니다. 다시 로그인해주세요.

## 5. 로그아웃

로그아웃 버튼을 눌렀을 때 호출합니다.

```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

Request body는 없습니다.

예시:

```ts
const accessToken = localStorage.getItem("accessToken");

try {
  await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
} finally {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  // 로그인 화면 또는 첫 화면으로 이동
}
```

프론트 처리:

- 로그아웃 API 호출
- API 성공/실패와 관계없이 프론트 토큰 삭제
- 로그인 화면 또는 첫 화면으로 이동

## 6. 회원탈퇴

회원탈퇴 화면에서는 비밀번호를 한 번 더 입력받습니다.

사용자가 탈퇴 버튼을 눌렀을 때 호출합니다.

```http
DELETE /api/auth/withdraw
Authorization: Bearer {accessToken}
Content-Type: application/json
```

Request:

```json
{
  "password": "Password1!"
}
```

예시:

```ts
const accessToken = localStorage.getItem("accessToken");

const res = await fetch(`${API_BASE_URL}/api/auth/withdraw`, {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    password,
  }),
});

const body = await res.json();

if (body.ok) {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  // 탈퇴 완료 화면 또는 첫 화면으로 이동
} else if (body.error === "A002") {
  // 비밀번호가 올바르지 않습니다.
}
```

## 7. GitHub 로그인

일반 로그인 화면에 GitHub 로그인 버튼을 둡니다.

사용자가 GitHub 로그인 버튼을 누르면 fetch가 아니라 브라우저 이동을 시킵니다.

```ts
window.location.href = `${API_BASE_URL}/api/auth/github/authorize`;
```

흐름:

```text
GitHub 로그인 버튼 클릭
-> /api/auth/github/authorize 로 이동
-> GitHub 로그인/동의
-> 프론트 callback 페이지로 돌아옴
-> URL query에서 ticket 읽기
-> /api/auth/github/token 호출
-> 토큰 저장
-> 메인 화면 이동
```

### 7-1. GitHub callback 페이지 처리

GitHub 로그인이 성공하면 프론트 callback 페이지 URL에 `ticket`이 붙어 돌아옵니다.

예시:

```text
/auth/github/callback?ticket=abc123
```

프론트 callback 페이지에서 할 일:

```ts
const params = new URLSearchParams(window.location.search);
const ticket = params.get("ticket");
const error = params.get("error");

if (error) {
  // GitHub 로그인 실패 메시지 표시
  // 로그인 화면으로 이동
}

if (ticket) {
  const res = await fetch(`${API_BASE_URL}/api/auth/github/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ticket }),
  });

  const body = await res.json();

  if (body.ok) {
    localStorage.setItem("accessToken", body.data.accessToken);
    localStorage.setItem("refreshToken", body.data.refreshToken);

    // URL에서 ticket 제거 후 메인 화면 이동
  } else {
    // GitHub 로그인 실패 메시지 표시
  }
}
```

ticket으로 토큰 받는 API:

```http
POST /api/auth/github/token
Content-Type: application/json
```

Request:

```json
{
  "ticket": "github-login-ticket"
}
```

실패 메시지:

- `A008`: GitHub 로그인에 실패했습니다. 다시 시도해주세요.

## 8. GitHub 계정 연동

이건 이미 로그인한 사용자가 설정 화면에서 GitHub 계정을 연결할 때 쓰는 기능입니다.

예시 화면:

- 마이페이지
- 설정
- 연동 관리
- GitHub repository 선택 전 단계

사용자가 GitHub 연동 버튼을 누르면 아래 URL로 이동시킵니다.

```ts
window.location.href = `${API_BASE_URL}/api/github/link/authorize`;
```

API 자체는 인증이 필요한 API입니다.

```http
GET /api/github/link/authorize
Authorization: Bearer {accessToken}
```

주의:

- 이 API는 redirect 방식인데 access token도 필요합니다.
- 단순 `window.location.href` 이동은 Authorization 헤더를 붙일 수 없습니다.
- 프론트에서 이 기능을 붙일 때는 백엔드와 방식 확인이 필요합니다.
- 가능한 방식은 쿠키 인증으로 바꾸거나, 연동 시작용 API를 별도로 두는 방식입니다.

성공하면 프론트 성공 URL로 돌아오며 query에 `githubLinked=true`가 붙습니다.

```text
/settings/integrations?githubLinked=true
```

프론트에서 할 일:

- `githubLinked=true` 확인
- "GitHub 연동이 완료되었습니다." 표시
- GitHub repository 목록 다시 조회
- URL에서 query 제거

실패 메시지:

- `A011`: 이미 다른 계정에 연결된 GitHub 계정입니다.

## 9. GitHub repository 선택

GitHub 로그인 또는 GitHub 연동이 끝난 뒤, 사용자가 repository를 선택하는 화면에서 사용합니다.

### 9-1. GitHub repository 목록 조회

```http
GET /api/github/repositories
Authorization: Bearer {accessToken}
```

예시:

```ts
const accessToken = localStorage.getItem("accessToken");

const res = await fetch(`${API_BASE_URL}/api/github/repositories`, {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

const body = await res.json();

if (body.ok) {
  const repositories = body.data;
}
```

응답 데이터:

```ts
type GithubRepository = {
  githubRepositoryId: number;
  name: string;
  fullName: string;
  privateRepository: boolean;
  defaultBranch: string;
  htmlUrl: string;
};
```

화면에 보여주면 좋은 값:

- `fullName`: `owner/repo`
- `privateRepository`: private/public 표시
- `defaultBranch`: 기본 브랜치
- `htmlUrl`: GitHub 바로가기

### 9-2. repository 연결

사용자가 repository를 하나 선택하고 연결 버튼을 누르면 호출합니다.

```http
POST /api/github/repositories/connect
Authorization: Bearer {accessToken}
Content-Type: application/json
```

Request:

```json
{
  "githubRepositoryId": 123456789
}
```

예시:

```ts
const res = await fetch(`${API_BASE_URL}/api/github/repositories/connect`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    githubRepositoryId,
  }),
});

const body = await res.json();

if (body.ok) {
  // 연결 완료
  // 연결된 repository 목록 화면으로 이동하거나 목록 재조회
}
```

실패 메시지:

- `A010`: GitHub repository를 찾을 수 없습니다.

### 9-3. 연결된 repository 목록 조회

```http
GET /api/github/repositories/connected
Authorization: Bearer {accessToken}
```

사용하는 곳:

- 설정 화면
- 대시보드
- 현재 연결된 repository 표시 영역

### 9-4. repository 연결 해제

```http
DELETE /api/github/repositories/{repositoryId}
Authorization: Bearer {accessToken}
```

`repositoryId`에는 `githubRepositoryId`를 넣습니다.

예시:

```ts
await fetch(`${API_BASE_URL}/api/github/repositories/${githubRepositoryId}`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

프론트 처리:

- 성공하면 목록에서 제거
- 또는 연결된 repository 목록 다시 조회

## 10. GitHub 계정 연동 해제

설정 화면에서 GitHub 계정 연동 해제 버튼을 눌렀을 때 호출합니다.

```http
DELETE /api/github/link
Authorization: Bearer {accessToken}
```

예시:

```ts
const res = await fetch(`${API_BASE_URL}/api/github/link`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

const body = await res.json();

if (body.ok) {
  // GitHub 연동 상태 false 처리
  // 연결된 repository 목록 비우기 또는 재조회
}
```

실패 메시지:

- `A009`: GitHub 계정이 연동되어 있지 않습니다.
- `A012`: GitHub 로그인 계정은 연동을 해제할 수 없습니다.

## 11. 전체 구현 순서 요약

프론트에서 붙이는 순서는 이렇게 가면 됩니다.

```text
1. 회원가입 화면
   - 아이디 중복 확인
   - 회원가입 요청
   - 성공 후 로그인 처리

2. 로그인 화면
   - 로컬 로그인
   - GitHub 로그인 버튼

3. 토큰 저장
   - accessToken 저장
   - refreshToken 저장
   - 인증 API에 Authorization 헤더 붙이기

4. 401 처리
   - 사용 API: POST /api/auth/reissue
   - refreshToken을 body에 담아서 호출
   - 성공하면 새 accessToken/refreshToken 저장
   - 원래 실패했던 API 요청 1회 재시도
   - 실패하면 토큰 삭제 후 로그인 화면 이동

5. 로그아웃
   - /api/auth/logout 호출
   - 토큰 삭제

6. 회원탈퇴
   - 비밀번호 입력
   - /api/auth/withdraw 호출
   - 성공하면 토큰 삭제

7. GitHub 로그인
   - /api/auth/github/authorize 이동
   - callback에서 ticket 처리
   - /api/auth/github/token으로 토큰 저장

8. GitHub 연동
   - 설정 화면에서 연동
   - githubLinked=true 처리

9. Repository 선택
   - 목록 조회
   - 선택한 repository 연결
   - 연결된 repository 표시
```

## 12. 에러 메시지 매핑

```ts
const ERROR_MESSAGE: Record<string, string> = {
  A001: "이미 사용 중인 아이디입니다.",
  A002: "아이디 또는 비밀번호가 올바르지 않습니다.",
  A003: "로그인 시도가 많아 계정이 잠겼습니다. 잠시 후 다시 시도해주세요.",
  A004: "탈퇴한 계정입니다.",
  A005: "로그인 세션이 만료되었습니다. 다시 로그인해주세요.",
  A006: "로그아웃된 세션입니다. 다시 로그인해주세요.",
  A007: "로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.",
  A008: "GitHub 로그인에 실패했습니다. 다시 시도해주세요.",
  A009: "GitHub 계정이 연동되어 있지 않습니다.",
  A010: "GitHub repository를 찾을 수 없습니다.",
  A011: "이미 다른 계정에 연결된 GitHub 계정입니다.",
  A012: "GitHub 로그인 계정은 연동을 해제할 수 없습니다.",
  C002: "입력값을 확인해주세요.",
  C003: "로그인이 필요합니다.",
  C004: "접근 권한이 없습니다.",
};
```
