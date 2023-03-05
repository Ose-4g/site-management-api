import { LoginDTO, entityTypes } from '../../src/dtos';

import { DTOFactory } from '.';
import { faker } from '@faker-js/faker';

export const newLoginDTO: DTOFactory<LoginDTO> = (extras) => {
  return {
    userType: faker.helpers.arrayElement(entityTypes),
    email: faker.internet.email().toLowerCase(),
    password: faker.random.alphaNumeric(10),
    ...extras,
  };
};
