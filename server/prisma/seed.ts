import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.optionChoice.deleteMany();
  await prisma.optionGroup.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();

  const categories = await Promise.all(
    [
      { name: "커피", sortOrder: 1 },
      { name: "티", sortOrder: 2 },
      { name: "에이드/주스", sortOrder: 3 },
      { name: "디저트", sortOrder: 4 },
    ].map((c) => prisma.category.create({ data: c }))
  );

  const [coffee, tea, ade, dessert] = categories;

  const menuItems = [
    {
      categoryId: coffee.id,
      name: "아메리카노",
      description: "깊고 진한 에스프레소에 물을 더한 클래식 커피",
      price: 4000,
      imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600",
      optionGroups: [
        {
          name: "온도",
          isRequired: true,
          minSelect: 1,
          maxSelect: 1,
          optionChoices: [
            { name: "ICE", extraPrice: 0 },
            { name: "HOT", extraPrice: 0 },
          ],
        },
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
      name: "카페라떼",
      description: "부드러운 우유 거품과 에스프레소의 조화",
      price: 4500,
      imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600",
      optionGroups: [
        {
          name: "온도",
          isRequired: true,
          minSelect: 1,
          maxSelect: 1,
          optionChoices: [
            { name: "ICE", extraPrice: 0 },
            { name: "HOT", extraPrice: 0 },
          ],
        },
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
      categoryId: coffee.id,
      name: "카푸치노",
      description: "풍성한 우유 거품이 매력적인 이탈리안 커피",
      price: 4500,
      imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600",
      optionGroups: [],
    },
    {
      categoryId: coffee.id,
      name: "바닐라 라떼",
      description: "달콤한 바닐라 시럽이 더해진 라떼",
      price: 5000,
      imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600",
      optionGroups: [],
    },
    {
      categoryId: tea.id,
      name: "얼그레이 티",
      description: "베르가못 향이 은은한 홍차",
      price: 4500,
      imageUrl: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600",
      optionGroups: [],
    },
    {
      categoryId: tea.id,
      name: "캐모마일 티",
      description: "편안하고 부드러운 허브 티",
      price: 4500,
      imageUrl: "https://images.unsplash.com/photo-1563911892437-1feda0179e1b?w=600",
      isSoldOut: true,
      optionGroups: [],
    },
    {
      categoryId: ade.id,
      name: "자몽 에이드",
      description: "상큼한 자몽과 톡 쏘는 탄산의 조화",
      price: 5500,
      imageUrl: "https://images.unsplash.com/photo-1497534446932-c925b458314a?w=600",
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
