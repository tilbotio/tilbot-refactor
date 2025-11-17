export function setOrDelete(obj: any, key: string | number, value: any) {
  if (value === undefined) {
    delete obj[key];
  } else {
    obj[key] = value;
  }
}
