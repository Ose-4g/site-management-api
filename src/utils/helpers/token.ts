import { EntityType } from '../../dtos';
import jwt from 'jsonwebtoken';

const { JWT_SECRET, JWT_EXPIRES } = process.env;

//generates jwt access token from user Id.
const generateAccessToken = (id: string, entity: EntityType): string => {
  return jwt.sign({ id, entity }, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES,
  });
};

export { generateAccessToken };
