/*
 * Copyright (c) 2010-2011 Konstantin Käfer
 *
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 *
 * of this software and associated documentation files (the "Software"), to deal
 *
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 *
 * furnished to do so, subject to the following conditions:
 *
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Fork licensed under MIT by Andris Reinman
 */

import { Uft7Base64 } from './Uft7Base64'

function encodeToUTF7(str) {
    const b = new Uint8Array(str.length * 2)
    for (let i = 0, bi = 0, len = str.length; i < len; i++) {
        const c = str.charCodeAt(i)
        b[bi++] = c >> 8
        b[bi++] = c & 0xFF
    }
    return Uft7Base64.encode(b).replace(/=+$/, '')
}

function decodeFromUTF7(str) {
    const octets = Uft7Base64.decode(str)
    let output = ''

    for (let i = 0, len = octets.length; i < len; ) {
        output += String.fromCharCode(octets[i++] << 8 | octets[i++])
    }
    return output
}

function escapeReservedRegexStrings(chars) {
    return chars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

/**
 * Character classes defined by RFC 2152.
 */
const setD = 'A-Za-z0-9' + escapeReservedRegexStrings('\'(),-./:?')
const setO = escapeReservedRegexStrings('!"#$%&*;<=>@[]^_\'{|}')
const setW = escapeReservedRegexStrings(' \r\n\t')

/**
 * Encodes string to UTF-7, see RFC 2152
 * @param {String} str String to encode
 * @param {String} mask (optional) Characters to encode, defaults to RFC 2152 Set D
 */
export const encode = (str, mask = '') =>
str.replace(new RegExp('[^' + setD + escapeReservedRegexStrings(mask) + ']+', 'g'), chunk => '+' + (chunk === '+' ? '' : encodeToUTF7(chunk)) + '-')

/**
 * Encodes string to UTF-7 with all optionals, see RFC 2152
 * @param {String} str String to encode
 */
export const encodeAll = str =>
str.replace(new RegExp('[^' + setW + setD + setO + ']+', 'g'), chunk => '+' + (chunk === '+' ? '' : encodeToUTF7(chunk)) + '-')

/**
 * Decodes UTF-7 string, see RFC 2152
 * @param {String} str String to decode
 */
export const decode = str =>
str.replace(/\+([A-Za-z0-9/]*)-?/gi, (_, chunk) => chunk === '' ? '+' : decodeFromUTF7(chunk))

/**
 * Encodes string to UTF-7 with all optionals, see RFC 3501
 *
 * All printable ASCII chars except for & must be represented by themselves.
 * We replace subsequent non-representable chars with their escape sequence.
 *
 * @param {String} str String to encode
 */
export const imapEncode = str =>
str.replace(/&/g, '&-').replace(/[^\x20-\x7e]+/g, chunk => '&' + (chunk === '&' ? '' : encodeToUTF7(chunk)).replace(/\//g, ',') + '-')

/**
 * Decodes UTF-7 string, see RFC 3501
 * @param {String} str String to decode
 */
export const imapDecode = str =>
str.replace(/&([^-]*)-/g, (_, chunk) => (chunk === '') ? '&' : decodeFromUTF7(chunk.replace(/,/g, '/')))
