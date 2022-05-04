export const removeSpaces = (word: string): string => {
  //removes all spaces in the string
  let ans = '';

  for (const i of word) {
    if (i !== ' ') ans += i;
  }

  return ans;
};
