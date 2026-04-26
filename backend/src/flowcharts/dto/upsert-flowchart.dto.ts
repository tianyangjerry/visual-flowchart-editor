import { IsArray, IsObject, IsOptional, IsString } from 'class-validator'

export class UpsertFlowchartDto {
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
  @IsString()
  status?: 'locked' | 'doing' | 'done'

  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>

  @IsOptional()
  @IsObject()
  diagram?: Record<string, unknown>

  @IsOptional()
  @IsArray()
  nodes?: unknown[]

  @IsOptional()
  @IsArray()
  edges?: unknown[]

  @IsOptional()
  @IsObject()
  viewport?: Record<string, unknown>
}
