import { IUser } from './models/userModel';
import { Multer } from 'express';
import { IRootMember } from './models/RootMemberModel';
import { IProjectMember } from './models/ProjectMemberModel';

//allows me to user req.user in the requests handlers.

declare global {
  namespace Express {
    export interface Request {
      user: IUser;
      projectRole: string;
      rootRole: string;
      rootMember: IRootMember;
      projectMember: IProjectMember;
    }
  }
}
