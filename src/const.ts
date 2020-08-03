export enum CardValues {
  jack = "jack",
  queen = "queen",
  king = "king",
  ace = "ace",
  two = "2",
  three = "3",
  four = "4",
  five = "5",
  six = "6",
  seven = "7",
  eight = "8",
  nine = "9",
  ten = "10",
}

export type BaseValueType = {
  [key in CardValues]: number
}

export const DEFAULT_BASE_VALUE: BaseValueType = {
  jack: 2,
  queen: 3,
  king: 4,
  ace: 11,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
}

export const scoreForWin: number = 21
