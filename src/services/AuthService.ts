import { ICompany, IManager, IUser } from '../models';
import { Model } from 'mongoose';
import AppError from '../errors/AppError';
import { generateAccessToken } from '../utils/helpers/token';
import constants from '../utils/constants';
import { inject, injectable } from 'inversify';
import { TYPES } from '../di';
import { INotificationService } from './NotificationService';
import bcrypt from 'bcryptjs';
import { generateCode } from '../utils/helpers/generateCode';
import crypto from 'crypto';
import { selectFieldsObject } from '../utils/helpers/trimUser';
import { BaseService } from './BaseService';
import { StatusCodes } from 'http-status-codes';
import { EntityType } from '../dtos';
import { ISessionService } from './SessionService';

const {} = constants.userRoles;

export interface IAuthService {
  login(
    email: string,
    password: string,
    entity: EntityType
  ): Promise<{ data: Partial<ICompany | IManager>; token: string }>;
  verifyAccount(code: string, email: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(email: string, code: string, password: string): Promise<void>;
  requestEmailVerification(email: string): Promise<void>;
  findEntity(id: string, entity: EntityType): Promise<IManager | ICompany | null>;
}

@injectable()
export class AuthService extends BaseService implements IAuthService {
  constructor(
    @inject(TYPES.User) private User: Model<IUser>,
    @inject(TYPES.Company) private Company: Model<ICompany>,
    @inject(TYPES.Manager) private Manager: Model<IManager>,
    @inject(TYPES.NotificationService) private notificationService: INotificationService,
    @inject(TYPES.SessionService) private sessions: ISessionService
  ) {
    super();
  }

  private async sendVerificationCode(user: IUser) {
    const code = generateCode(4);
    const minutesToExpire = 10;
    user.verifyCode = crypto.createHash('md5').update(code).digest('hex');
    user.verifyCodeExpires = new Date(Date.now() + minutesToExpire * 60 * 1000); //should expire in 1o minutes

    await user.save();
    await this.notificationService.sendMail(
      user.email,
      'Verify your email',
      'Verify your email',
      `
    Hi ${user.name},<br/>
    Use the code below to verify your email<br/>
    <h3>${code}</h3><br/>
    Note that your code will expire after ${minutesToExpire} minutes
    `,
      false
    );
  }

  private async findCompany(id: string): Promise<ICompany> {
    return await this.checkDocumentExists(this.Company, id, 'Company');
  }

  private async findManager(id: string): Promise<ICompany> {
    return await this.checkDocumentExists(this.Manager, id, 'Manager');
  }
  async login(
    email: string,
    password: string,
    entity: EntityType
  ): Promise<{ data: Partial<ICompany | IManager>; token: string }> {
    let record: ICompany | IManager | null;
    if (entity === 'Company') {
      record = await this.Company.findOne({ email });
    } else {
      record = await this.Manager.findOne({ email });
    }

    if (!record) {
      throw new AppError('User does not exist', StatusCodes.NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(password, record.password);
    if (!isMatch) {
      throw new AppError('Invalid Email or Password', StatusCodes.BAD_REQUEST);
    }

    const token = await this.sessions.createToken({
      userType: entity,
      id: record._id.toString(),
    });
    return { data: selectFieldsObject(record, 'email', 'name'), token: token };
  }

  async findEntity(id: string, entity: EntityType): Promise<IManager | ICompany | null> {
    switch (entity) {
      case 'Company':
        return await this.findCompany(id);
      case 'Manager':
        return await this.findManager(id);
      default:
        return null;
    }
  }

  /**
   *
   * @param verifyToken : token sent to user on registration or on request
   * @returns : The user object after the email verification is successful
   */
  async verifyAccount(code: string, email: string): Promise<void> {
    const user = await this.User.findOne({ email });

    if (!user) throw new AppError('User not found', 404);

    if (user.emailVerified) throw new AppError('User is already verified', 403);

    if (!user.verifyCode) throw new AppError('User has no verify token. Please request a reset token', 400);
    if (user.verifyCodeExpires!.getTime() < Date.now()) throw new AppError('provided code is expired', 400);

    const hashedCode = crypto.createHash('md5').update(code).digest('hex');
    if (user.verifyCode !== hashedCode) throw new AppError('code does not match code sent', 400);

    user.verifyCode = undefined;
    user.verifyCodeExpires = undefined;
    user.emailVerified = true;
    await user.save();
  }

  /**
   *
   * @param email : email of the user who forgot password
   * @returns : void. It generates a token and sends to the user.
   */
  async forgotPassword(email: string): Promise<void> {
    //check that user with the said email exists
    const user = await this.User.findOne({ email });
    if (!user) throw new AppError('User not found', 404);

    const code = generateCode(4);
    const minutesToExpire = 10;
    user.passwordResetToken = crypto.createHash('md5').update(code).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + minutesToExpire * 60 * 1000); //should expire in 10 minutes

    await user.save();
    this.notificationService.sendMail(
      user.email,
      'Reset Your password',
      'Reset Your password',
      `
    Hi ${user.name},<br/>
    Use the code below to reset your password<br/>
    <h3>${code}</h3><br/>
    Note that your code will expire after ${minutesToExpire} minutes
    `,
      false
    );
  }

  /**
   *
   * @param password : new password
   * @param code : code send to the user in the previous function
   * @param email: email of the user in question
   * @returns : void, the user function is updated.
   */
  async resetPassword(email: string, code: string, password: string): Promise<void> {
    const user = await this.User.findOne({ email });
    if (!user) throw new AppError('User not found', 404);

    if (!user.passwordResetToken) throw new AppError('User has no reset token. Please request a reset token', 400);
    if (user.passwordResetExpires!.getTime() < Date.now()) throw new AppError('provided code is expired', 400);

    const hashedCode = crypto.createHash('md5').update(code).digest('hex');
    if (user.passwordResetToken !== hashedCode) throw new AppError('code does not match code sent', 400);

    //hash the password and store the user details
    password = await bcrypt.hash(password, 10);
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
  }

  /**
   *
   * @param email : email requesting verification
   * @returns : null. An email is sent showing the details.
   */
  requestEmailVerification = async (email: string): Promise<void> => {
    const user = await this.User.findOne({ email });

    if (!user) throw new AppError('User not found', 404);
    if (user.emailVerified) throw new AppError('User is already verified', 403);
    this.sendVerificationCode(user);
  };
}
