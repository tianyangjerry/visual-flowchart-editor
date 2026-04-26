import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  async onModuleInit() {
    try {
      await this.$connect()
    } catch (error) {
      this.logger.error('Failed to connect Prisma client', error as Error)
      throw error
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
