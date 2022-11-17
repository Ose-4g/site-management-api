export function selectFieldsObject<T>(object: T, ...fields: (keyof T)[]): Partial<T> {
  const newObj: Partial<T> = {};

  for (const field of fields) {
    if (object[field] !== null && object[field] !== undefined) {
      newObj[field] = object[field];
    }
  }
  return newObj;
}

export function selectFieldsArray<T>(array: T[], ...fields: (keyof T)[]): Partial<T>[] {
  const newArray: Partial<T>[] = [];

  for (const val of array) {
    newArray.push(selectFieldsObject(val, ...fields));
  }

  return newArray;
}

export function omitFieldsObject<T>(object: T, ...fields: (keyof T)[]): Partial<T> {
  const newObj: Partial<T> = JSON.parse(JSON.stringify(object));

  for (const field of fields) {
    if (newObj[field] !== null && newObj[field] !== undefined) {
      delete newObj[field];
    }
  }
  return newObj;
}

export function omitFieldsArray<T>(array: T[], ...fields: (keyof T)[]): Partial<T>[] {
  const newArray: Partial<T>[] = [];

  for (const val of array) {
    newArray.push(omitFieldsObject(val, ...fields));
  }

  return newArray;
}
