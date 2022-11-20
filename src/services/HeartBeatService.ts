import { ICompany, IDevice, IManager, ISite } from '../models';
import { Model } from 'mongoose';
import AppError from '../errors/AppError';
import { inject, injectable } from 'inversify';
import { TYPES } from '../di';
import { INotificationService } from './NotificationService';
import bcrypt from 'bcryptjs';
import { CreateCompanyDTO, InviteManagerDTO, Message } from '../dtos';
import { StatusCodes } from 'http-status-codes';
import { BaseService } from './BaseService';
import { IHeartBeat } from '../models/HeartBeat';

export interface IHearbeatService {
  createRecord(message: Message): Promise<IHeartBeat<any>>;
}

@injectable()
export class CompanyService extends BaseService implements IHearbeatService {
  constructor(
    @inject(TYPES.Site) private Site: Model<ISite>,
    @inject(TYPES.Device) private Device: Model<IDevice<any>>,
    @inject(TYPES.Hear) private Manager: Model<IManager>,
    @inject(TYPES.NotificationService) private notificationService: INotificationService
  ) {
    super();
  }

  private async checkCompany(id: string): Promise<ICompany> {
    return this.checkDocumentExists(this.Company, id, 'Company');
  }
  // private async sendVerificationCode(user: IUser) {
  //   const code = generateCode(4);
  //   const minutesToExpire = 10;
  //   user.verifyCode = crypto.createHash('md5').update(code).digest('hex');
  //   user.verifyCodeExpires = new Date(Date.now() + minutesToExpire * 60 * 1000); //should expire in 1o minutes

  //   await user.save();
  //   await this.notificationService.sendMail(
  //     user.email,
  //     'Verify your email',
  //     'Verify your email',
  //     `
  //   Hi ${user.name},<br/>
  //   Use the code below to verify your email<br/>
  //   <h3>${code}</h3><br/>
  //   Note that your code will expire after ${minutesToExpire} minutes
  //   `,
  //     false
  //   );
  // }

  async crateCompany(dto: CreateCompanyDTO): Promise<ICompany> {
    const prevCompany = await this.Company.findOne({ email: dto.email });
    if (prevCompany) {
      throw new AppError(`Email ${dto.email} is already registered`, StatusCodes.BAD_REQUEST);
    }

    //hash the password and store the user details
    const password = await bcrypt.hash(dto.password, 10);

    return await this.Company.create({
      ...dto,
      password,
    });
  }

  async inviteManager(companyId: string, manager: InviteManagerDTO): Promise<void> {
    const company = await this.checkCompany(companyId);
    const password = await generateReference().substring(0, 7);
    const hashedPassword = await bcrypt.hash(password, 10);

    // check if manager has been sent invite
    const foundManager = await this.Manager.findOne({ email: manager.email });

    if (!foundManager) {
      // create new manager
      await this.Manager.create({
        name: manager.name,
        email: manager.email,
        company: companyId,
        password: hashedPassword,
      });
    }

    await this.notificationService.sendMail(
      manager.email,
      'Invite to Company',
      'Invite to Company',
      `
      <p>Hi ${manager.name},</p>
      <p>You've been invited to the company ${company.name} to manage their sites.</p>
      <p>Log in using these details</p>
      <br/>
      <b>Email:</b>${manager.email}<br/>
      <b>Password:</b>${password}<br/><br/>
      <p>Please ensure change your password on login</p>
      `,
      false
    );
  }
}
