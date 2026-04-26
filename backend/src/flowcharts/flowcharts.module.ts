import { Module } from '@nestjs/common'
import { FlowchartsController } from './flowcharts.controller'
import { FlowchartsService } from './flowcharts.service'

@Module({
  controllers: [FlowchartsController],
  providers: [FlowchartsService],
  exports: [FlowchartsService],
})
export class FlowchartsModule {}
