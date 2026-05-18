// In-memory store — persists for the lifetime of the server process.
// Wiped on each redeploy. Perfect for a single workshop session.

export type Submission = {
  email: string;
  name: string;
  submittedAt: Date;
  mcAnswers: (number | null)[];
  openAnswers: string[];
  mcScore: number;
  mcTotal: number;
};

const store = new Map<string, Submission>();

export async function emailExists(email: string): Promise<boolean> {
  return store.has(email.toLowerCase());
}

export async function saveSubmission(data: {
  email: string;
  name: string;
  mcAnswers: (number | null)[];
  openAnswers: string[];
  mcScore: number;
}): Promise<void> {
  store.set(data.email.toLowerCase(), {
    email: data.email.toLowerCase(),
    name: data.name,
    submittedAt: new Date(),
    mcAnswers: data.mcAnswers,
    openAnswers: data.openAnswers,
    mcScore: data.mcScore,
    mcTotal: 6,
  });
}

export async function getAllSubmissions(): Promise<Submission[]> {
  return Array.from(store.values()).sort(
    (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()
  );
}
