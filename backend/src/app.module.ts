// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingModule } from './meeting/meeting.module';
import { Meeting } from './entities/meeting.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('MYSQL_HOST', 'localhost'),
        port: configService.get('MYSQL_PORT', 3306),
        username: configService.get('MYSQL_USER', 'root'),
        password: configService.get('MYSQL_PASSWORD', ''),
        database: configService.get('MYSQL_DATABASE', 'telemedicine'),
        entities: [Meeting],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    MeetingModule,
  ],
})
export class AppModule {}