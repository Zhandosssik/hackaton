export type EducationIconId =
  | "robot"
  | "history"
  | "puzzle"
  | "chat"
  | "code"
  | "image"
  | "video"
  | "alert"
  | "chain"
  | "shield";

export type ContentCalloutVariant = "important" | "highlight" | "warning" | "note";

export interface ContentParagraph {
  type: "paragraph";
  text: string;
}

export interface ContentCallout {
  type: "callout";
  variant: ContentCalloutVariant;
  title?: string;
  text: string;
}

export interface ContentTable {
  type: "table";
  caption?: string;
  headers: string[];
  rows: string[][];
}

export interface ContentImage {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
}

export type ContentBlock =
  | ContentParagraph
  | ContentCallout
  | ContentTable
  | ContentImage;

export interface EducationSection {
  heading: string;
  blocks: ContentBlock[];
}

export interface LessonVideo {
  title: string;
  description: string;
  durationLabel: string;
  posterSrc: string;
  /** URL для встраивания; если пусто — показывается плейсхолдер */
  embedUrl?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface EducationLesson {
  id: string;
  number: number;
  icon: EducationIconId;
  title: string;
  description: string;
  coverImage: string;
  video: LessonVideo;
  sections: EducationSection[];
  quiz: QuizQuestion[];
}

export interface EducationQuizAnswers {
  [questionId: string]: number;
}
