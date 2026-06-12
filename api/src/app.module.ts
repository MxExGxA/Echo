import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { GlobalFilter } from './common/filters/global.filter';
import { AuthModule } from './auth/auth.module';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { AuthGuard } from '@nestjs/passport';
import { AppGuard } from './common/guards/app.guard';

@Module({
  imports: [
    //env config
    ConfigModule.forRoot({ isGlobal: true }),
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
    JwtStrategy,
    { provide: 'APP_GUARD', useClass: AppGuard },
  ],
})
export class AppModule {}
