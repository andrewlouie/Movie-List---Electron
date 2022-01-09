/* eslint-disable import/prefer-default-export */
/* eslint-disable import/group-exports */
export interface Movie {
  title: string;
  mdate: Date;
}

export enum SORT_ORDERS {
  DATE_ASC,
  DATE_DESC,
  TITLE_ASC,
  TITLE_DESC,
}
