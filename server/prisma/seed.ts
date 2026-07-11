import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** 데모용 STAFF/ADMIN 계정 (회원가입은 고객만 가능하므로 시드로 생성) */
async function seedStaffAccounts() {
  const accounts = [
    { email: "staff@cafeorder.com", password: "staff1234", name: "이서연", role: "STAFF" as const },
    { email: "admin@cafeorder.com", password: "admin1234", name: "김도윤", role: "ADMIN" as const },
  ];

  for (const acc of accounts) {
    const passwordHash = await bcrypt.hash(acc.password, 10);
    await prisma.user.upsert({
      where: { email: acc.email },
      update: {},
      create: { email: acc.email, passwordHash, name: acc.name, role: acc.role },
    });
  }

  console.log("Seeded demo accounts: staff@cafeorder.com / staff1234, admin@cafeorder.com / admin1234");
}

async function main() {
  await seedStaffAccounts();

  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.optionChoice.deleteMany();
  await prisma.optionGroup.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();

  const categories = await Promise.all(
    [
      { name: "커피", sortOrder: 1 },
      { name: "라떼", sortOrder: 2 },
      { name: "티", sortOrder: 3 },
      { name: "에이드", sortOrder: 4 },
      { name: "스무디", sortOrder: 5 },
      { name: "디저트", sortOrder: 6 },
    ].map((c) => prisma.category.create({ data: c }))
  );

  const [coffee, latte, tea, ade, smoothie, dessert] = categories;

  const TEMP_OPTION = {
    name: "온도",
    isRequired: true,
    minSelect: 1,
    maxSelect: 1,
    optionChoices: [
      { name: "ICE", extraPrice: 0 },
      { name: "HOT", extraPrice: 0 },
    ],
  };

  const menuItems = [
    {
      categoryId: coffee.id,
      name: "아메리카노",
      description: "깊고 진한 에스프레소에 물을 더한 클래식 커피",
      price: 4000,
      imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600",
      optionGroups: [
        TEMP_OPTION,
        {
          name: "샷 추가",
          isRequired: false,
          minSelect: 0,
          maxSelect: 3,
          optionChoices: [{ name: "샷 1개 추가", extraPrice: 500 }],
        },
      ],
    },
    {
      categoryId: coffee.id,
      name: "카푸치노",
      description: "풍성한 우유 거품이 매력적인 이탈리안 커피",
      price: 4500,
      imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600",
      optionGroups: [],
    },
    {
      categoryId: coffee.id,
      name: "에스프레소",
      description: "묵직하고 진한 풍미의 샷 한 잔",
      price: 3500,
      imageUrl: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600",
      optionGroups: [],
    },
    {
      categoryId: coffee.id,
      name: "콜드브루",
      description: "저온에서 오래 우려낸 부드럽고 깔끔한 커피",
      price: 4800,
      imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600",
      optionGroups: [],
    },
    {
      categoryId: latte.id,
      name: "카페라떼",
      description: "부드러운 우유 거품과 에스프레소의 조화",
      price: 4500,
      imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600",
      optionGroups: [
        TEMP_OPTION,
        {
          name: "사이즈",
          isRequired: false,
          minSelect: 0,
          maxSelect: 1,
          optionChoices: [{ name: "Large", extraPrice: 500 }],
        },
      ],
    },
    {
      categoryId: latte.id,
      name: "바닐라 라떼",
      description: "달콤한 바닐라 시럽이 더해진 라떼",
      price: 5000,
      imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600",
      optionGroups: [],
    },
    {
      categoryId: latte.id,
      name: "카라멜 마키아토",
      description: "달콤한 카라멜과 부드러운 우유 거품의 조화",
      price: 5300,
      imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600",
      optionGroups: [],
    },
    {
      categoryId: latte.id,
      name: "헤이즐넛 라떼",
      description: "고소한 헤이즐넛 향이 감도는 부드러운 라떼",
      price: 5000,
      imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600",
      optionGroups: [],
    },
    {
      categoryId: tea.id,
      name: "얼그레이 티",
      description: "베르가못 향이 은은한 홍차",
      price: 4500,
      imageUrl: "https://images.unsplash.com/photo-1547825407-2d060104b7f8?w=600",
      optionGroups: [],
    },
    {
      categoryId: tea.id,
      name: "캐모마일 티",
      description: "편안하고 부드러운 허브 티",
      price: 4500,
      imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600",
      isSoldOut: true,
      optionGroups: [],
    },
    {
      categoryId: tea.id,
      name: "페퍼민트 티",
      description: "상쾌한 민트 향이 입안을 개운하게 하는 허브 티",
      price: 4500,
      imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600",
      optionGroups: [],
    },
    {
      categoryId: ade.id,
      name: "자몽 에이드",
      description: "상큼한 자몽과 톡 쏘는 탄산의 조화",
      price: 5500,
      imageUrl: "https://images.unsplash.com/photo-1546173159-315724a31696?w=600",
      optionGroups: [],
    },
    {
      categoryId: ade.id,
      name: "레몬 에이드",
      description: "새콤달콤한 레몬과 시원한 탄산",
      price: 5000,
      imageUrl: "https://images.unsplash.com/photo-1523371054106-bbf80586c38c?w=600",
      optionGroups: [],
    },
    {
      categoryId: ade.id,
      name: "라임 에이드",
      description: "청량한 라임 향이 매력적인 에이드",
      price: 5000,
      imageUrl: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600",
      optionGroups: [],
    },
    {
      categoryId: smoothie.id,
      name: "망고 스무디",
      description: "잘 익은 망고를 갈아 만든 진한 열대과일 스무디",
      price: 5800,
      imageUrl: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600",
      optionGroups: [],
    },
    {
      categoryId: smoothie.id,
      name: "베리 스무디",
      description: "딸기와 블루베리를 듬뿍 넣은 새콤달콤 스무디",
      price: 5800,
      imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600",
      optionGroups: [],
    },
    {
      categoryId: smoothie.id,
      name: "초코 스무디",
      description: "진한 초콜릿과 휘핑크림의 달콤한 스무디",
      price: 5800,
      imageUrl: "https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=600",
      optionGroups: [],
    },
    {
      categoryId: dessert.id,
      name: "치즈 케이크",
      description: "진하고 부드러운 뉴욕 스타일 치즈 케이크",
      price: 6000,
      imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600",
      optionGroups: [],
    },
    {
      categoryId: dessert.id,
      name: "티라미수",
      description: "커피와 마스카포네 크림의 이탈리안 디저트",
      price: 6500,
      imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600",
      optionGroups: [],
    },
    {
      categoryId: dessert.id,
      name: "쿠키",
      description: "알록달록한 스프링클이 콕콕 박힌 촉촉한 쿠키",
      price: 3500,
      imageUrl: "https://images.unsplash.com/photo-1621236378699-8597faf6a176?w=600",
      optionGroups: [],
    },
    {
      categoryId: dessert.id,
      name: "브라우니",
      description: "카라멜을 듬뿍 곁들인 진한 초콜릿 브라우니",
      price: 5000,
      imageUrl: "https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=600",
      optionGroups: [],
    },
  ];

  for (const item of menuItems) {
    const { optionGroups, ...menuItemData } = item;
    await prisma.menuItem.create({
      data: {
        ...menuItemData,
        optionGroups: {
          create: optionGroups.map((g) => ({
            name: g.name,
            isRequired: g.isRequired,
            minSelect: g.minSelect,
            maxSelect: g.maxSelect,
            optionChoices: { create: g.optionChoices },
          })),
        },
      },
    });
  }

  console.log(`Seeded ${categories.length} categories, ${menuItems.length} menu items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
