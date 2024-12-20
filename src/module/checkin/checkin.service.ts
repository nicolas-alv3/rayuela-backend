import { Injectable } from '@nestjs/common';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';
import { CheckInDao } from './persistence/checkin.dao';
import { TaskService } from '../task/task.service';
import { Task } from '../task/entities/task.entity';
import { Checkin } from './entities/checkin.entity';
import { UserService } from '../auth/users/user.service';
import { Move } from './entities/move.entity';

@Injectable()
export class CheckinService {
  constructor(
    private readonly checkInDao: CheckInDao,
    private readonly taskService: TaskService,
    private readonly userService: UserService,
  ) {}

  async create(createCheckinDto: CreateCheckinDto) {
    const tasks: Task[] = await this.taskService.findByProjectId(
      createCheckinDto.projectId,
    );
    const user = await this.userService.getByUserId(createCheckinDto.userId);
    const checkin = Checkin.fromDTO(createCheckinDto);
    const move = new Move(user, checkin, tasks);
    console.log(move);
    return this.checkInDao.create(checkin);
  }

  async findAll() {
    return this.checkInDao.findAll();
  }

  async findOne(id: string) {
    return this.checkInDao.findOne(id);
  }

  async update(id: string, updateCheckinDto: UpdateCheckinDto) {
    return this.checkInDao.update(id, updateCheckinDto);
  }

  async remove(id: string) {
    return this.checkInDao.remove(id);
  }

  findByProjectId(projectId: string) {
    return this.checkInDao.findByProjectId(projectId);
  }
}
