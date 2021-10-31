import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from 'src/users/user.entity';
import { ISeeder } from '../seeder.interface';

@Injectable()
export class UsersSeeder implements ISeeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async generateData(subject: string): Promise<User> {
    return bcrypt.hash(subject, 12).then((passwordHash) => {
      return this.userRepository.create({
        uuid: '10c7e0a8-120b-45e0-a37f-be92170bfb8d',
        firstName: subject,
        lastName: 'User',
        passwordHash,
        email: `${subject}@email.com`,
        isEmailConfirmed: true,
      });
    });
  }

  seed(): Promise<any> {
    const userPromises: Promise<User>[] = [];

    const adminPromise = this.generateData('admin');
    userPromises.push(adminPromise);
    return Promise.all(userPromises).then((users) => {
      return this.userRepository
        .save(users)
        .finally(() => console.log('* Seeded users...'));
    });
  }

  drop(): Promise<any> {
    console.log('> Dropping user');
    return this.userRepository.delete({});
  }
}
