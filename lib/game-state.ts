export type GamePhase = 'lobby' | 'question' | 'reveal' | 'finished';

export type Player = {
  id: string;
  name: string;
  score: number;
  answered: boolean;
};

export type Answer = {
  playerId: string;
  choice: number; // 0-3
  answeredAt: number; // Date.now()
};

export type GameState = {
  phase: GamePhase;
  pin: string;
  players: Map<string, Player>;
  currentQuestion: number;
  questionStartedAt: number;
  answers: Answer[];
};

function createState(): GameState {
  return {
    phase: 'lobby',
    pin: Math.floor(100000 + Math.random() * 900000).toString(),
    players: new Map(),
    currentQuestion: 0,
    questionStartedAt: 0,
    answers: [],
  };
}

// globalThis pattern — safe across Next.js hot reloads in dev
const g = globalThis as typeof globalThis & { __gs?: GameState };
if (!g.__gs) g.__gs = createState();
const S = g.__gs;

export function getState(): GameState {
  return S;
}

export function addPlayer(id: string, name: string): boolean {
  if (S.phase !== 'lobby') return false;
  if (S.players.has(id)) return true;
  S.players.set(id, { id, name, score: 0, answered: false });
  return true;
}

export function startQuestion(): boolean {
  if (S.phase !== 'lobby' && S.phase !== 'reveal') return false;
  S.phase = 'question';
  S.questionStartedAt = Date.now();
  S.answers = [];
  for (const p of S.players.values()) p.answered = false;
  return true;
}

export function submitAnswer(playerId: string, choice: number): boolean {
  if (S.phase !== 'question') return false;
  const player = S.players.get(playerId);
  if (!player || player.answered) return false;
  player.answered = true;
  S.answers.push({ playerId, choice, answeredAt: Date.now() });
  return true;
}

export function revealAnswers(correctIndex: number): void {
  S.phase = 'reveal';
  const elapsed = Date.now() - S.questionStartedAt;
  const TIME_LIMIT = 20000;
  for (const ans of S.answers) {
    if (ans.choice === correctIndex) {
      const speed = Math.max(0, TIME_LIMIT - (ans.answeredAt - S.questionStartedAt));
      const speedBonus = Math.round((speed / TIME_LIMIT) * 500);
      const player = S.players.get(ans.playerId);
      if (player) player.score += 1000 + speedBonus;
    }
  }
}

export function nextQuestion(totalQuestions: number): void {
  if (S.currentQuestion + 1 >= totalQuestions) {
    S.phase = 'finished';
  } else {
    S.currentQuestion += 1;
    startQuestion();
  }
}

export function resetGame(): void {
  const fresh = createState();
  Object.assign(S, fresh);
  S.players = fresh.players;
  S.answers = fresh.answers;
}

export function getHostState(totalQuestions: number) {
  const players = Array.from(S.players.values());
  const tally = [0, 0, 0, 0];
  for (const ans of S.answers) tally[ans.choice]++;
  return {
    phase: S.phase,
    pin: S.pin,
    currentQuestion: S.currentQuestion,
    totalQuestions,
    playerCount: players.length,
    answeredCount: S.answers.length,
    tally,
    leaderboard: players
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(p => ({ name: p.name, score: p.score })),
  };
}

export function getPlayerState(playerId: string) {
  const player = S.players.get(playerId);
  return {
    phase: S.phase,
    currentQuestion: S.currentQuestion,
    answered: player?.answered ?? false,
    score: player?.score ?? 0,
    pin: S.pin,
    playerCount: S.players.size,
  };
}
