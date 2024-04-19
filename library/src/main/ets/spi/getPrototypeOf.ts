export function getPrototypeOf(target: any) {
  return Object.getPrototypeOf(target);
}

export function propDeco(target: any, propertyKey: string) {
  const pd = Object.getOwnPropertyDescriptor(target, propertyKey);
  console.log('pd:', pd)
  Object.defineProperty(target, propertyKey, pd);
  console.log(target[propertyKey])
}