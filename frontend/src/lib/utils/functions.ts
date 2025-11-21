// Various helper functions used throughout the project
export function firstLetter(str: string): string {
  return str.charAt(0).toUpperCase();
}

export function setOrDelete(obj: any, key: string | number, value: any) {
  if (value === undefined) {
    delete obj[key];
  } else {
    obj[key] = value;
  }
}
