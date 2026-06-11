import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { GlobalFilter } from './common/filters/global.filter';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    //env config
    ConfigModule.forRoot({ isGlobal: true }),
    //jwt config
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
      global: true,
    }),
    //typeorm config
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') == 'development',
        ssl: {
          rejectUnauthorized: configService.get('NODE_ENV') == 'production',
        },
      }),
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: 'APP_PIPE', useClass: ValidationPipe },
    { provide: 'APP_FILTER', useClass: GlobalFilter },
  ],
})
export class AppModule {}
