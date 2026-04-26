import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { FlowchartsService } from './flowcharts.service'
import { UpsertFlowchartDto } from './dto/upsert-flowchart.dto'

@Controller('flowcharts')
export class FlowchartsController {
  constructor(private readonly flowchartsService: FlowchartsService) {}

  @Get()
  list() {
    return this.flowchartsService.list()
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.flowchartsService.getById(id)
  }

  @Post()
  upsert(@Body() dto: UpsertFlowchartDto) {
    return this.flowchartsService.upsert(dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flowchartsService.remove(id)
  }
}
