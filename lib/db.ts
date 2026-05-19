export type Submission = {
  email: string;
  name: string;
  submittedAt: string; // ISO string
  mcAnswers: (number | null)[];
  openAnswers: string[];
  mcScore: number;
  mcTotal: number;
};

const g = globalThis as typeof globalThis & { __subs?: Map<string, Submission> };
if (!g.__subs) g.__subs = new Map();

export async function emailExists(email: string): Promise<boolean> {
  return g.__subs!.has(email.toLowerCase());
}

export async function saveSubmission(data: {
  email: string;
  name: string;
  mcAnswers: (number | null)[];
  openAnswers: string[];
  mcScore: number;
}): Promise<void> {
  const sub: Submission = {
    email: data.email.toLowerCase(),
    name: data.name,
    submittedAt: new Date().toISOString(),
    mcAnswers: data.mcAnswers,
    openAnswers: data.openAnswers,
    mcScore: data.mcScore,
    mcTotal: 6,
  };
  g.__subs!.set(sub.email, sub);
}

export async function getAllSubmissions(): Promise<Submission[]> {
  return Array.from(g.__subs!.values()).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}
