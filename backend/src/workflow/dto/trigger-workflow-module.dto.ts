import { IsObject, IsOptional, IsString } from 'class-validator'

export class TriggerWorkflowModuleDto {
  @IsOptional()
  @IsString()
  eventType?: string

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>
}
