import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskDao } from './persistence/task.dao';
import { Task } from './entities/task.entity';
import { ProjectService } from '../project/project.service';
import { BasicPointsEngine } from '../checkin/entities/engine/basic-points-engine';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskDao: TaskDao,
    private readonly projectService: ProjectService,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const project = await this.projectService.findOne(createTaskDto.projectId);
    if (!project.taskTypes.includes(createTaskDto.type)) {
      throw new BadRequestException('Task type is invalid');
    }
    const area = project.areas.features.find(
      (a) => a.properties.id === createTaskDto.areaId,
    );
    if (!area) {
      throw new BadRequestException('Area not found');
    }
    return await this.taskDao.create(createTaskDto);
  }

  async findRawByProjectId(projectId: string): Promise<any> {
    const project = await this.projectService.findOne(projectId);
    const rawTasks = await this.taskDao.getRawTasksByProject(projectId);
    return rawTasks.map((task) => ({
      ...task['_doc'],
      points: new BasicPointsEngine().calculatePoints(task, project),
    }));
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    return await this.taskDao.getTasksByProject(projectId);
  }

  async findOne(id: string): Promise<Task> {
    const task: Task = await this.taskDao.getTaskById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    return await this.taskDao.updateTask(id, updateTaskDto);
  }

  async remove(id: string) {
    return await this.taskDao.deleteTask(id);
  }

  async bulkSave(projectId: string, createTaskDtoList: CreateTaskDto[]) {
    const count = await this.taskDao.deleteByProjectId(projectId);
    console.log(count + ' tasks deleted');
    return await this.taskDao.bulkSave(createTaskDtoList);
  }

  async setTaskAsSolved(id: string) {
    return await this.taskDao.setTaskAsSolved(id);
  }
}
