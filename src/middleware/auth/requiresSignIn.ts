// import { NextFunction, Request, Response } from 'express';
// import jwt, { JwtPayload } from 'jsonwebtoken';
// import AppError from '../../errors/AppError';
// import env from '../../env.config';
// import { IUser } from '../../models/UserModel';

// /**
//  * Ensures a user is signed in
//  */
// const requiresSignIn = (authService: IAuthService) => {
//   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const authHeader: string = req.headers['authorization'] || '';
//       if (!authHeader) {
//         //continue if participant id is used for auth
//         if (req.body.participantId) return next();

//         return next(new AppError('No token provided', 401));
//       }

//       const token: string = authHeader.replace('Bearer ', '');

//       //verify JWT
//       jwt.verify(token, env.JWT_SECRET, async (err:any, decoded:any) => {
//         if (err) {
//           return next(new AppError('Invalid token provided', 403));
//         }
//         const userId = (decoded)._id.toString();

//         if (!userId) return next(new AppError('Invalid token provided', 403));

//         //save user object in body if user isn't banned/deleted
//         const user = await authService.checkBannedOrDeleted(userId);
//         req.user = user as IUser;
//         res.locals.user = user;

//         next();
//       });
//     } catch (err) {
//       next(err);
//     }
//   };
// };

// // const checkBannedOrDeleted = async (userId: string, next: NextFunction): Promise<void | IUser> => {
// //   try {
// //     const user: IUser = await User.findById(userId).select('+password').lean();

// //     if (!user) return next(new AppError('User not found', 400));

// //     if (user.banned) return next(new AppError('User account is banned', 403));

// //     return user;
// //   } catch (err) {
// //     next(err);
// //   }
// // };

// export default requiresSignIn;
