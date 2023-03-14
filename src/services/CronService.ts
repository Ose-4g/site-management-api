import { cronGroup, cronJob } from '@ose4g/cron-manager';

import { injectable } from 'inversify';

@injectable()
@cronGroup()
export class CronService {
  constructor() {}

  //run every day
  @cronJob('*/4 * * * * *')
  async testJob() {
    console.log('I am running every 4 seconds');
  }
}
