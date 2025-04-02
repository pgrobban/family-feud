import type { GameEventMap } from '@/shared/gameEventMap';
import type { Answer, FaceOffGame, FamilyWarmUpGame, FastMoneyGame, GameInProgress, GameState, TeamAndPoints } from '@/shared/types';
import { EventEmitter } from 'node:events';

export default class Game {
  private gameState: GameState | null = null;
  private gameEvents: EventEmitter<GameEventMap> = new EventEmitter<GameEventMap>();
  private playerSocketIds: string[] = [];
  private hostSocketIds: string[] = [];

  constructor() {
    this.gameState = null;
    this.gameEvents = new EventEmitter<GameEventMap>();
  }

  private get state(): GameState {
    if (!this.gameState) {
      throw new Error("Game state is not initialized");
    }
    return this.gameState;
  }

  createGame(teamNames: string[], socketId: string) {
    this.gameState = {
      id: crypto.randomUUID(),
      teamsAndPoints: teamNames.map((teamName) => ({ teamName, points: 0 })),
      status: 'waiting_for_host',
    };
    this.playerSocketIds.push(socketId);
    this.gameEvents.emit('gameCreated', this.state);
  }

  joinHost(socketId: string) {
    if (!this.gameState) {
      throw new Error('Game not created yet');
    }
    this.hostSocketIds.push(socketId);
    this.gameState = { ...this.gameState, status: 'in_progress', mode: 'indeterminate' };
    this.gameEvents.emit('hostJoined', this.state);
  }

  hostPickedMode<T extends Exclude<GameInProgress['mode'], 'indeterminate'>>(mode: T) {
    if (!this.validateGameStatus('indeterminate', 'waiting_for_host')) {
      return;
    }

    let modeProps: Omit<GameInProgress, 'status'>;

    switch (mode) {
      case 'family_warm_up':
        modeProps = { mode, modeStatus: 'waiting_for_question', question: null, answers: [], currentTeam: 0 } as FamilyWarmUpGame;
        break;
      case 'face_off':
        modeProps = { mode, modeStatus: 'waiting_for_question', question: null, answers: [], currentTeam: 0 } as FaceOffGame;
        break;
      case 'fast_money':
        modeProps = { mode, modeStatus: 'waiting_for_questions', questions: [], answersTeam1: [], answersTeam2: [], currentTeam: 0 } as FastMoneyGame;
        break;
    }

    this.updateGameState({ ...modeProps, status: 'in_progress' });
    this.gameEvents.emit('modePicked', this.state);
  }

  hostPickedQuestion(question: string, answers: Pick<Answer, 'answerText' | 'points'>[]) {
    if (!this.validateGameStatus('family_warm_up', 'waiting_for_question')) {
      return;
    }

    this.updateGameState({
      question,
      modeStatus: 'question_in_progress',
      answers: answers.map((answer) => ({ ...answer, revealed: false })),
    });

    this.gameEvents.emit('questionPicked', this.state);
  }

  revealAnswersFamilyWarmup() {
    if (!this.validateGameStatus('family_warm_up', 'question_in_progress')) {
      return;
    }

    this.updateGameState({
      answers: (this.state as FamilyWarmUpGame).answers.map((answer) => ({ ...answer, revealed: true })),
      modeStatus: 'revealing_answers',
    });

    this.gameEvents.emit('answersRevealed', this.state);
  }

  gatherTeamAnswersFamilyWarmup(team1Answers: string[], team2Answers: string[]) {
    if (!this.validateGameStatus('family_warm_up', 'revealing_answers')) {
      return;
    }

    this.updateGameState({
      team1Answers,
      team2Answers,
    });

    this.gameEvents.emit('teamAnswersGathered', this.state);
  }

  awardPointsFamilyWarmup() {
    if (!this.validateGameStatus('family_warm_up', 'gathering_team_answers')) {
      return;
    }

    const gameState = this.gameState as GameState & FamilyWarmUpGame;

    if (!gameState.team1Answers || !gameState.team2Answers) {
      throw new Error(`Team answers are missing. Team 1: ${gameState.team1Answers}, Team 2: ${gameState.team2Answers}`);
    }

    const calculatePoints = (teamAnswers: string[]) =>
      teamAnswers.reduce((total, answerText) => {
        const foundAnswer = gameState.answers.find((a) => a.answerText === answerText);
        return total + (foundAnswer ? foundAnswer.points : 0);
      }, 0);

    const newTeamsAndPoints: TeamAndPoints[] = gameState.teamsAndPoints.map((team, index) => ({
      ...team,
      points: team.points + calculatePoints(index === 0 ? gameState.team1Answers! : gameState.team2Answers!),
    }));

    this.updateGameState({
      teamsAndPoints: newTeamsAndPoints,
      modeStatus: 'awarding_points',
    });

    this.gameEvents.emit('pointsAwarded', this.state);
  }

  private validateGameStatus(expectedMode: GameInProgress['mode'], expectedStatus: string): boolean {
    if (!this.gameState || this.gameState.status !== 'in_progress') {
      throw new Error(`Game not in progress, got: ${this.gameState?.status}`);
    }

    if (!('mode' in this.gameState) || this.gameState.mode !== expectedMode) {
      throw new Error(`Wrong game mode, expected ${expectedMode}, got: ${this.gameState.mode}`);
    }

    if (!('modeStatus' in this.gameState) || this.gameState.modeStatus !== expectedStatus) {
      throw new Error(`Game mode not in expected state (${expectedStatus}), got: ${this.gameState.modeStatus}`);
    }

    return true;
  }

  private updateGameState(updates: Partial<GameState>) {
    if (!this.gameState) return;
    this.gameState = { ...this.gameState, ...updates } as GameState;
  }
}