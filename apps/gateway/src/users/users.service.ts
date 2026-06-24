import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async upsertAuthUser(input: {
    clerkUserId: string;
    email: string;
    name: string;
  }) {
    const now = new Date();
    return await this.userModel.findOneAndUpdate(
      { clerkUserId: input.clerkUserId },
      {
        $set: {
          email: input.email,
          name: input.name,
          lastSeenAt: now,
        },
        $setOnInsert: {
          role: 'user',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}
