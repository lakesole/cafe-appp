# CafeOrder — 카페 온라인 주문 앱 청사진

> 프로젝트 임시 명칭: **CafeOrder** (추후 변경 가능)

> **진행 방식 안내**: 0~1단계(스캐폴딩, 관리자 메뉴 관리)는 서버까지 완료된 상태다. 2단계부터는 **클라이언트 퍼블리싱을 먼저** 진행한다 — 화면은 하드코딩된 샘플 데이터로 채우고 `fetch` API 연동 없이 마크업/스타일/화면 인터랙션(장바구니 담기, 모달 등)까지만 만든다. 실제 서버 API 연동(로그인, 주문/결제, 실시간 알림 등)은 화면이 모두 퍼블리싱된 뒤 마지막 단계에서 한 번에 진행한다.

## 1. 개요

고객이 웹에서 메뉴를 보고, 옵션을 선택해 장바구니에 담고, 주문/결제하는 카페 온라인 주문 앱.
사장님(관리자)과 종업원은 별도 화면에서 메뉴와 주문, 매출을 관리한다.

**핵심 사용자 시나리오**
1. 고객이 사이트 방문 → 메뉴 둘러보기 (로그인 없이도 가능) — 비회원
2. 회원가입/로그인 → 장바구니 담기 → 옵션(사이즈, 샷 추가, 온/아이스 등) 선택 — 회원
    - 회원관리 시스템(비회원, 회원 — 기능적 차이를 둠)
3. 주문서 작성(회원) → 결제 → 주문 완료 (픽업 예상 시간 안내) — 회원
4. 마이페이지에서 주문 내역/상태 확인 — 회원
5. 종업원은 주문 큐에서 신규 주문 확인 → 상태 변경(접수→제조중→완료) — 종업원
6. 관리자(카페 사장)는 메뉴/카테고리 CRUD, 종업원 계정 관리, 매출 통계 확인 — 관리자

**핵심 시스템**
- 고객 관리 시스템 (회원가입/로그인)
- 메뉴 관리 시스템
- 주문 관리 시스템
- 결제 시스템

## 2. 기술 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| 프론트엔드 | 순수 HTML + CSS + Vanilla JavaScript (멀티 페이지) | React 없이, 페이지마다 실제 `.html` 파일 존재. `fetch`로 API 호출 |
| 상태관리 | localStorage (장바구니), JWT는 localStorage에 저장 | 별도 라이브러리 없이 순수 JS(`js/` 폴더 공용 스크립트)로 처리 |
| 스타일 | 순수 CSS (공용 `style.css`) | 프레임워크 없이 직접 작성, 필요시 이후 Tailwind CDN 등으로 교체 가능 |
| 백엔드 | Node.js + Express + TypeScript | REST API + 정적 HTML 파일 서빙 겸용 |
| DB | PostgreSQL (Prisma ORM) | 관계형 데이터에 적합 (주문/옵션 등) |
| 인증 | JWT (access + refresh token), bcrypt | 이메일/비밀번호 로그인, 토큰은 localStorage 보관 후 fetch 헤더에 첨부 |
| 결제 | 목(mock) 결제 모듈로 시작 → 추후 실 PG 연동 가능한 구조 | 실제 카드 결제는 사업자 등록/PG 계약 필요하므로 1단계는 모의 결제로 구현 |
| 실시간 주문 알림 | Socket.IO | 종업원/관리자 화면에 신규 주문 실시간 표시 |
| 이미지 저장 | 로컬 업로드 → 추후 S3 등 교체 가능 | 메뉴 이미지 |
| 배포(추후) | Render/Fly.io 등 단일 서버 (정적 파일 + API 동시 서빙) | 1단계에서는 로컬 실행 우선 |

## 3. 역할(Role) 정의

| 역할 | 대상 | 담당 기능 |
|---|---|---|
| **CUSTOMER** (고객) | 앱 방문 고객 | 메뉴 조회, 결제, 주문 내역 조회 |
| **STAFF** (종업원) | 매장 근무자 | 주문 관리(접수/제조중/완료 상태 변경) |
| **ADMIN** (관리자/카페 사장) | 사장님 | 메뉴 관리(CRUD), 카테고리 관리, 종업원 계정 관리, 매출 통계 |

> ADMIN은 STAFF의 상위 권한을 포함(주문 관리도 가능).

## 4. 폴더 구조 (완전 코로케이션, 클린 URL)

**규칙**
- 폴더 경로 = URL 경로. 각 페이지는 실제 `.html` 파일로 존재한다 (React 없음, 진짜 멀티 페이지).
- `menus/`, `basket/`, `admin/` 처럼 **기능 단위로 폴더 하나씩**을 만들고, 그 안에 같은 페이지의 `.html`/`.css`/`.js`를 나란히 둔다. 타입별 `css/`, `js/` 폴더로 모으지 않는다.
- 브라우저 주소창에는 **확장자 없이** 보이도록 Express 정적 서빙 시 `.html` 확장자를 생략 처리한다.
- 동적 id가 필요한 페이지(상세/수정)는 정적 파일 특성상 폴더로 표현할 수 없으므로 **쿼리스트링**으로 처리한다. 예: `/admin/menus/edit?id=3`.
- 아래 트리의 👤/🟡/🔴 표시는 실제 폴더가 아니라 "이 폴더가 어떤 역할용인지" 보여주는 그룹 주석이다.

```
client/
├─ index.html / index.css / index.js              # 홈 (고객)
│
├─ 👤 고객 — 메뉴
│  └─ menus/
│     ├─ list.html / list.css / list.js           # 메뉴 목록  → /menus/list
│     └─ detail.html / detail.css / detail.js     # 메뉴 상세  → /menus/detail?id=
│
├─ 👤 고객 — 장바구니
│  └─ basket/
│     └─ list.html / list.css / list.js           # 장바구니  → /basket/list
│
├─ 👤 고객 — 주문/결제
│  └─ checkout/
│     └─ index.html / index.css / index.js        # 주문서 작성 + 결제 → /checkout
│
├─ 👤 고객 — 주문 내역
│  └─ orders/
│     ├─ list.html / list.css / list.js           # 주문 내역 목록 → /orders/list
│     └─ detail.html / detail.css / detail.js     # 주문 상세 → /orders/detail?id=
│
├─ 👤 고객 — 마이페이지
│  └─ my/
│     └─ index.html / index.css / index.js        # 마이페이지 메인 → /my
│
├─ 👤 고객 — 인증
│  └─ auth/
│     ├─ login.html / login.css / login.js        # → /auth/login
│     └─ signup.html / signup.css / signup.js     # → /auth/signup
│
├─ 🟡 종업원
│  └─ staff/
│     ├─ list.html / list.css / list.js           # 주문 큐 → /staff/list
│     └─ detail.html / detail.css / detail.js     # 주문 상태 변경 → /staff/detail?id=
│
├─ 🔴 관리자/사장
│  └─ admin/
│     ├─ index.html / index.css / index.js        # 대시보드 → /admin
│     ├─ menus/
│     │  ├─ list.html / list.css / list.js        # → /admin/menus/list
│     │  ├─ create.html / create.css / create.js  # → /admin/menus/create
│     │  └─ edit.html / edit.css / edit.js         # → /admin/menus/edit?id=
│     ├─ categories/
│     │  ├─ list.html / list.css / list.js        # → /admin/categories/list
│     │  ├─ create.html / create.css / create.js  # → /admin/categories/create
│     │  └─ edit.html / edit.css / edit.js         # → /admin/categories/edit?id=
│     ├─ staff/
│     │  ├─ list.html / list.css / list.js        # 종업원 계정 관리 → /admin/staff/list
│     │  ├─ create.html / create.css / create.js  # → /admin/staff/create
│     │  └─ edit.html / edit.css / edit.js         # → /admin/staff/edit?id=
│     └─ stats/
│        └─ index.html / index.css / index.js     # 매출 통계 → /admin/stats
│
└─ shared/                                         # 여러 페이지가 공유하는 코드만 예외적으로 이곳에
   ├─ api.js                                       # fetch 래퍼, 공통 API 호출
   ├─ auth.js                                      # 로그인 상태/토큰 관리
   └─ reset.css                                    # 공통 리셋/기본 스타일
```

**프로젝트 최상위 구조** (위 `client/` + 백엔드 `server/`)

```
cafe-app/
├── client/       # 위 트리 그대로 (정적 파일, Express가 서빙)
├── server/       # Express (API 서버)
│   ├── prisma/            # schema.prisma, migrations (Prisma CLI 기본 위치)
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── routes/
│       │   ├── customer/         # auth, menu, orders, payments
│       │   ├── staff/            # order-management
│       │   └── admin/            # menu, category, staff, stats
│       ├── controllers/
│       ├── services/
│       ├── middlewares/          # auth, requireRole, error handler
│       └── sockets/              # 실시간 신규 주문 알림
└── BLUEPRINT.md
```

## 5. 데이터 모델 (초안)

```
User          id, email, passwordHash, name, phone, role(CUSTOMER|STAFF|ADMIN), createdAt
Category      id, name, sortOrder
MenuItem      id, categoryId, name, description, price, imageUrl, isSoldOut, isAvailable
OptionGroup   id, menuItemId, name(예: 사이즈), isRequired, minSelect, maxSelect
OptionChoice  id, optionGroupId, name(예: Large), extraPrice
Order         id, userId, status(PENDING|PAID|PREPARING|READY|COMPLETED|CANCELED), totalPrice, pickupTime, createdAt
OrderItem     id, orderId, menuItemId, quantity, unitPrice, selectedOptions(JSON)
Payment       id, orderId, method, amount, status(PENDING|SUCCESS|FAILED), paidAt, pgTransactionId
```

## 6. API 엔드포인트 (역할별, 초안)

> REST API는 정적 페이지 URL과 별개로 `/api/...` 규칙을 유지한다. 각 `.html` 페이지의 JS가 이 API를 `fetch`로 호출한다.

**공통 인증**
- POST /api/auth/signup (고객만 가입 가능, STAFF/ADMIN은 관리자가 계정 생성)
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

**CUSTOMER — 메뉴 조회 (공개, 로그인 불필요)**
- GET /api/categories
- GET /api/menu-items
- GET /api/menu-items/:id

**CUSTOMER — 결제 / 주문 내역 조회**
- POST /api/orders — 주문 생성
- POST /api/payments/mock — 모의 결제 처리
- GET /api/orders/me — 내 주문 목록
- GET /api/orders/:id — 주문 상세 (본인 주문만)

**STAFF — 주문 관리** (role=STAFF 이상 필요)
- GET /api/staff/orders (필터: 상태별, 실시간 소켓 수신)
- PATCH /api/staff/orders/:id/status — 접수/제조중/완료 상태 변경

**ADMIN — 메뉴 관리 / 통계 / 종업원 관리** (role=ADMIN 필요)
- GET/POST/PUT/DELETE /api/admin/menu-items
- GET/POST/PUT/DELETE /api/admin/categories
- GET/POST/PUT/DELETE /api/admin/staff — 종업원 계정 관리
- GET /api/admin/stats (일별/월별 매출, 인기 메뉴)
- GET /api/admin/orders — 전체 주문 조회 (ADMIN은 STAFF 권한 포함)

## 7. 개발 단계 (마일스톤 — 클라이언트 퍼블리싱 우선, 서버 연동은 마지막에)

| 단계 | 내용 |
|---|---|
| 0단계 | (완료) 프로젝트 스캐폴딩 (Express 서버 세팅, 정적 파일 서빙 + 클린 URL 설정, DB 연결) |
| 1단계 | (완료) **메뉴 관리 시스템** (관리자) — 카테고리/메뉴 CRUD API + 퍼블리싱 (`/admin/categories/*`, `/admin/menus/*`) |
| 2단계 | **고객 화면 퍼블리싱** — 홈(`/`), 메뉴 목록/상세(`/menus/*`), 장바구니(`/basket/list`, localStorage 기반이라 서버 불필요), 로그인/회원가입(`/auth/*`), 주문서(`/checkout`), 주문 내역(`/orders/*`, `/my`) — 전부 샘플 데이터, API 연동 없음 |
| 3단계 | **종업원 화면 퍼블리싱** — 주문 큐 목록/상세 (`/staff/*`, 샘플 데이터) |
| 4단계 | **관리자 화면 퍼블리싱 나머지** — 종업원 계정 관리(`/admin/staff/*`), 매출 통계(`/admin/stats`, 샘플 데이터) |
| 5단계 | 퍼블리싱 마무리 — 반응형 스타일 점검, 화면 간 네비게이션 정리 |
| 6단계 (보류) | **서버 연동** — 메뉴 조회 API, 인증(JWT) API, 주문 생성/모의결제 API, 종업원 주문 상태 변경 API, 관리자 종업원 계정/매출 통계 API, 실시간 알림(Socket.IO) — 화면이 모두 퍼블리싱된 뒤 별도 논의 후 진행 |
| 7단계 (보류) | 전체 플로우 통합 테스트, 배포 준비 |

## 8. 결정이 필요한 사항 (진행 중 확인)

- 카페/브랜드 이름과 컨셉(색상, 톤) — 기본값은 따뜻한 브라운/크림 톤으로 진행 예정
- 결제는 4단계(주문 관리 시스템)에서 모의 결제로 진행, 실 PG 연동은 사업자 정보 확보 후 별도 진행
- 배포 여부와 시점은 기능 완성 후 별도 논의
- DB는 로컬에 PostgreSQL이 설치되어 있지 않아 1단계는 **SQLite**로 진행 (Prisma 사용 중이라 나중에 PostgreSQL로 교체 쉬움). PostgreSQL 설치 원하시면 이후 전환
- 2단계부터는 서버(API) 작업을 진행하지 않고 클라이언트 퍼블리싱을 우선한다. 서버 착수 시점과 범위(6~7단계)는 퍼블리싱 완료 후 별도 논의

## 9. 구현 체크리스트 (TODO)

### 0단계 — 프로젝트 스캐폴딩
- [x] `server/` Express + TypeScript 프로젝트 초기화 (package.json, tsconfig)
- [x] `client/` 정적 파일 폴더 구조 생성 (4장 트리 그대로)
- [x] Prisma 설정, DB 연결 확인 (※ 로컬 PostgreSQL 미설치로 SQLite로 우선 진행, 8장 참고)
- [x] Express 정적 서빙 설정 (`.html` 확장자 생략 처리, 클린 URL)
- [x] 공통 에러 핸들링 미들웨어 추가

### 1단계 — 메뉴 관리 시스템 (관리자)
- [x] Prisma 스키마: `Category`, `MenuItem`, `OptionGroup`, `OptionChoice` 작성 + 마이그레이션
- [x] `/api/admin/categories` CRUD 구현
- [x] `/api/admin/menu-items` CRUD 구현
- [x] `admin/categories/{list,create,edit}` 퍼블리싱
- [x] `admin/menus/{list,create,edit}` 퍼블리싱
- [x] `admin/index.html` 대시보드 기본 레이아웃(뼈대만)

### 2단계 — 고객 화면 퍼블리싱 (샘플 데이터, API 연동 없음)
- [x] `index.html` (홈) 퍼블리싱
- [x] `menus/list.html` + `list.js` — 카테고리 탭, 메뉴 목록 렌더링 (샘플 데이터)
- [x] `menus/detail.html` + `detail.js` — 메뉴 상세, 옵션 선택 UI (샘플 데이터)
- [x] `shared/cart.js` — localStorage 기반 장바구니 로직 (담기/수량변경/삭제) — 서버 불필요, 실제 동작하게 구현
- [x] `basket/list.html` + `list.js` — 장바구니 목록 렌더링
- [x] `auth/login.html`, `auth/signup.html` 퍼블리싱 (제출 시 API 호출 없이 화면만)
- [x] `checkout/index.html` + `index.js` — 주문서 작성 폼 (샘플 데이터, 제출은 화면 전환만)
- [x] `orders/list.html`, `orders/detail.html` 퍼블리싱 (샘플 주문 데이터)
- [x] `my/index.html` 퍼블리싱

### 3단계 — 종업원 화면 퍼블리싱 (샘플 데이터)
- [x] `staff/list.html` — 주문 큐 목록 (샘플 데이터, 상태 변경 버튼은 화면 인터랙션만)
- [x] `staff/detail.html` — 주문 상세/상태 변경 화면

### 4단계 — 관리자 화면 퍼블리싱 나머지 (샘플 데이터)
- [x] `admin/staff/{list,create,edit}` 퍼블리싱 — 종업원 계정 관리
- [x] `admin/stats/index.html` 퍼블리싱 — 매출 통계 (샘플 차트/숫자)

### 5단계 — 퍼블리싱 마무리
- [x] 반응형 스타일 점검 (모바일/데스크톱)
- [x] 역할별 화면 간 네비게이션 링크 점검

### 6단계 — 서버 연동
- [x] `GET /api/categories`, `/api/menu-items`, `/api/menu-items/:id` 구현 (공개, 인증 불필요)
- [x] `User` 모델 + role(`CUSTOMER`/`STAFF`/`ADMIN`) 필드 추가
- [x] `POST /api/auth/signup`, `login`, `refresh`, `logout` 구현 (JWT + bcrypt)
- [x] `shared/auth.js` — 토큰 저장/헤더 첨부/로그인 상태 체크 유틸
- [x] `Order`, `OrderItem`, `Payment` 모델 추가
- [x] `POST /api/orders` 구현 + `POST /api/payments/mock`
- [x] `GET /api/orders/me`, `GET /api/orders/:id` 구현
- [x] `requireRole` 미들웨어 구현 (STAFF 이상 접근 제어)
- [ ] `GET /api/staff/orders`, `PATCH /api/staff/orders/:id/status` 구현
- [ ] `/api/admin/staff` CRUD 구현
- [ ] `GET /api/admin/stats` 구현
- [ ] Socket.IO 서버 설정 + 신규 주문 이벤트 브로드캐스트, 클라이언트 수신 처리
- [ ] 퍼블리싱된 화면들을 실제 API와 연결 (fetch 연동)

### 7단계 — 마무리 (보류)
- [ ] 전체 플로우 수동 테스트 (관리자 메뉴 등록 → 고객 조회 → 장바구니 → 주문/결제 → 종업원 처리 → 관리자 확인)
- [ ] 배포 준비 (환경변수 정리, 빌드/실행 스크립트)

---

이 문서를 기준으로, 다음은 2단계(고객 화면 퍼블리싱)부터 5단계까지 진행하고, 6~7단계(서버 연동/마무리)는 이후 별도로 논의합니다.
