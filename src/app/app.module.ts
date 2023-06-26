import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleAsyncOptions, MongooseModuleOptions } from '@nestjs/mongoose';
import { LoggerMiddleware } from 'src/config/middlewares/logger.middleware';
import { UserModule } from './user/user.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AppGuard } from 'src/config/guard/auth.guard';
import { HttpModule, HttpService } from '@nestjs/axios';
import { TenantModule } from './tenant/tenant.module';
import { ConfigController } from './config/config.controller';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `./env/.env`,
    }),
    {
      ...HttpModule.register({}),
      global: true,
    },
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<MongooseModuleOptions> => {
        return ({
          uri: `mongodb://${configService.get('MONGO_INITDB_HOST')}:${configService.get('MONGO_INITDB_PORT')}`,
          dbName: configService.get('MONGO_INITDB_DATABASE'),
          auth: {
            username: configService.get('MONGO_INITDB_ROOT_USERNAME'),
            password: configService.get('MONGO_INITDB_ROOT_PASSWORD')
          }
        })
      },
    }),
    TenantModule,
    AppConfigModule
  ],
  providers: [
    {
      useClass: AppGuard,
      provide: APP_GUARD,
    },
  ],
  controllers: [AppController]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      LoggerMiddleware
    ).forRoutes({
      path: "",
      method: RequestMethod.ALL
    });
  }
}
