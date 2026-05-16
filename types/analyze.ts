export interface AnalyzeRequestBody {
  userPrompt: string;
  taskDescription: string;
}

export interface AnalyzeResult {
  score: number;
  isCorrect: boolean;
  feedback: string;
  hint: string;
  correctPrompt: string;
}
