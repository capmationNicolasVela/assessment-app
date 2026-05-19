import { QUESTIONS, type Question } from './questions';
import { KAHOOT_QUESTIONS, type KahootQuestion } from './kahoot-questions';

type QuestionStore = {
  assessment: Question[];
  kahoot: KahootQuestion[];
};

const g = globalThis as typeof globalThis & { __qs?: QuestionStore };
if (!g.__qs) {
  g.__qs = {
    assessment: [...QUESTIONS],
    kahoot: [...KAHOOT_QUESTIONS],
  };
}

export async function getAssessmentQuestions(): Promise<Question[]> {
  return g.__qs!.assessment;
}

export async function getKahootQuestionsStore(): Promise<KahootQuestion[]> {
  return g.__qs!.kahoot;
}

export async function saveAssessmentQuestions(qs: Question[]): Promise<void> {
  g.__qs!.assessment = qs;
}

export async function saveKahootQuestions(qs: KahootQuestion[]): Promise<void> {
  g.__qs!.kahoot = qs;
}
