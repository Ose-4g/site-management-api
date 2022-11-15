export const normalizePageLimit = (
  page: string | undefined,
  limit: string | undefined
): { page: number; limit: number } => {
  let _page = parseInt(page as string) || 1; //incase it is NaN
  let _limit = parseInt(limit as string) || 10;

  _page = Math.max(_page, 1); //in case it is a negative number;
  _limit = Math.max(_limit, 1);

  return {
    page: _page,
    limit: _limit,
  };
};
