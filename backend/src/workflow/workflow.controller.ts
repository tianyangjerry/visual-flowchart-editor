import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { TriggerWorkflowModuleDto } from './dto/trigger-workflow-module.dto'
import { UpsertWorkflowDefinitionDto } from './dto/upsert-workflow-definition.dto'
import { WorkflowService } from './workflow.service'

@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get('definitions')
  listDefinitions() {
    return this.workflowService.listDefinitions()
  }

  @Get('definitions/:id')
  getDefinition(@Param('id') id: string) {
    return this.workflowService.getDefinition(id)
  }

  @Post('definitions')
  upsertDefinition(@Body() dto: UpsertWorkflowDefinitionDto) {
    return this.workflowService.upsertDefinition(dto)
  }

  @Get(':workflowId/runtime')
  getRuntime(@Param('workflowId') workflowId: string) {
    return this.workflowService.getRuntime(workflowId)
  }

  @Delete('definitions/:id')
  removeDefinition(@Param('id') id: string) {
    return this.workflowService.removeDefinition(id)
  }

  @Post(':workflowId/module/:moduleCode/trigger')
  triggerModule(
    @Param('workflowId') workflowId: string,
    @Param('moduleCode') moduleCode: string,
    @Body() dto: TriggerWorkflowModuleDto,
  ) {
    return this.workflowService.triggerModule(workflowId, moduleCode, dto)
  }
}
