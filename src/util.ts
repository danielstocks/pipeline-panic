export function getRandomItemFromArray<T>(array: T[]) {
  let random = array[Math.floor(Math.random() * array.length)];
  if (random === undefined) {
    throw Error("Could not get random item from array " + array);
  }
  return random;
}

export function getRandomIntegerBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function intersect<T extends string | number>(a: T[], b: T[]): T[] {
  const setA = new Set(a);
  return b.filter((value) => setA.has(value));
}

export function diff<T extends string | number>(a: T[], b: T[]): T[] {
  const setA = new Set(a);
  return b.filter((value) => !setA.has(value));
}
