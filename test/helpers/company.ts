import { CreateCompanyDTO } from '../../src/dtos';
import { DTOFactory } from '.';
import { faker } from '@faker-js/faker';

export const newCreateCompanyDTO: DTOFactory<CreateCompanyDTO> = (extras) => {
  return {
    email: faker.internet.email(),
    password: faker.random.alphaNumeric(10),
    name: faker.company.name(),
    ...extras,
  };
};