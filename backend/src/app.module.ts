import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { PrismaModule } from './prisma/prisma.module'
import { WorkflowModule } from './workflow/workflow.module'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, WorkflowModule],
  controllers: [AppController],
})
export class AppModule {}
