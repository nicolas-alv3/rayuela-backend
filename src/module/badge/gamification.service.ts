import { Injectable } from '@nestjs/common';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';
import { GamificationDao } from './persistence/gamification-dao.service';

@Injectable()
export class GamificationService {
  constructor(private readonly badgeDao: GamificationDao) {}

  create(createBadgeDto: CreateBadgeDto) {
    return this.badgeDao.create(createBadgeDto);
  }

  findAllByProjectId(projectId: string) {
    return this.badgeDao.findAllByProject(projectId);
  }

  findOne(id: string) {
    return this.badgeDao.findById(id);
  }

  update(id: string, updateBadgeDto: UpdateBadgeDto) {
    return this.badgeDao.update(id, updateBadgeDto);
  }

  remove(id: string) {
    return this.badgeDao.delete(id);
  }
}