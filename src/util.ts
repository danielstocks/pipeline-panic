export function getRandomItemFromArray(array: string[]) {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomIntegerBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
