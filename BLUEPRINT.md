# New Lake Coffee — 카페 온라인 주문 앱 청사진

> 이 문서는 최초 기획안이며, 실제 구현하면서 바뀐 결정들을 계속 반영해 최신 상태로 유지한다. (최근 갱신: 아이디 기반 로그인 전환, Supabase 연결, 매장식사/포장·좌석 현황·QnA·오시는 길 기능 반영)

## 1. 개요

고객이 웹에서 메뉴를 보고, 옵션을 선택해 장바구니에 담고, 주문/결제하는 카페 온라인 주문 앱.
사장님(관리자)과 종업원은 별도 화면에서 메뉴와 주문, 매출을 관리한다.

**핵심 기획 의도 — 대기 없는 픽업**
미리 주문하고 결제까지 마치면, 매장에 도착하는 순간 바로 받아갈 수 있어야 한다. 포장뿐 아니라 매장식사(다이인)도 지원해서, 어떤 방식으로 오든 줄 서서 기다리는 시간을 없애는 것이 이 앱의 존재 이유다.

**핵심 사용자 시나리오**
1. 고객이 사이트 방문 → 메뉴 둘러보기, 매장 좌석 현황·오시는 길 확인 (로그인 없이도 가능) — 비회원
2. 회원가입/로그인 → 장바구니 담기 → 옵션(사이즈, 샷 추가, 온/아이스 등) 선택 — 회원
    - 회원관리 시스템(비회원, 회원 — 기능적 차이를 둠)
3. 주문서 작성(회원) → 포장/매장식사 선택 → 결제 → 주문 완료 (픽업 예상 시간 안내) — 회원
4. 마이페이지에서 주문 내역/상태 확인, 문의(QnA) 등록 — 회원
5. 종업원은 주문 큐에서 신규 주문 확인 → 상태 변경(접수→제조중→완료) — 종업원
6. 관리자(카페 사장)는 메뉴/카테고리 CRUD, 종업원 계정 관리, 매출 통계, 매장 좌석 현황 토글, QnA 답변 확인 — 관리자

**핵심 시스템**
- 고객 관리 시스템 (회원가입/로그인 — 아이디 기반)
- 메뉴 관리 시스템
- 주문 관리 시스템 (포장/매장식사 구분)
- 결제 시스템
- 매장 좌석 현황 시스템 (관리자 수동 토글 — 완전 실시간화는 개선 과제, 8장 참고)
- QnA 문의 시스템

## 2. 기술 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| 프론트엔드 | 순수 HTML + CSS + Vanilla JavaScript (멀티 페이지) | React 없이, 페이지마다 실제 `.html` 파일 존재. `fetch`로 API 호출 |
| 상태관리 | localStorage (장바구니), JWT는 localStorage에 저장 | 별도 라이브러리 없이 순수 JS(`shared/` 공용 스크립트)로 처리 |
| 스타일 | 순수 CSS (페이지별 공존 + `shared/reset.css`) | 프레임워크 없이 직접 작성 |
| 백엔드 | Node.js + Express + TypeScript | REST API + 정적 HTML 파일 서빙 겸용 |
| DB | **Supabase (PostgreSQL) + Prisma ORM** | 관리형 Postgres — 별도 DB 서버 운영 없이 배포까지 이어가기 좋음. 앱 쿼리는 Transaction Pooler(6543), 마이그레이션은 Direct/Session 커넥션(5432) 사용 |
| 인증 | JWT (access + refresh token), bcrypt | **아이디/비밀번호** 로그인 (이메일 아님), 토큰은 localStorage 보관 후 fetch 헤더에 첨부 |
| 결제 | 목(mock) 결제 모듈로 시작 → 추후 실 PG 연동 가능한 구조 | 실제 카드 결제는 사업자 등록/PG 계약 필요하므로 1단계는 모의 결제로 구현 |
| 실시간 주문 알림 | Socket.IO | 종업원/관리자 화면에 신규 주문 실시간 표시 |
| 길찾기 | 네이버 지도 · 카카오맵 딥링크 | 지도 SDK 직접 연동 없이, 매장 주소로 외부 지도 앱을 바로 열어 길찾기 지원 |
| 이미지 저장 | 외부 이미지 URL (Unsplash) → 추후 S3 등 교체 가능 | 메뉴 이미지 |
| 배포(추후) | Render/Fly.io 등 단일 서버 (정적 파일 + API 동시 서빙) | 현재는 로컬 실행 + Supabase 원격 DB |

## 3. 역할(Role) 정의

| 역할 | 대상 | 담당 기능 |
|---|---|---|
| **CUSTOMER** (고객) | 앱 방문 고객 | 메뉴 조회, 결제, 주문 내역 조회, QnA 문의 |
| **STAFF** (종업원) | 매장 근무자 | 주문 관리(접수/제조중/완료 상태 변경) |
| **ADMIN** (관리자/카페 사장) | 사장님 | 메뉴 관리(CRUD), 카테고리 관리, 종업원 계정 관리, 매출 통계, 매장 좌석 현황 관리, QnA 답변 |

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
│     └─ index.html / index.css / index.js        # 주문서 작성(포장/매장식사 선택) + 결제 → /checkout
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
├─ 👤 고객 — QnA 문의
│  └─ qna/
│     └─ list.html / list.css / list.js           # 내 문의 목록/등록 → /qna/list
│
├─ 👤 고객 — 오시는 길
│  └─ visit/
│     └─ index.html / index.css / index.js        # 주소·영업시간·좌석 현황·길찾기 → /visit
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
│     ├─ orders/
│     │  └─ list.html / list.css / list.js        # 전체 주문 관리 (STAFF 권한 포함) → /admin/orders/list
│     ├─ staff/
│     │  ├─ list.html / list.css / list.js        # 종업원 계정 관리 → /admin/staff/list
│     │  ├─ create.html / create.css / create.js  # → /admin/staff/create
│     │  └─ edit.html / edit.css / edit.js         # → /admin/staff/edit?id=
│     ├─ qna/
│     │  ├─ list.html / list.css / list.js        # 문의 목록 → /admin/qna/list
│     │  └─ detail.html / detail.css / detail.js  # 문의 답변 → /admin/qna/detail?id=
│     └─ stats/
│        └─ index.html / index.css / index.js     # 매출 통계 → /admin/stats
│
└─ shared/                                         # 여러 페이지가 공유하는 코드만 예외적으로 이곳에
   ├─ api.js                                       # fetch 래퍼, 공통 API 호출
   ├─ auth.js                                      # 로그인 상태/토큰 관리
   ├─ cart.js                                      # localStorage 기반 장바구니 로직
   ├─ sample-data.js                               # 로컬 오버레이용 샘플/데모 데이터
   └─ reset.css                                    # 공통 리셋/기본 스타일
```

**프로젝트 최상위 구조** (위 `client/` + 백엔드 `server/`)

```
cafe-appp/
├── client/       # 위 트리 그대로 (정적 파일, Express가 서빙)
├── server/       # Express (API 서버)
│   ├── prisma/            # schema.prisma, migrations (Prisma CLI 기본 위치)
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── routes/
│       │   ├── customer/         # auth, category, menu, orders, payments, questions, store-status
│       │   ├── staff/            # order-management
│       │   └── admin/            # category, menu, staff, stats, questions, store-status
│       ├── controllers/
│       ├── services/
│       ├── middlewares/          # auth, requireRole, error handler
│       └── sockets/              # 실시간 신규 주문 알림
└── BLUEPRINT.md
```

## 5. 데이터 모델

```
User          id, username, passwordHash, name, phone, role(CUSTOMER|STAFF|ADMIN), createdAt
Category      id, name, sortOrder
MenuItem      id, categoryId, name, description, price, imageUrl, isSoldOut, isAvailable
OptionGroup   id, menuItemId, name(예: 사이즈), isRequired, minSelect, maxSelect
OptionChoice  id, optionGroupId, name(예: Large), extraPrice
Order         id, userId, status(PENDING|PAID|PREPARING|READY|COMPLETED|CANCELED), orderType(DINE_IN|TAKEOUT), totalPrice, pickupTime, createdAt
OrderItem     id, orderId, menuItemId, quantity, unitPrice, selectedOptions(JSON)
Payment       id, orderId, method, amount, status(PENDING|SUCCESS|FAILED), paidAt, pgTransactionId
Question      id, userId, title, content, answer, answeredAt, createdAt         # QnA 문의
StoreStatus   id, seatStatus(AVAILABLE|FULL), updatedAt                         # 싱글턴, 매장 좌석 현황
```

## 6. API 엔드포인트 (역할별)

> REST API는 정적 페이지 URL과 별개로 `/api/...` 규칙을 유지한다. 각 `.html` 페이지의 JS가 이 API를 `fetch`로 호출한다.

**공통 인증**
- POST /api/auth/signup (고객만 가입 가능, STAFF/ADMIN은 관리자가 계정 생성) — `username`/`password`/`name`/`phone`
- POST /api/auth/login — `username`/`password`
- POST /api/auth/refresh
- POST /api/auth/logout

**CUSTOMER — 메뉴/매장 조회 (공개, 로그인 불필요)**
- GET /api/categories
- GET /api/menu-items
- GET /api/menu-items/:id
- GET /api/store-status — 매장 좌석 가능/만석 현황

**CUSTOMER — 주문/결제/문의** (로그인 필요)
- POST /api/orders — 주문 생성 (포장/매장식사 `orderType` 포함)
- POST /api/payments/mock — 모의 결제 처리
- GET /api/orders/me — 내 주문 목록
- GET /api/orders/:id — 주문 상세 (본인 주문만)
- POST /api/questions — 문의 등록
- GET /api/questions/me — 내 문의 목록
- GET /api/questions/:id — 문의 상세 (본인 것만)

**STAFF — 주문 관리** (role=STAFF 이상 필요)
- GET /api/staff/orders (필터: 상태별, 실시간 소켓 수신)
- GET /api/staff/orders/:id
- PATCH /api/staff/orders/:id/status — 접수/제조중/완료 상태 변경
- 관리자 주문 관리 화면(`/admin/orders/list`)도 이 API를 그대로 사용 (STAFF/ADMIN 둘 다 허용)

**ADMIN — 메뉴 관리 / 통계 / 종업원 관리 / QnA / 매장 현황** (role=ADMIN 필요)
- GET/POST/PUT/DELETE /api/admin/menu-items
- GET/POST/PUT/DELETE /api/admin/categories
- GET/POST/PUT/DELETE /api/admin/staff — 종업원 계정 관리
- GET /api/admin/stats (일별/월별 매출, 인기 메뉴)
- GET /api/admin/questions, GET /api/admin/questions/:id, PATCH /api/admin/questions/:id/answer — QnA 답변
- GET /api/admin/store-status, PATCH /api/admin/store-status — 좌석 현황 수동 토글 (완전 자동화는 8장 개선 과제)

## 7. 개발 단계 (마일스톤)

| 단계 | 내용 | 상태 |
|---|---|---|
| 0단계 | 프로젝트 스캐폴딩 (Express 서버 세팅, 정적 파일 서빙 + 클린 URL 설정, DB 연결) | 완료 |
| 1단계 | **메뉴 관리 시스템** (관리자) — 카테고리/메뉴 CRUD API + 퍼블리싱 | 완료 |
| 2단계 | **고객 화면 퍼블리싱** — 홈, 메뉴, 장바구니, 로그인/회원가입, 주문서, 주문 내역 (샘플 데이터) | 완료 |
| 3단계 | **종업원 화면 퍼블리싱** — 주문 큐 목록/상세 | 완료 |
| 4단계 | **관리자 화면 퍼블리싱 나머지** — 종업원 계정 관리, 매출 통계 | 완료 |
| 5단계 | 퍼블리싱 마무리 — 반응형 스타일, 화면 간 네비게이션, 모바일 하단 탭바 | 완료 |
| 6단계 | **서버 연동** — 메뉴/인증/주문/결제/종업원/관리자 API 전부 실제 연동, Socket.IO 실시간 알림 | 완료 |
| 7단계 | 전체 플로우 통합 테스트, 빌드 스크립트 정비 | 완료 |
| 8단계 | **확장 기능** — 포장/매장식사 선택, 매장 좌석 현황, 오시는 길(길찾기), QnA 문의, 관리자 대시보드 개편, 아이디 기반 인증 전환, Supabase(PostgreSQL) 연결 | 완료 |
| 9단계 (예정) | 실 PG 결제 연동, 좌석 현황 완전 자동화, 자동화 테스트, 실 서버 배포 — 발표 슬라이드 "개선점" 참고 | 진행 예정 |

## 8. 결정이 필요한 사항 / 결정된 사항

- 카페 이름: **New Lake Coffee**, 브랜드 톤은 로스티드 브라운 + 크림
- 로그인 방식: 이메일이 아니라 **아이디(username)** 기반으로 결정 — 이메일 형식 검증이나 실제 이메일 소유 확인이 필요 없는 학습용 프로젝트 특성상 더 단순한 방식 채택
- DB: 처음엔 로컬 PostgreSQL 미설치로 SQLite로 시작했으나, 이후 **Supabase(관리형 PostgreSQL)로 이전** — Prisma를 쓰고 있어 전환 비용이 낮았음
- 결제는 모의 결제로 진행, 실 PG 연동은 사업자 정보 확보 후 별도 진행
- 매장 좌석 현황은 1차로 관리자가 수동으로 가능/만석 토글하는 방식으로 축소 구현 (원래는 좌석별 실시간 예약 현황을 검토했으나 발표 일정상 스코프 축소) — 자동화는 개선 과제로 남김
- 배포 여부와 시점은 기능 완성 후 별도 논의

## 9. 구현 체크리스트 (TODO)

### 0~7단계
전부 완료. 세부 항목은 git 커밋 로그 참고 (메뉴 관리 → 클라이언트 퍼블리싱 → 서버 연동 → 통합 테스트 순으로 진행).

### 8단계 — 확장 기능
- [x] 홈페이지에 오시는 길(매장 안내) 섹션 + `/visit` 독립 페이지, 네이버 지도/카카오맵 길찾기 링크
- [x] 매장 좌석 현황(가능/만석) `StoreStatus` 모델 + 관리자 토글 + 고객 화면 배지 표시
- [x] 주문 시 매장식사/포장(`OrderType`) 선택 기능
- [x] QnA 문의 시스템 (`Question` 모델, 고객 등록 → 관리자 답변)
- [x] 모바일용 하단 탭바 네비게이션
- [x] 관리자 페이지 전면 개편 (대시보드, 주문관리, QnA, 통계 세밀화)
- [x] 로그인/회원가입/종업원 관리/마이페이지를 이메일 → **아이디(username)** 기반으로 전환, DB 컬럼 rename 마이그레이션
- [x] SQLite → **Supabase(PostgreSQL)** 연결 전환, 마이그레이션 히스토리 재생성, 시드 재실행

### 9단계 — 다음 개선 과제 (발표 슬라이드 "개선점"과 동일)
- [ ] 매장 좌석 현황 완전 자동화 (관리자 수동 토글 → 실시간 자동 감지)
- [ ] 실제 PG(예: 토스페이먼츠) 결제 연동
- [ ] 단위/통합 자동화 테스트 추가
- [ ] Render/Fly.io 등 실 서버 배포 + CI 파이프라인

## 10. 실행 방법

**개발 모드**
```
cd server
npm install
cp .env.example .env
# .env에 Supabase 연결 정보 입력 (Supabase 대시보드 → Connect → ORMs → Prisma)
#   DATABASE_URL: Transaction pooler (포트 6543)
#   DIRECT_URL:   Direct/Session 커넥션 (포트 5432, 마이그레이션 전용)
# JWT_ACCESS_SECRET / JWT_REFRESH_SECRET도 반드시 무작위 값으로 교체
npx prisma migrate dev
npm run prisma:seed    # 샘플 카테고리/메뉴 + 데모 계정 생성
npm run dev
```
브라우저에서 http://localhost:4000 접속 (client 정적 파일 + API를 같은 서버가 함께 서빙).

**데모 계정**
- 관리자: `admin` / `admin1234`
- 종업원: `staff` / `staff1234`
- 고객: `/auth/signup`에서 자유롭게 가입 (아이디 직접 입력)

**프로덕션 빌드**
```
npm run build   # tsc → dist/
npm start       # node dist/server.js
```
`tsc` 빌드는 strict 모드로 타입 에러 없이 통과하도록 유지한다 (`tsx`는 개발 중 타입 체크를 건너뛰므로, 배포 전 반드시 `npm run build`로 한 번 검증할 것).

---

0~8단계(클라이언트 퍼블리싱 + 서버 연동 + 확장 기능 + Supabase 전환)까지 전부 완료했다. 9단계(실 PG 연동, 좌석 현황 자동화, 테스트, 배포)는 별도 논의 후 진행한다.
