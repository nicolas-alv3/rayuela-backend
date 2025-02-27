import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GameProfile } from './user.entity';

export type UserDocument = UserTemplate & Document;

export enum UserRole {
  Admin = 'Admin',
  Volunteer = 'Volunteer',
}

@Schema()
export class UserTemplate {
  @Prop({ required: true })
  complete_name: string; // Nombre completo del usuario

  @Prop({ required: true, unique: true })
  username: string; // Nombre de usuario único

  @Prop({ required: true, unique: true })
  email: string; // Email único

  @Prop({ default: '' })
  resetToken: string; // reset token

  @Prop({ required: true })
  password: string; // Contraseña (hash)

  @Prop({ default: null })
  profile_image: string; // Imagen de perfil (puede ser una URL)

  @Prop({ default: false })
  verified: boolean; // Indica si el usuario ha verificado su cuenta

  @Prop({ enum: UserRole, default: UserRole.Volunteer })
  role: UserRole; // Rol del usuario (Admin o Volunteer)

  @Prop({ type: Array, default: [] })
  gameProfiles: GameProfile[];

  @Prop({ type: Array, default: [] })
  contributions: string[]; // tasks id

  static collectionName() {
    return 'Users';
  }
}

export const UserSchema = SchemaFactory.createForClass(UserTemplate);
