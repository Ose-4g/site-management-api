// import { NextFunction, Request, Response } from 'express';
// import { IUser } from '../../models/UserModel';
// import { role } from '../../utils/types';
// import AppError from '../../errors/AppError';

// export const requiresAdminOrClient = (
//   type: role | role[]
// ): ((req: Request, res: Response, next: NextFunction) => void) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     try {
//       //extract user data gotten from requiresSignIn middleware
//       const user: IUser = req.user || res.locals.user;

//       if (user) {
//         //check if user type matches type/types specified
//         let isUser;
//         if (typeof type === 'string') isUser = user.role === type;
//         else isUser = type.includes(user.role as role);

//         if (!isUser) return next(new AppError('Access denied', 403));
//       }

//       next();
//     } catch (err) {
//       next(err);
//     }
//   };
// };

// export default requiresAdminOrClient;
