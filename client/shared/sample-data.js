/* ============================================
   샘플 데이터 (2~5단계 클라이언트 퍼블리싱용)
   서버 연동(6단계) 전까지는 이 파일의 데이터로 화면을 채운다.
   ============================================ */

const SAMPLE_CATEGORIES = [
  { id: 1, name: "커피" },
  { id: 2, name: "티" },
  { id: 3, name: "에이드/주스" },
  { id: 4, name: "디저트" },
];

const SAMPLE_MENU_ITEMS = [
  {
    id: 1,
    categoryId: 1,
    name: "아메리카노",
    description: "깊고 진한 에스프레소에 물을 더한 클래식 커피",
    price: 4000,
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600",
    isSoldOut: false,
    isAvailable: true,
    optionGroups: [
      {
        id: 1,
        name: "온도",
        isRequired: true,
        minSelect: 1,
        maxSelect: 1,
        optionChoices: [
          { id: 1, name: "ICE", extraPrice: 0 },
          { id: 2, name: "HOT", extraPrice: 0 },
        ],
      },
      {
        id: 2,
        name: "샷 추가",
        isRequired: false,
        minSelect: 0,
        maxSelect: 3,
        optionChoices: [{ id: 3, name: "샷 1개 추가", extraPrice: 500 }],
      },
    ],
  },
  {
    id: 2,
    categoryId: 1,
    name: "카페라떼",
    description: "부드러운 우유 거품과 에스프레소의 조화",
    price: 4500,
    imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600",
    isSoldOut: false,
    isAvailable: true,
    optionGroups: [
      {
        id: 3,
        name: "온도",
        isRequired: true,
        minSelect: 1,
        maxSelect: 1,
        optionChoices: [
          { id: 4, name: "ICE", extraPrice: 0 },
          { id: 5, name: "HOT", extraPrice: 0 },
        ],
      },
      {
        id: 4,
        name: "사이즈",
        isRequired: false,
        minSelect: 0,
        maxSelect: 1,
        optionChoices: [{ id: 6, name: "Large", extraPrice: 500 }],
      },
    ],
  },
  {
    id: 3,
    categoryId: 1,
    name: "카푸치노",
    description: "풍성한 우유 거품이 매력적인 이탈리안 커피",
    price: 4500,
    imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600",
    isSoldOut: false,
    isAvailable: true,
    optionGroups: [],
  },
  {
    id: 4,
    categoryId: 1,
    name: "바닐라 라떼",
    description: "달콤한 바닐라 시럽이 더해진 라떼",
    price: 5000,
    imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600",
    isSoldOut: false,
    isAvailable: true,
    optionGroups: [],
  },
  {
    id: 5,
    categoryId: 2,
    name: "얼그레이 티",
    description: "베르가못 향이 은은한 홍차",
    price: 4500,
    imageUrl: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600",
    isSoldOut: false,
    isAvailable: true,
    optionGroups: [],
  },
  {
    id: 6,
    categoryId: 2,
    name: "캐모마일 티",
    description: "편안하고 부드러운 허브 티",
    price: 4500,
    imageUrl: "https://images.unsplash.com/photo-1563911892437-1feda0179e1b?w=600",
    isSoldOut: true,
    isAvailable: true,
    optionGroups: [],
  },
  {
    id: 7,
    categoryId: 3,
    name: "자몽 에이드",
    description: "상큼한 자몽과 톡 쏘는 탄산의 조화",
    price: 5500,
    imageUrl: "https://images.unsplash.com/photo-1497534446932-c925b458314a?w=600",
    isSoldOut: false,
    isAvailable: true,
    optionGroups: [],
  },
  {
    id: 8,
    categoryId: 4,
    name: "치즈 케이크",
    description: "진하고 부드러운 뉴욕 스타일 치즈 케이크",
    price: 6000,
    imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600",
    isSoldOut: false,
    isAvailable: true,
    optionGroups: [],
  },
  {
    id: 9,
    categoryId: 4,
    name: "티라미수",
    description: "커피와 마스카포네 크림의 이탈리안 디저트",
    price: 6500,
    imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600",
    isSoldOut: false,
    isAvailable: true,
    optionGroups: [],
  },
];

const SAMPLE_ORDER_STATUS_META = {
  PENDING: { label: "접수 대기", color: "#d9a441" },
  PAID: { label: "결제 완료", color: "#6d8ba1" },
  PREPARING: { label: "제조 중", color: "#c8956d" },
  READY: { label: "픽업 대기", color: "#6b8e5a" },
  COMPLETED: { label: "완료", color: "#8a7a6d" },
  CANCELED: { label: "취소", color: "#c0563f" },
};

const SAMPLE_ORDERS = [
  {
    id: 101,
    createdAt: "2026-07-07T09:12:00",
    status: "PREPARING",
    pickupTime: "2026-07-07T09:30:00",
    totalPrice: 9000,
    items: [
      { menuItemId: 1, name: "아메리카노", quantity: 2, unitPrice: 4000, selectedOptions: ["ICE"] },
      { menuItemId: 8, name: "치즈 케이크", quantity: 1, unitPrice: 6000, selectedOptions: [] },
    ],
  },
  {
    id: 100,
    createdAt: "2026-07-06T14:03:00",
    status: "COMPLETED",
    pickupTime: "2026-07-06T14:20:00",
    totalPrice: 5000,
    items: [{ menuItemId: 4, name: "바닐라 라떼", quantity: 1, unitPrice: 5000, selectedOptions: [] }],
  },
  {
    id: 99,
    createdAt: "2026-07-05T11:47:00",
    status: "CANCELED",
    pickupTime: "2026-07-05T12:00:00",
    totalPrice: 4500,
    items: [{ menuItemId: 2, name: "카페라떼", quantity: 1, unitPrice: 4500, selectedOptions: ["HOT"] }],
  },
];

const SAMPLE_STAFF = [
  { id: 1, name: "이서연", email: "seoyeon@cafeorder.com", role: "STAFF", createdAt: "2026-03-02" },
  { id: 2, name: "박준호", email: "junho@cafeorder.com", role: "STAFF", createdAt: "2026-04-11" },
  { id: 3, name: "김도윤", email: "doyoon@cafeorder.com", role: "ADMIN", createdAt: "2026-01-15" },
];

/* 종업원 목록은 localStorage에 오버레이하여 등록/수정/삭제가 새로고침·페이지 이동에도 유지되게 한다 */
const STAFF_STORAGE_KEY = "cafeorder_admin_staff";

function getStaffList() {
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(SAMPLE_STAFF));
  return SAMPLE_STAFF.map((s) => ({ ...s }));
}

function saveStaffList(list) {
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(list));
}

window.SAMPLE_DATA = {
  CATEGORIES: SAMPLE_CATEGORIES,
  MENU_ITEMS: SAMPLE_MENU_ITEMS,
  ORDER_STATUS_META: SAMPLE_ORDER_STATUS_META,
  ORDERS: SAMPLE_ORDERS,
  STAFF: SAMPLE_STAFF,
};
