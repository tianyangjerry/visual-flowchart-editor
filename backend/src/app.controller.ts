import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  @Get()
  health() {
    return {
      ok: true,
      service: 'backend-flowchat',
      timestamp: new Date().toISOString(),
    }
  }

  @Get('health')
  healthCheck() {
    return this.health()
  }
}
