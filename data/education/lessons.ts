import type { EducationLesson } from "@/types/education";
import { EDUCATION_QUIZZES } from "@/data/education/quizzes";

const IMG = {
  ai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&q=80",
  history: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=80",
  structure: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=900&q=80",
  chat: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&q=80",
  code: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&q=80",
  imageGen: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=900&q=80",
  video: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=900&q=80",
  mistakes: "https://images.unsplash.com/photo-1633265486064-086b219458ec?w=900&q=80",
  chain: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&q=80",
  security: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=900&q=80",
};

export const EDUCATION_LESSONS: EducationLesson[] = [
  {
    id: "edu-1",
    number: 1,
    icon: "robot",
    title: "Что такое промпт и LLM",
    description: "Базовые понятия: как вы «разговариваете» с нейросетью",
    coverImage: IMG.ai,
    video: {
      title: "Введение в промпты и языковые модели",
      description: "За 4 минуты — что такое промпт, LLM и почему формулировка решает всё.",
      durationLabel: "4 мин",
      posterSrc: IMG.ai,
    },
    sections: [
      {
        heading: "Промпт — инструкция для AI",
        blocks: [
          {
            type: "paragraph",
            text: "Промпт (prompt) — текст, который вы отправляете языковой модели (LLM). От качества промпта зависит, насколько точным и полезным будет ответ.",
          },
          {
            type: "callout",
            variant: "important",
            title: "Запомните",
            text: "LLM не «знает» ваш проект, пока вы не опишете его в промпте. Контекст — ваша ответственность.",
          },
          {
            type: "image",
            src: IMG.ai,
            alt: "Нейросеть и данные",
            caption: "Языковая модель обрабатывает текстовый запрос и генерирует ответ",
          },
          {
            type: "table",
            caption: "Сравнение понятий",
            headers: ["Термин", "Что это"],
            rows: [
              ["Промпт", "Ваш текст-запрос к модели"],
              ["LLM", "Большая языковая модель (ChatGPT, Mistral…)"],
              ["Ответ", "Текст, код или структура по вашему запросу"],
            ],
          },
        ],
      },
      {
        heading: "Как это работает на практике",
        blocks: [
          {
            type: "paragraph",
            text: "Вы не программируете модель напрямую — вы задаёте контекст словами. Чем яснее роль, задача и формат, тем меньше догадок делает AI.",
          },
          {
            type: "callout",
            variant: "highlight",
            text: "Вход: промпт + история диалога. Выход: текст, таблица, план — в зависимости от того, что вы попросили.",
          },
          {
            type: "callout",
            variant: "note",
            text: "В Prompto практические задания проверяются через Mistral API — тот же принцип: чёткий промпт → понятная оценка.",
          },
          {
            type: "callout",
            variant: "warning",
            text: "Не путайте промпт с API-ключом. Ключ — секрет в .env.local; промпт — то, что вы пишете в задании.",
          },
        ],
      },
    ],
    quiz: EDUCATION_QUIZZES["edu-1"],
  },
  {
    id: "edu-2",
    number: 2,
    icon: "history",
    title: "История AI и промптинга",
    description: "От простых ботов до ChatGPT — как мы сюда пришли",
    coverImage: IMG.history,
    video: {
      title: "Хронология: от ELIZA до ChatGPT",
      description: "Ключевые вехи, которые привели к массовому промпт-инжинирингу.",
      durationLabel: "5 мин",
      posterSrc: IMG.history,
    },
    sections: [
      {
        heading: "До нейросетей",
        blocks: [
          {
            type: "paragraph",
            text: "1950-е — идея Тьюринга о машине, способной имитировать мышление. 1960–70-е — ELIZA и другие боты с жёсткими шаблонами ответов.",
          },
          {
            type: "callout",
            variant: "note",
            text: "Ранние системы не «понимали» смысл — они подставляли фразы по правилам.",
          },
        ],
      },
      {
        heading: "Эра нейросетей",
        blocks: [
          {
            type: "paragraph",
            text: "2010-е — прорыв в обработке текста и изображений. Модели учатся на огромных данных и генерируют связные ответы.",
          },
          {
            type: "image",
            src: IMG.history,
            alt: "Технологии и сеть",
            caption: "Рост вычислительной мощности открыл доступ к LLM миллионам людей",
          },
        ],
      },
      {
        heading: "2022 и массовый промптинг",
        blocks: [
          {
            type: "callout",
            variant: "important",
            text: "ChatGPT сделал диалог с LLM доступным без кода. Промпт-инжиниринг стал навыком маркетолога, учителя и разработчика.",
          },
          {
            type: "table",
            caption: "Этапы",
            headers: ["Период", "Характеристика"],
            rows: [
              ["1960–70", "Шаблонные боты"],
              ["2010-е", "Нейросети для текста/картинок"],
              ["2022+", "Массовые чат-LLM и промпты"],
            ],
          },
        ],
      },
      {
        heading: "Почему это важно вам",
        blocks: [
          {
            type: "paragraph",
            text: "Раньше с компьютером в основном говорили программисты. Сейчас интерфейс — естественный язык. Умение формулировать запросы экономит часы.",
          },
          {
            type: "callout",
            variant: "highlight",
            text: "Промптинг — не «магия», а дисциплина: чем больше практики, тем предсказуемее результат.",
          },
        ],
      },
    ],
    quiz: EDUCATION_QUIZZES["edu-2"],
  },
  {
    id: "edu-3",
    number: 3,
    icon: "puzzle",
    title: "Анатомия хорошего промпта",
    description: "Роль, задача, контекст, формат — четыре опоры",
    coverImage: IMG.structure,
    video: {
      title: "Разбор сильного промпта по частям",
      description: "Слабый vs сильный запрос на одном примере.",
      durationLabel: "6 мин",
      posterSrc: IMG.structure,
    },
    sections: [
      {
        heading: "Четыре опоры",
        blocks: [
          {
            type: "table",
            caption: "Структура промпта",
            headers: ["Часть", "Пример", "Зачем"],
            rows: [
              ["Роль", "«Ты учитель биологии…»", "Задаёт тон и экспертизу"],
              ["Задача", "«Объясни фотосинтез…»", "Что сделать"],
              ["Контекст", "«Для 8 класса, без жаргона»", "Аудитория и ограничения"],
              ["Формат", "«5 пунктов, до 120 слов»", "Вид ответа"],
            ],
          },
          {
            type: "callout",
            variant: "important",
            text: "Пропуск любой опоры увеличивает риск «воды» и общих фраз в ответе.",
          },
        ],
      },
      {
        heading: "Слабый и сильный пример",
        blocks: [
          {
            type: "callout",
            variant: "warning",
            title: "Слабо",
            text: "«Расскажи про фотосинтез» — нет аудитории, объёма и формата.",
          },
          {
            type: "callout",
            variant: "highlight",
            title: "Сильно",
            text: "«Ты учитель биологии. Объясни фотосинтез ученику 13 лет простыми словами. Дай определение, 3 этапа и бытовой пример. До 120 слов, на русском.»",
          },
          {
            type: "image",
            src: IMG.structure,
            alt: "Структура и планирование",
            caption: "Структура промпта похожа на план урока",
          },
        ],
      },
      {
        heading: "Чек-лист перед отправкой",
        blocks: [
          {
            type: "paragraph",
            text: "Перед отправкой промпта проверьте: указана ли роль, ясна ли задача, хватает ли контекста, задан ли формат и язык ответа.",
          },
          {
            type: "callout",
            variant: "note",
            text: "Один параметр за раз меняйте при тесте — так видно, что именно улучшило результат.",
          },
        ],
      },
    ],
    quiz: EDUCATION_QUIZZES["edu-3"],
  },
  {
    id: "edu-4",
    number: 4,
    icon: "chat",
    title: "Текстовые AI: кого выбрать",
    description: "ChatGPT, Claude, Mistral, Gemini — сильные стороны",
    coverImage: IMG.chat,
    video: {
      title: "Обзор текстовых моделей",
      description: "Когда какую модель имеет смысл попробовать.",
      durationLabel: "5 мин",
      posterSrc: IMG.chat,
    },
    sections: [
      {
        heading: "Популярные сервисы",
        blocks: [
          {
            type: "table",
            caption: "Сравнение (упрощённо)",
            headers: ["Сервис", "Сильная сторона"],
            rows: [
              ["ChatGPT", "Универсальность, экосистема"],
              ["Claude", "Длинный контекст, тексты"],
              ["Gemini", "Интеграция с Google"],
              ["Mistral", "API, скорость, EU"],
            ],
          },
        ],
      },
      {
        heading: "Как выбирать под задачу",
        blocks: [
          {
            type: "paragraph",
            text: "Черновики и идеи — быстрая модель. Длинные документы — большое окно контекста. Код — см. урок про разработку.",
          },
          {
            type: "callout",
            variant: "highlight",
            text: "Prompto проверяет ваши промпты через Mistral — удобно тренироваться на том же типе API.",
          },
        ],
      },
      {
        heading: "Лимиты и тарифы",
        blocks: [
          {
            type: "callout",
            variant: "note",
            text: "Для учёбы часто хватает бесплатных или стартовых тарифов. Следите за лимитом запросов в минуту.",
          },
          {
            type: "image",
            src: IMG.chat,
            alt: "Чат с AI",
            caption: "Один промпт может вести себя по-разному в разных сервисах",
          },
        ],
      },
      {
        heading: "Практический совет",
        blocks: [
          {
            type: "callout",
            variant: "warning",
            text: "Не публикуйте API-ключи в чатах и репозиториях. Ключ Mistral — только в .env.local.",
          },
          {
            type: "callout",
            variant: "important",
            text: "Тестируйте один и тот же промпт в 2 моделях — так вы учитесь подстраивать формулировки.",
          },
        ],
      },
    ],
    quiz: EDUCATION_QUIZZES["edu-4"],
  },
  {
    id: "edu-5",
    number: 5,
    icon: "code",
    title: "Промпты для кода",
    description: "Copilot, Cursor, ChatGPT — как просить код правильно",
    coverImage: IMG.code,
    video: {
      title: "Промпт для разработчика",
      description: "Язык, фреймворк, ошибка — что писать в запросе.",
      durationLabel: "7 мин",
      posterSrc: IMG.code,
    },
    sections: [
      {
        heading: "Минимум в кодовом промпте",
        blocks: [
          {
            type: "callout",
            variant: "important",
            text: "Укажите язык (TypeScript, Python…), фреймворк (Next.js, React…), что должна делать функция и ограничения (без any, без лишних зависимостей).",
          },
          {
            type: "table",
            caption: "Шаблоны запросов",
            headers: ["Цель", "Фраза в промпте"],
            rows: [
              ["Новая функция", "«Напиши функцию на TS: вход string, выход number»"],
              ["Исправление", "«Исправь ошибку: [текст ошибки]»"],
              ["Обучение", "«Объясни этот код построчно для новичка»"],
            ],
          },
        ],
      },
      {
        heading: "Инструменты",
        blocks: [
          {
            type: "paragraph",
            text: "GitHub Copilot — подсказки в редакторе. Cursor — IDE с AI и контекстом всего проекта. ChatGPT/Claude — прототипы и ревью.",
          },
          {
            type: "image",
            src: IMG.code,
            alt: "Код на экране",
            caption: "Контекст файлов сильно влияет на качество подсказок",
          },
        ],
      },
      {
        heading: "Ошибки новичков",
        blocks: [
          {
            type: "callout",
            variant: "warning",
            text: "«Сделай весь проект» одним сообщением — почти всегда плохая идея. Дробите на файлы и шаги.",
          },
          {
            type: "callout",
            variant: "note",
            text: "Всегда читайте сгенерированный код и запускайте тесты — AI может ошибаться в деталях API.",
          },
        ],
      },
    ],
    quiz: EDUCATION_QUIZZES["edu-5"],
  },
  {
    id: "edu-6",
    number: 6,
    icon: "image",
    title: "Промпты для изображений",
    description: "DALL·E, Midjourney, Stable Diffusion",
    coverImage: IMG.imageGen,
    video: {
      title: "Как описывать картинку словами",
      description: "Субъект, стиль, свет и негативный промпт.",
      durationLabel: "5 мин",
      posterSrc: IMG.imageGen,
    },
    sections: [
      {
        heading: "Структура image-промпта",
        blocks: [
          {
            type: "paragraph",
            text: "Опишите объект, стиль, освещение, ракурс и цвета. Английские теги часто дают стабильнее результат, но многие сервисы понимают русский.",
          },
          {
            type: "table",
            caption: "Элементы описания",
            headers: ["Элемент", "Пример"],
            rows: [
              ["Субъект", "портрет женщины 30 лет, деловой стиль"],
              ["Стиль", "cinematic, soft light, 85mm"],
              ["Негатив", "без текста на картинке, без лишних пальцев"],
            ],
          },
        ],
      },
      {
        heading: "Сервисы",
        blocks: [
          {
            type: "callout",
            variant: "highlight",
            text: "DALL·E — OpenAI/ChatGPT. Midjourney — художественные стили. Stable Diffusion — открытые модели, гибкая настройка.",
          },
          {
            type: "image",
            src: IMG.imageGen,
            alt: "Генерация изображений",
            caption: "Детальность промпта = предсказуемость кадра",
          },
        ],
      },
      {
        heading: "Негативный промпт",
        blocks: [
          {
            type: "callout",
            variant: "important",
            text: "Негативный промпт перечисляет, чего НЕ должно быть: лишние объекты, артефакты, текст на изображении.",
          },
        ],
      },
      {
        heading: "Связь с тренировкой Prompto",
        blocks: [
          {
            type: "callout",
            variant: "note",
            text: "В разделе «Тренировка» есть блок «Фото промпт» — отрабатывайте описание визуала так же, как текст.",
          },
          {
            type: "callout",
            variant: "warning",
            text: "Не генерируйте изображения реальных людей без согласия и не нарушайте правила платформы.",
          },
        ],
      },
    ],
    quiz: EDUCATION_QUIZZES["edu-6"],
  },
  {
    id: "edu-7",
    number: 7,
    icon: "video",
    title: "Промпты для видео и аудио",
    description: "Runway, Sora, ElevenLabs — движение и голос",
    coverImage: IMG.video,
    video: {
      title: "Короткие сцены для видео-моделей",
      description: "Длительность, камера, действие — минимальный набор.",
      durationLabel: "4 мин",
      posterSrc: IMG.video,
    },
    sections: [
      {
        heading: "Видео-промпты",
        blocks: [
          {
            type: "paragraph",
            text: "Укажите длительность, движение камеры, действие и атмосферу. Видео-модели пока капризнее текста — одна сцена за запрос.",
          },
          {
            type: "callout",
            variant: "important",
            text: "Пример: «5 секунд, волны на пляже, закат, камера статична».",
          },
          {
            type: "image",
            src: IMG.video,
            alt: "Видеопродакшн",
            caption: "Короткие конкретные сцены работают лучше длинных сценариев",
          },
        ],
      },
      {
        heading: "Аудио и голос",
        blocks: [
          {
            type: "paragraph",
            text: "Для озвучки укажите язык, темп, эмоцию и пол голоса. ElevenLabs и аналоги умеют клонировать голос — только с разрешением человека.",
          },
          {
            type: "callout",
            variant: "warning",
            text: "Клонирование голоса без согласия — этически и юридически недопустимо.",
          },
        ],
      },
      {
        heading: "Сервисы",
        blocks: [
          {
            type: "table",
            caption: "Направления",
            headers: ["Тип", "Примеры"],
            rows: [
              ["Видео", "Runway, Sora, Pika"],
              ["Голос", "ElevenLabs, озвучка в API"],
            ],
          },
        ],
      },
    ],
    quiz: EDUCATION_QUIZZES["edu-7"],
  },
  {
    id: "edu-8",
    number: 8,
    icon: "alert",
    title: "Типичные ошибки",
    description: "Размытые запросы, перегруз, отсутствие примеров",
    coverImage: IMG.mistakes,
    video: {
      title: "10 ошибок в промптах",
      description: "Как распознать и исправить слабый запрос.",
      durationLabel: "6 мин",
      posterSrc: IMG.mistakes,
    },
    sections: [
      {
        heading: "Чего избегать",
        blocks: [
          {
            type: "callout",
            variant: "warning",
            text: "Слишком коротко: «напиши пост» — AI не знает тему, аудиторию, тон.",
          },
          {
            type: "callout",
            variant: "warning",
            text: "Противоречия: «коротко» и «минимум 2000 слов» в одном промпте.",
          },
          {
            type: "table",
            caption: "Ошибка → решение",
            headers: ["Ошибка", "Исправление"],
            rows: [
              ["Нет цели", "Добавить «зачем» ответ"],
              ["Нет формата", "Список, таблица, объём"],
              ["Нет фактчека", "Проверка у эксперта"],
            ],
          },
        ],
      },
      {
        heading: "Few-shot",
        blocks: [
          {
            type: "callout",
            variant: "highlight",
            text: "Few-shot — вставить в промпт 1–2 примера желаемого ответа. Модель копирует стиль.",
          },
        ],
      },
      {
        heading: "Как исправлять",
        blocks: [
          {
            type: "paragraph",
            text: "Разбейте задачу на шаги. Попросите AI задать уточняющие вопросы, если данных мало. Первый ответ считайте черновиком.",
          },
          {
            type: "image",
            src: IMG.mistakes,
            alt: "Анализ и исправление",
            caption: "Итерация — нормальная часть работы с AI",
          },
        ],
      },
      {
        heading: "Критические темы",
        blocks: [
          {
            type: "callout",
            variant: "important",
            text: "Медицина, право, финансы — всегда проверяйте у специалиста. AI может галлюцинировать факты.",
          },
        ],
      },
    ],
    quiz: EDUCATION_QUIZZES["edu-8"],
  },
  {
    id: "edu-9",
    number: 9,
    icon: "chain",
    title: "Chain-of-thought и итерации",
    description: "Просите думать по шагам и улучшайте промпт",
    coverImage: IMG.chain,
    video: {
      title: "CoT и диалог с моделью",
      description: "Пошаговое рассуждение и уточняющие промпты.",
      durationLabel: "5 мин",
      posterSrc: IMG.chain,
    },
    sections: [
      {
        heading: "Chain-of-thought (CoT)",
        blocks: [
          {
            type: "paragraph",
            text: "Фразы «рассуждай по шагам», «сначала план, потом ответ» помогают в математике, логике и стратегии.",
          },
          {
            type: "callout",
            variant: "highlight",
            text: "CoT снижает ошибки, когда задача многошаговая.",
          },
        ],
      },
      {
        heading: "Итерации",
        blocks: [
          {
            type: "paragraph",
            text: "«Сократи на 30%», «добавь пример для Казахстана», «перепиши дружелюбнее» — нормальные вторые и третьи сообщения.",
          },
          {
            type: "callout",
            variant: "important",
            text: "Сохраняйте удачные промпты в заметках — строите личную библиотеку.",
          },
        ],
      },
      {
        heading: "Эксперименты",
        blocks: [
          {
            type: "callout",
            variant: "note",
            text: "Меняйте один параметр за раз: то тон, то длина, то аудитория — так видно эффект.",
          },
          {
            type: "image",
            src: IMG.chain,
            alt: "Цепочка шагов",
            caption: "Диалог с AI — цепочка уточнений",
          },
        ],
      },
    ],
    quiz: EDUCATION_QUIZZES["edu-9"],
  },
  {
    id: "edu-10",
    number: 10,
    icon: "shield",
    title: "Этика и безопасность",
    description: "Конфиденциальность, bias, ответственное использование",
    coverImage: IMG.security,
    video: {
      title: "Безопасная работа с AI",
      description: "Ключи, данные, предвзятость и ответственность.",
      durationLabel: "5 мин",
      posterSrc: IMG.security,
    },
    sections: [
      {
        heading: "Данные и ключи",
        blocks: [
          {
            type: "callout",
            variant: "warning",
            text: "Не вставляйте в публичные чаты пароли, API-ключи и персональные данные клиентов.",
          },
          {
            type: "callout",
            variant: "important",
            text: "MISTRAL_API_KEY и JWT_SECRET — только в .env.local, файл в .gitignore.",
          },
        ],
      },
      {
        heading: "Предвзятость и факты",
        blocks: [
          {
            type: "paragraph",
            text: "Модели могут воспроизводить стереотипы и выдумывать факты. Проверяйте важное и задавайте нейтральный тон в промпте.",
          },
          {
            type: "image",
            src: IMG.security,
            alt: "Безопасность данных",
            caption: "Ответственность за использование AI — на человеке",
          },
        ],
      },
      {
        heading: "Правила использования",
        blocks: [
          {
            type: "table",
            caption: "Можно / нельзя",
            headers: ["Можно", "Нельзя"],
            rows: [
              ["Учёба и черновики", "Спам и обман"],
              ["Проверка фактов", "Публикация чужих секретов"],
              ["Указание источников", "Нарушение авторских прав"],
            ],
          },
        ],
      },
      {
        heading: "Итог курса",
        blocks: [
          {
            type: "callout",
            variant: "highlight",
            text: "Вы прошли 10 уроков теории. Закрепите навык в разделе «Тренировка» — AI оценит ваши промпты.",
          },
          {
            type: "callout",
            variant: "note",
            text: "Продолжайте вести стрик и собирать достижения в профиле после регистрации.",
          },
        ],
      },
    ],
    quiz: EDUCATION_QUIZZES["edu-10"],
  },
];

export function findEducationLesson(lessonId: string): EducationLesson | undefined {
  return EDUCATION_LESSONS.find((lesson) => lesson.id === lessonId);
}
