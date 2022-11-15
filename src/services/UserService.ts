import { IUser } from '../models';
import { PaginatedResult } from '../utils/types';
import validator from 'validator';
import AppError from '../errors/AppError';
import { FilterQuery } from 'mongoose';
import constants from '../utils/constants';
import { deleteSingleFileFromS3 } from '../utils/aws';
import { inject, injectable } from 'inversify';
import { Model } from 'mongoose';
import { TYPES } from '../di';
import { trimUser } from '../utils/helpers/trimUser';
import { mongoosePaginate } from '../utils/helpers';

const { ADMIN, USER, SUPER_ADMIN } = constants.userRoles;
export interface IUserService {
  fetchUserProfile(userId: string): Promise<Partial<IUser>>;
  updateProfileImage(imageUrl: string, targetUserId: string, loggedInUser: IUser): Promise<void>;
  updateUserProfile(userId: string, phoneNumber?: string): Promise<void>;
  getAllUsers(
    page: number,
    limit: number,
    options?: { search?: string; role?: string }
  ): Promise<PaginatedResult<Partial<IUser>>>;
  banUserLogic(userId: string, ban: boolean, banReason?: string, banExpires?: Date): Promise<void>;
  deleteAccount(userId: string): Promise<void>;
}

@injectable()
class UserService implements IUserService {
  constructor(@inject(TYPES.User) private User: Model<IUser>) {}

  /**
   * Inner function to validate that a userId is valid
   * @param userId : user id
   * @returns : The found user if there's no error.
   */
  private async verifyUser(userId: string): Promise<IUser> {
    if (!validator.isMongoId(userId as string)) throw new AppError('invalid id provided', 400);
    const user = await this.User.findById(userId);

    if (!user) throw new AppError('user not found', 404);
    return user;
  }

  /**
   * Fetches information avout a user
   * @param userId : id of the user
   * @returns : The profile of the user/
   */
  async fetchUserProfile(userId: string): Promise<Partial<IUser>> {
    const user = await this.verifyUser(userId as string);
    return trimUser(user);
  }

  /**
   * Updates profile image of the user.
   * Either the owner of the account or an admin can update the profile image.
   * @param imageUrl : new image url
   * @param targetUserId : the userId of account we want to update the profile picture
   * @param loggedInUser : The id of hte user or admin that's logged in.
   */
  async updateProfileImage(imageUrl: string, targetUserId: string, loggedInUser: IUser): Promise<void> {
    const validUser = loggedInUser._id.toString() === targetUserId || loggedInUser.role === ADMIN;
    if (!validUser) throw new AppError('You are unauthorized to access this route', 403);
    const user = await this.verifyUser(targetUserId);
    deleteSingleFileFromS3(user.avatar);
    user.avatar = imageUrl;
    await user.save();
  }

  async banUserLogic(userId: string, ban: boolean, banReason?: string, banExpires?: Date): Promise<void> {
    const user = await this.verifyUser(userId);
    if (user.role === ADMIN) throw new AppError('cannot ban admin', 403);
    user.banned = ban;
    user.banExpires = ban ? banExpires : undefined;
    user.banReason = ban ? banReason : undefined;
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.verifyUser(userId);
    await this.User.findByIdAndDelete(userId);
  }

  async updateUserProfile(userId: string, phoneNumber?: string): Promise<void> {
    const user = await this.verifyUser(userId);
    user.phoneNumber = phoneNumber || user.phoneNumber;
    await user.save();
  }
  async getAllUsers(
    page: number,
    limit: number,
    options?: { search?: string; role?: string }
  ): Promise<PaginatedResult<Partial<IUser>>> {
    let filter: FilterQuery<IUser> = {};
    if (options) {
      const { role, search } = options;
      if (role) {
        filter.role = role;
      }
      if (search) {
        let regexp = new RegExp(`.*${search}.*`);
        filter.name = { $regex: regexp };
        filter.username = { $regex: regexp };
      }
    }

    const result = await mongoosePaginate(this.User, filter, page, limit);
    return result;
  }
}

export default UserService;
