import { CreateSiteDTO } from '../../src/dtos';
import { DTOFactory } from '.';
import { IManager } from '../../src/models';
import { faker } from '@faker-js/faker';

export const newManagerDTO: DTOFactory<IManager> = (extras) => {
  return {
    name: faker.name.firstName(),
    email: faker.internet.email().toLowerCase(),
    company: faker.database.mongodbObjectId(),
    password: faker.random.alphaNumeric(10),
    ...extras,
  } as IManager;
};

export const newCreateSiteDTO: DTOFactory<CreateSiteDTO> = (extras) => {
  return {
    name: faker.company.name(),
    location: faker.address.streetAddress(),
    description: faker.word.adjective(),
    ...extras,
  };
};
