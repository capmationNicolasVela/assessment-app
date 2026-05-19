export type GamePhase = 'lobby' | 'question' | 'reveal' | 'finished';

export type Player = { id: string; name: string; score: number; answered: boolean };
export type Answer = { playerId: string; choice: number; answeredAt: number };

export type GameState = {
  phase: GamePhase;
  pin: string;
  players: Record<string, Player>;
  currentQuestion: number;
  questionStartedAt: number;
  answers: Answer[];
  timeLimit: number; // ms
};

export type KahootScore = { name: string; score: number };

function createState(): GameState {
  return {
    phase: 'lobby',
    pin: Math.floor(100000 + Math.random() * 900000).toString(),
    players: {},
    currentQuestion: 0,
    questionStartedAt: 0,
    answers: [],
    timeLimit: 45000,
  };
}

const g = globalThis as typeof globalThis & {
  __gs?: GameState;
  __kahoot_scores?: KahootScore[];
};
if (!g.__gs) g.__gs = createState();
const S = () => g.__gs!;

export async function getState(): Promise<GameState> {
  return S();
}

export async function addPlayer(id: string, name: string): Promise<boolean> {
  if (S().phase !== 'lobby') return false;
  if (S().players[id]) return true;
  S().players[id] = { id, name, score: 0, answered: false };
  return true;
}

export async function startQuestion(timeLimit: number = 45000): Promise<boolean> {
  if (S().phase !== 'lobby' && S().phase !== 'reveal') return false;
  S().phase = 'question';
  S().questionStartedAt = Date.now();
  S().answers = [];
  S().timeLimit = timeLimit;
  for (const id of Object.keys(S().players)) S().players[id].answered = false;
  return true;
}

export async function submitAnswer(playerId: string, choice: number): Promise<boolean> {
  if (S().phase !== 'question') return false;
  const player = S().players[playerId];
  if (!player || player.answered) return false;
  player.answered = true;
  S().answers.push({ playerId, choice, answeredAt: Date.now() });
  return true;
}

export async function revealAnswers(correctIndex: number): Promise<void> {
  S().phase = 'reveal';
  const TIME_LIMIT = S().timeLimit;
  for (const ans of S().answers) {
    if (ans.choice === correctIndex) {
      const speed = Math.max(0, TIME_LIMIT - (ans.answeredAt - S().questionStartedAt));
      const speedBonus = Math.round((speed / TIME_LIMIT) * 500);
      const player = S().players[ans.playerId];
      if (player) player.score += 1000 + speedBonus;
    }
  }
}

export async function nextQuestion(totalQuestions: number): Promise<void> {
  if (S().currentQuestion + 1 >= totalQuestions) {
    S().phase = 'finished';
    g.__kahoot_scores = Object.values(S().players)
      .map(p => ({ name: p.name, score: p.score }))
      .sort((a, b) => b.score - a.score);
  } else {
    S().currentQuestion += 1;
    await startQuestion(S().timeLimit);
  }
}

export async function resetGame(): Promise<void> {
  g.__gs = createState();
}

export async function getKahootScores(): Promise<KahootScore[]> {
  return g.__kahoot_scores ?? [];
}

export async function getHostState(totalQuestions: number) {
  const players = Object.values(S().players);
  const tally = [0, 0, 0, 0];
  for (const ans of S().answers) tally[ans.choice]++;
  return {
    phase: S().phase,
    pin: S().pin,
    currentQuestion: S().currentQuestion,
    totalQuestions,
    playerCount: players.length,
    answeredCount: S().answers.length,
    tally,
    timeLimit: S().timeLimit,
    leaderboard: players
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(p => ({ name: p.name, score: p.score })),
  };
}

export async function getPlayerState(playerId: string) {
  const player = S().players[playerId];
  return {
    phase: S().phase,
    currentQuestion: S().currentQuestion,
    answered: player?.answered ?? false,
    score: player?.score ?? 0,
    pin: S().pin,
    playerCount: Object.keys(S().players).length,
  };
}
