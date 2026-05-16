export type SectionId = "text" | "photo" | "video";

export interface Lesson {
  id: string;
  number: number;
  title: string;
  description: string;
}

export interface LessonSection {
  id: SectionId;
  title: string;
  lessons: Lesson[];
}
