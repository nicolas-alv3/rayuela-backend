import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = TaskSchemaTemplate & Document;

@Schema()
export class TaskSchemaTemplate {
  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ ref: 'Area', required: true })
  timeIntervalId: Types.ObjectId;

  @Prop({ ref: 'Area', required: true })
  areaId: Types.ObjectId;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true, default: false })
  solved: boolean;

  static collectionName() {
    return 'Task';
  }
}

export const TaskSchema = SchemaFactory.createForClass(TaskSchemaTemplate);
