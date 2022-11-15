import { IUser } from '../../models';

export const trimUser = (user: IUser): Partial<IUser> => {
  const { _id, name, avatar, email, role, emailVerified, userVerified, phoneNumber } = user;
  return {
    _id,
    name,
    avatar,
    email,
    role,
    userVerified,
    emailVerified,
    phoneNumber,
  };
};
