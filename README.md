# New Lake Coffee ☕

카페에서 줄 서서 기다리는 시간을 없애는 것을 목표로 만든 온라인 주문 앱입니다.
고객은 미리 메뉴를 고르고 결제까지 마친 뒤 매장에 도착하는 즉시 픽업할 수 있고,
종업원·관리자는 별도 화면에서 주문과 매장 운영을 실시간으로 관리합니다.

> **Zero Wait** — 포장이든 매장식사든, 기다림 없이.

## 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [데모 계정](#데모-계정)
- [API 개요](#api-개요)
- [남은 과제](#남은-과제)

## 주요 기능

**고객**
- 회원가입/로그인(아이디 기반), 메뉴 둘러보기, 옵션 선택 후 장바구니 담기
- 포장/매장식사 선택 후 주문·결제, 주문 내역·상태 조회
- 매장이 만석이면 결제 화면에서 매장식사 옵션이 자동으로 잠김
- 관리자가 주문을 "픽업 완료" 처리하면 실시간 알림(배너 + 사운드)으로 수신
- 매장 좌석 현황 확인, 오시는 길(네이버 지도·카카오맵 딥링크)
- 앱 어느 화면에 있든 장바구니·바로주문 바를 통해 몇 번의 클릭 안에 결제까지 이동
- QnA 문의 등록 및 답변 확인

**종업원**
- 신규 주문 실시간 큐 (Socket.IO), 접수 → 제조중 → 완료 상태 변경

**관리자**
- 메뉴·카테고리 CRUD, 종업원 계정 관리, 매출 통계
- 매장 좌석 현황(가능/만석) 토글, QnA 답변
- 모바일에서는 메뉴 목록 행을 탭해 바로 수정 화면으로 이동

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프론트엔드 | HTML·CSS·Vanilla JS (프레임워크 없는 실제 멀티페이지, 페이지별 `.html` 파일) |
| 상태 관리 | `localStorage` (장바구니, JWT 토큰) |
| 백엔드 | Node.js · Express · TypeScript |
| 데이터베이스 | Supabase(PostgreSQL) + Prisma ORM |
| 인증 | JWT(Access·Refresh) + bcrypt, 아이디/비밀번호 로그인 |
| 실시간 | Socket.IO — 신규 주문 알림(종업원·관리자), 픽업 완료 알림(고객) |
| 결제 | Mock(모의) 결제 |
| 길찾기 | 네이버 지도 · 카카오맵 딥링크 |

## 프로젝트 구조

```
cafe-appp/
├── client/                # 정적 파일 (Express가 그대로 서빙, 폴더 경로 = URL 경로)
│   ├── index.html         # 홈
│   ├── menus/  basket/  checkout/  orders/  my/  auth/  qna/  visit/   # 고객
│   ├── staff/             # 종업원 — 주문 큐
│   ├── admin/             # 관리자 — 메뉴/카테고리/주문/종업원/QnA/통계
│   └── shared/            # 공용 스크립트(api, auth, cart)·리셋 CSS
│
└── server/
    ├── prisma/            # schema.prisma, migrations, seed
    └── src/
        ├── routes/        # customer / staff / admin
        ├── controllers/
        ├── services/
        ├── middlewares/   # 인증, 권한, 에러 핸들러
        └── sockets/       # 실시간 알림
```

더 자세한 설계 배경과 의사결정 로그는 [`BLUEPRINT.md`](./BLUEPRINT.md)를 참고하세요.

## 시작하기

### 요구 사항
- Node.js 18+
- Supabase 프로젝트 (또는 다른 PostgreSQL 인스턴스)

### 설치 및 실행

```bash
cd server
npm install
cp .env.example .env
```

`.env`에 아래 값을 채워주세요.

```
DATABASE_URL   # Supabase Transaction Pooler (포트 6543)
DIRECT_URL     # Supabase Direct/Session 커넥션 (포트 5432, 마이그레이션 전용)
JWT_ACCESS_SECRET / JWT_REFRESH_SECRET   # 무작위 값으로 교체
PORT=4000
```

```bash
npx prisma migrate dev
npm run prisma:seed    # 샘플 카테고리/메뉴 + 데모 계정 생성
npm run dev
```

브라우저에서 `http://localhost:4000` 접속 (같은 서버가 정적 파일과 API를 함께 서빙합니다).

### 프로덕션 빌드

```bash
npm run build   # tsc → dist/
npm start       # node dist/server.js
```

## 데모 계정

| 역할 | 아이디 | 비밀번호 |
|---|---|---|
| 관리자 | `admin` | `admin1234` |
| 종업원 | `staff` | `staff1234` |
| 고객 | `/auth/signup`에서 직접 가입 | — |

## API 개요

REST API는 `/api/...` 경로로 제공됩니다.

| 구분 | 예시 |
|---|---|
| 인증 | `POST /api/auth/signup`, `/login`, `/refresh` |
| 메뉴/매장 조회 (공개) | `GET /api/categories`, `/menu-items`, `/store-status` |
| 주문/결제/문의 (로그인 필요) | `POST /api/orders`, `/payments/mock`, `GET /api/orders/me`, `POST /api/questions` |
| 종업원 | `GET /api/staff/orders`, `PATCH /api/staff/orders/:id/status` |
| 관리자 | `/api/admin/menu-items`, `/categories`, `/staff`, `/stats`, `/questions`, `/store-status` (CRUD) |

## 남은 과제

- [ ] 매장 좌석 현황 완전 자동화 (현재는 관리자 수동 토글, 결제 로직에는 실제 반영됨)
- [ ] 실제 PG(토스페이먼츠 등) 결제 연동
- [ ] 단위/통합 자동화 테스트 추가
- [ ] CI/CD 파이프라인 구축 (현재는 실 서버에 수동 배포된 상태)
