import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserDao {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmailOrUsername(email: string, username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ $or: [{ email }, { username }] }).exec();
  }

  async create(userData: any): Promise<UserDocument> {
    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  async getUserById(userId: string) {
    return this.userModel.findById(userId).exec();
  }

  async save(userId: string, user: any) {
    return this.userModel.findByIdAndUpdate(userId, user)
  }
}