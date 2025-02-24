import { Injectable } from '@nestjs/common';
import { UserDao } from './user.dao';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userDao: UserDao) {}

  async findByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<User | null> {
    return this.userDao.findByEmailOrUsername(email, username);
  }

  async create(userData: User): Promise<User> {
    return this.userDao.create(userData);
  }

  async update(id: string, userData: User): Promise<User> {
    return this.userDao.update(id, userData);
  }

  async getByUserId(userId: string): Promise<User | null> {
    return await this.userDao.getUserById(userId);
  }

  async findAllByProjectId(projectId: string): Promise<User[]> {
    return await this.userDao.getAllByProjectId(projectId);
  }

  async saveResetToken(id: string, resetToken: string) {
    const u = await this.getByUserId(id);
    u.resetToken = resetToken;
    await this.userDao.update(id, u);
  }
}
