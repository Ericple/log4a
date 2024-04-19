class HashCodeClass {
  fromString(s: string): number {
    let h: number = 0;
    for (let i = 0; i < s.length; i++)
      h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    return h;
  }
}

export const HashCode = new HashCodeClass();