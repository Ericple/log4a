export function requireNonNull(obj: Object, message: string) {
  if (obj == null) {
    throw new SyntaxError(message);
  }
}