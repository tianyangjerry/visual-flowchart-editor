import { IsArray, IsObject, IsOptional, IsString } from 'class-validator'

export class UpsertWorkflowDefinitionDto {
  @IsOptional()
  @IsString()
  id?: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsArray()
  nodes?: Array<Record<string, unknown>>

  @IsOptional()
  @IsArray()
  edges?: Array<Record<string, unknown>>

  @IsOptional()
  @IsObject()
  definition?: Record<string, unknown>
}
