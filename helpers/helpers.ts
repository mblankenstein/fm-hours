export const uniqueByKey = <T>(array: T[], key: string): T[] => [
  // @ts-ignore
  ...new Map(array.map((item) => [item[key], item])).values(),
];

export const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// Remove accents from strings
export const normalizeText = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036F]/g, "");

// Return if a target string is or isn't a match for a seach (query) value
export const queryOnString = (target: string, query: string) =>
  normalizeText(target)
    .toUpperCase()
    .includes(normalizeText(query).toUpperCase());
