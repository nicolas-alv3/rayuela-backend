import { Project } from '../../project/entities/project';
import { Checkin } from './checkin.entity';
import { Task } from '../../task/entities/task.entity';
import { User } from '../../auth/users/user.entity';

export interface PointsEngine {
  reward(list: Task[], ch: Checkin): number;
}

export interface BadgeEngine {
  newBadgesFor(u: User, ch: Checkin, project: Project): string[]; // Badge's names
}

export interface LeaderboardEngine {
  build(usersList: User[], newPoints: number, u: User): User[];
}

export interface GameStatus {
  newBadges: string[];
  newLeaderboard: User[];
  newPoints: number;
}

export class Game {
  private leaderboardEngine: LeaderboardEngine;
  private project: Project;
  private pointsEngine: PointsEngine;
  private badgeEngine: BadgeEngine;
  private tasks: Task[];
  private users: User[];

  constructor(
    project: Project,
    pointsEngine: PointsEngine,
    badgeEngine: BadgeEngine,
    leaderboardEngine: LeaderboardEngine,
    tasks: Task[],
    users: User[],
  ) {
    this.project = project;
    this.pointsEngine = pointsEngine;
    this.badgeEngine = badgeEngine;
    this.leaderboardEngine = leaderboardEngine;
    this.tasks = tasks;
    this.users = users;
  }

  play(checkin: Checkin): GameStatus {
    const newPoints = this.pointsEngine.reward(this.tasks, checkin);
    return {
      newBadges: this.badgeEngine.newBadgesFor(
        checkin.user,
        checkin,
        this.project,
      ),
      newPoints,
      newLeaderboard: this.leaderboardEngine.build(
        this.users,
        newPoints,
        checkin.user,
      ),
    };
  }
}

export class GameBuilder {
  private leaderboardEngine: LeaderboardEngine | null = null;
  private project: Project | null = null;
  private pointsEngine: PointsEngine | null = null;
  private badgeEngine: BadgeEngine | null = null;
  private tasks: Task[] | null = null;
  private users: User[] | null = null;

  withLeaderboardEngine(leaderboardEngine: LeaderboardEngine): this {
    this.leaderboardEngine = leaderboardEngine;
    return this;
  }

  withProject(project: Project): this {
    this.project = project;
    return this;
  }

  withPointsEngine(pointsEngine: PointsEngine): this {
    this.pointsEngine = pointsEngine;
    return this;
  }

  withBadgeEngine(badgeEngine: BadgeEngine): this {
    this.badgeEngine = badgeEngine;
    return this;
  }

  withTasks(tasks: Task[]): this {
    this.tasks = tasks;
    return this;
  }

  withUsers(users: User[]): this {
    this.users = users;
    return this;
  }

  build(): Game {
    if (
      !this.project ||
      !this.pointsEngine ||
      !this.badgeEngine ||
      !this.leaderboardEngine
    ) {
      throw new Error(
        'All dependencies must be provided before building the Game instance',
      );
    }
    return new Game(
      this.project,
      this.pointsEngine,
      this.badgeEngine,
      this.leaderboardEngine,
      this.tasks,
      this.users,
    );
  }
}
