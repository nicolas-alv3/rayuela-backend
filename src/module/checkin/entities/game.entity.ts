import { Project } from '../../project/entities/project';
import { Checkin } from './checkin.entity';
import { Task } from '../../task/entities/task.entity';
import { User } from '../../auth/users/user.entity';
import { BadgeRule } from '../../gamification/entities/gamification.entity';
import { BasicPointsEngine } from './engine/basic-points-engine';
import { BasicBadgeEngine } from './engine/basic-badge-engine';
import { BasicLeaderbardEngine } from './engine/basic-leaderboard-engine';
import { ElasticPointsEngine } from './engine/elastic-points-engine';

interface Engine {
  assignableTo(project: Project): boolean;
}

export interface PointsEngine extends Engine {
  reward(ch: Checkin, game: Game): number;
}

export interface BadgeEngine extends Engine {
  newBadgesFor(u: User, ch: Checkin, project: Project): BadgeRule[]; // Badge's names
}

export interface LeaderboardUser {
  _id: string;
  username: string;
  completeName: string;
  points: number;
  badges: string[];
}

export interface LeaderboardEngine extends Engine {
  build(usersList: User[], u: User, project: Project): LeaderboardUser[];
}

export interface GameStatus {
  newBadges: BadgeRule[];
  newLeaderboard: LeaderboardUser[];
  newPoints: number;
}

export class Game {
  get users(): User[] {
    return this._users;
  }

  get project(): Project {
    return this._project;
  }

  private leaderboardEngine: LeaderboardEngine;
  private _project: Project;
  private pointsEngine: PointsEngine;
  private badgeEngine: BadgeEngine;
  private tasks: Task[];
  private _users: User[];

  constructor(
    project: Project,
    pointsEngine: PointsEngine,
    badgeEngine: BadgeEngine,
    leaderboardEngine: LeaderboardEngine,
    tasks: Task[],
    users: User[],
  ) {
    this._project = project;
    this.pointsEngine = pointsEngine;
    this.badgeEngine = badgeEngine;
    this.leaderboardEngine = leaderboardEngine;
    this.tasks = tasks;
    this._users = users;
  }

  play(checkin: Checkin): GameStatus {
    const newPoints = this.pointsEngine.reward(checkin, this);
    checkin.user.addPointsFromProject(newPoints, this._project.id);
    return {
      newBadges: this.badgeEngine.newBadgesFor(
        checkin.user,
        checkin,
        this._project,
      ),
      newPoints,
      newLeaderboard: this.leaderboardEngine.build(
        this._users,
        checkin.user,
        this._project,
      ),
    };
  }
}

export class GameBuilder {
  private project: Project | null = null;
  private tasks: Task[] | null = null;
  private users: User[] | null = null;

  private availablePointsEngine: PointsEngine[] = [
    new BasicPointsEngine(),
    new ElasticPointsEngine(),
  ];

  private availableBadgeEngine: BadgeEngine[] = [new BasicBadgeEngine()];
  private availableLeaderboardEngine: LeaderboardEngine[] = [
    new BasicLeaderbardEngine(),
  ];

  withProject(project: Project): this {
    this.project = project;
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
    const pointsEngine = this.assignPointsEngine(this.project);
    const leaderboardEngine = this.assignLeaderboardEngine();
    const badgeEngine = this.assignBadgeEngine();
    if (!this.project || !pointsEngine || !badgeEngine || !leaderboardEngine) {
      throw new Error(
        'All dependencies must be provided before building the Game instance',
      );
    }
    return new Game(
      this.project,
      pointsEngine,
      badgeEngine,
      leaderboardEngine,
      this.tasks,
      this.users,
    );
  }

  assignPointsEngine(project: Project): PointsEngine {
    return (
      this.availablePointsEngine.find((pe) => pe.assignableTo(project)) ||
      this.availablePointsEngine[0]
    );
  }

  private assignBadgeEngine(): BadgeEngine {
    return (
      this.availableBadgeEngine.find((be) => be.assignableTo(this.project)) ||
      this.availableBadgeEngine[0]
    );
  }

  private assignLeaderboardEngine(): LeaderboardEngine {
    return (
      this.availableLeaderboardEngine.find((le) =>
        le.assignableTo(this.project),
      ) || this.availableLeaderboardEngine[0]
    );
  }
}
