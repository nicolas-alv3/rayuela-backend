import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectDao } from './persistence/project.dao';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectTemplate } from './persistence/project.schema';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UserService } from '../auth/users/user.service';
import { Project } from './entities/project';

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectDao: ProjectDao,
    private readonly userService: UserService,
  ) {}

  async findAll(): Promise<(ProjectTemplate & { _id: string })[]> {
    return this.projectDao.findAll().then((res) => res.map((p) => p['_doc']));
  }

  async findOne(
    id: string,
    userId?: string,
  ): Promise<Project & { userIsSubscribed?: boolean }> {
    const project = await this.projectDao.findOne(id);
    if (userId) {
      const user = await this.userService.getByUserId(userId);
      return { ...project, userIsSubscribed: user.projects.includes(id) };
    }
    return project;
  }

  async create(createProjectDto: CreateProjectDto): Promise<ProjectTemplate> {
    return this.projectDao.create(createProjectDto);
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectTemplate> {
    return this.projectDao.update(id, updateProjectDto);
  }

  async toggleAvailable(id: string): Promise<void> {
    return this.projectDao.toggleAvailable(id);
  }

  async getTaskCombinations(id: string) {
    const project: ProjectTemplate = await this.projectDao.findOne(id);
    if (!project) {
      throw new NotFoundException('Project not Found');
    }
    const combinations = [];
    project.areas.forEach((area) => {
      project.taskTypes.forEach((type) => {
        project.timeIntervals.forEach((timeInterval) => {
          combinations.push([
            {
              id,
              name: `T${combinations.length + 1}`,
              description: `T${combinations.length + 1}`,
              projectId: id,
              timeInterval,
              area,
              type,
            },
          ]);
        });
      });
    });
    return combinations;
  }
}
