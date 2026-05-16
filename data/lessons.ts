import type { LessonSection } from "@/types/lesson";

export const LESSON_SECTIONS: LessonSection[] = [
  {
    id: "text",
    title: "Текст промпт",
    lessons: [
      {
        id: "text-1",
        number: 1,
        title: "Фотосинтез простыми словами",
        description:
          "Попроси AI объяснить что такое фотосинтез простыми словами",
      },
      {
        id: "text-2",
        number: 2,
        title: "Рецепт пасты",
        description:
          "Напиши промпт чтобы получить рецепт пасты с ингредиентами и шагами",
      },
      {
        id: "text-3",
        number: 3,
        title: "Письмо-извинение коллеге",
        description:
          "Попроси написать письмо-извинение коллеге — укажи контекст и тон",
      },
      {
        id: "text-4",
        number: 4,
        title: "План стартапа EdTech",
        description:
          "Создай промпт для составления плана стартапа в сфере EdTech",
      },
      {
        id: "text-5",
        number: 5,
        title: "Роль строгого ментора",
        description:
          "Напиши промпт который заставит AI сыграть роль строгого ментора и проверить твой бизнес-план",
      },
    ],
  },
  {
    id: "photo",
    title: "Фото промпт",
    lessons: [
      {
        id: "photo-1",
        number: 1,
        title: "Закат над морем",
        description: "Опиши простое фото: закат над морем",
      },
      {
        id: "photo-2",
        number: 2,
        title: "Портрет человека",
        description:
          "Попроси сгенерировать портрет человека — укажи возраст, стиль, настроение",
      },
      {
        id: "photo-3",
        number: 3,
        title: "Логотип кофейни",
        description:
          "Создай промпт для логотипа кофейни — стиль, цвета, настроение",
      },
      {
        id: "photo-4",
        number: 4,
        title: "Рекламный баннер",
        description:
          "Напиши промпт для рекламного баннера мобильного приложения",
      },
      {
        id: "photo-5",
        number: 5,
        title: "Обложка журнала",
        description:
          "Создай детальный промпт для обложки журнала — тема, композиция, освещение, стиль",
      },
    ],
  },
  {
    id: "video",
    title: "Видео промпт",
    lessons: [
      {
        id: "video-1",
        number: 1,
        title: "Волны на пляже",
        description: "Опиши короткое видео: волны на пляже, 5 секунд",
      },
      {
        id: "video-2",
        number: 2,
        title: "Анимация логотипа",
        description:
          "Попроси создать анимацию логотипа — движение, цвета, длительность",
      },
      {
        id: "video-3",
        number: 3,
        title: "Реклама кроссовок",
        description:
          "Напиши промпт для рекламного ролика кроссовок 15 секунд",
      },
      {
        id: "video-4",
        number: 4,
        title: "Кинематографичная сцена",
        description:
          "Создай промпт для кинематографичной сцены — локация, камера, освещение, атмосфера",
      },
      {
        id: "video-5",
        number: 5,
        title: "Короткий фильм",
        description:
          "Напиши полный промпт для короткого фильма: сюжет, герои, стиль съёмки, монтаж",
      },
    ],
  },
];

export function findLesson(lessonId: string) {
  for (const section of LESSON_SECTIONS) {
    const lesson = section.lessons.find((l) => l.id === lessonId);
    if (lesson) return { section, lesson };
  }
  return null;
}
