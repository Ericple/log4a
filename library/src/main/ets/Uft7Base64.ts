/*
 * Copyright (c) 2017 emailJS
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 *
 * in the Software without restriction, including without limitation the rights
 *
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Base64 encoding code from [base64-js]{@link https://github.com/beatgammit/base64-js}, released under MIT license.
 * Base64 decoding code from MDN docs, released under MIT license.
 */

export const OUTPUT_STRING = 'OUTPUT_STRING'

export const OUTPUT_TYPED_ARRAY = 'OUTPUT_TYPED_ARRAY'

const LOOKUP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('')

const MAX_CHUNK_LENGTH = 16383 // must be multiple of 3

const tripletToBase64 = num => LOOKUP[num >> 18 & 0x3F] + LOOKUP[num >> 12 & 0x3F] + LOOKUP[num >> 6 & 0x3F] + LOOKUP[num & 0x3F]

export class Uft7Base64 {
    public static decode(base64Str) {
        let iOut = 0
        const arr = new Uint8Array(Math.ceil(base64Str.length * 3 / 4))

        for (let i = 0, len = base64Str.length, validBits = 0, bitsSoFar = 0; i < len; i++) {
            let bits
            const c = base64Str.charCodeAt(i)
            if (c >= 0x41 && c <= 0x5a) { // [A-Z]
                bits = c - 0x41
            } else if (c >= 0x61 && c <= 0x7a) { // [a-z]
                bits = c - 0x61 + 0x1a
            } else if (c >= 0x30 && c <= 0x39) { // [0-9]
                bits = c - 0x30 + 0x34
            } else if (c === 0x2b) { // +
                bits = 0x3e
            } else if (c === 0x2f) { // /
                bits = 0x3f
            } else if (c === 0x3d) { // =
                validBits = 0
                continue
            } else {
                continue
            }
            bitsSoFar = (bitsSoFar << 6) | bits
            validBits += 6
            if (validBits >= 8) {
                validBits -= 8
                arr[iOut++] = bitsSoFar >> validBits
                if (validBits === 2) {
                    bitsSoFar &= 0x03
                } else if (validBits === 4) {
                    bitsSoFar &= 0x0f
                }
            }
        }
        return (iOut < arr.length) ? arr.subarray(0, iOut) : arr
    }


    public static encode(data) {
        const len = data.length
        const extraBytes = len % 3
        let output = ''

        for (let i = 0, len2 = len - extraBytes; i < len2; i += MAX_CHUNK_LENGTH) {
            output += this.encodeChunk(data, i, (i + MAX_CHUNK_LENGTH) > len2 ? len2 : (i + MAX_CHUNK_LENGTH))
        }

        if (extraBytes === 1) {
            const tmp = data[len - 1]
            output += LOOKUP[tmp >> 2]
            output += LOOKUP[(tmp << 4) & 0x3F]
            output += '=='
        } else if (extraBytes === 2) {
            const tmp = (data[len - 2] << 8) + (data[len - 1])
            output += LOOKUP[tmp >> 10]
            output += LOOKUP[(tmp >> 4) & 0x3F]
            output += LOOKUP[(tmp << 2) & 0x3F]
            output += '='
        }

        return output
    }

    public static encodeChunk(uint8, start, end) {
        let output = ''
        for (let i = start; i < end; i += 3) {
            output += tripletToBase64((uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]))
        }
        return output
    }
}