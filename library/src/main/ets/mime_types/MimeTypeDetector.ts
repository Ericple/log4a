/*
 * Copyright (C) 2022 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs from '@ohos.file.fs';
import { JList } from './JList'
import { WeightedMimeType } from './WeightedMimeType'
import { default as GlobalContext } from '../GlobalContext';

export class MimeTypeDetector {
    private static content: Int8Array;

    public static init(callBack) {
        let context:Context = GlobalContext.getContext().getValue('context') as Context;
        context.resourceManager.getRawFileContent("mime.cache", (error, value:ESObject) => {
            if (error != null) {
                callBack(null)
                console.log("ohos_mail-- error is " + JSON.stringify(error));
            } else {
                callBack(value)
                this.content = value
                console.log("ohos_mail-- getRawFileContent success" + GlobalContext.getContext().getValue('filesPath'));
            }
        });
    }

    public static detectMimeType(path: string,cacheContent?): string {
        if (!!cacheContent) {
            this.content = cacheContent
        }else {
            let cacheContent =  GlobalContext.getContext().getValue('cacheContent')
            this.content = cacheContent as Int8Array
        }

        let tempPath = "";
        let strList: JList<string>;
        if (path.lastIndexOf("/") > 0) {
            tempPath = path.substring(path.lastIndexOf("/") + 1);
            strList = this.detectMimeTypeAsync(tempPath);
        } else {
            strList = this.detectMimeTypeAsync(path);
        }
        if (strList.length() == 1) {
            return strList.get(0);
        } else {
            return this.getBytes(path, strList);
        }
    }

    /**
     * Returns the number of bytes the magic number sniffers may read.
     *
     * <p>
     * If you are crafting your own getBytes() method, you may use this as a
     * hint. getBytes() may return an Array with any number of bytes you like,
     * but MimeTypeDetector will not read more than this many.
     * </p>
     *
     * @return The most bytes getBytes() could ever possibly need to return.
     */
    public static getMaxGetBytesLength(): number {
        return this.getMaxExtents();
    }

    private static getBytes(path: string, globMimeTypes: JList<string>): string {
        let actLength = 0;
        let buf = new ArrayBuffer(this.getMaxGetBytesLength());
        let oldBytes;
        let bytes;
        try {
            fs.accessSync(path);
            //file exist
            let fd = fs.openSync(path, 0o2);
            // read actual length
            actLength = fs.readSync(fd.fd, buf);
            oldBytes = new Int8Array(buf);
            bytes = new Array(actLength);
        } catch (error) {
            //file not exist
            oldBytes = new Int8Array(0);
            bytes = new Array(0);
        }
        for (let index = 0;index < actLength; index++) {
            bytes[index] = oldBytes[index];
        }
        let list: JList<string> = this.bytesToMimeTypes(bytes);
        for (let index = 0;index < list.length(); index++) {
            let magicMimeType = list.get(index)
            if (globMimeTypes.length() == 0) {
                return magicMimeType;
            }
        }
        if (this.isText(bytes)) {
            return "text/plain";
        }
        return "application/octet-stream";
    }

    private static isText(bytes: Int8Array): boolean {
        return bytes.length > 0 && this.isAsciiText(bytes);
    }

    private static isAsciiText(bytes: Int8Array): boolean {
        for (let index = 0;index < bytes.length; index++) {
            let b = bytes[index];
            if (b > 0x7f) return false;
            if (b < 0x20 && !(this.isWhitespace(b))) return false;
        }
        return true;
    }

    private static isWhitespace(ch: number): boolean {
        if (ch >= 9 && ch <= 13 || ch >= 28 && ch <= 32) {
            return true;
        } else {
            return false;
        }
    }

    private static bytesToMimeTypes(data: Int8Array): JList<string> {
        let mimeTypes: JList<string> = new JList<string>();
        let listOffset = this.getMagicListOffset();
        let numEntries = this.getInt(listOffset);
        let offset = this.getInt(listOffset + 8);
        for (let i = 0; i < numEntries; i++) {
            let mimeType = this.compareToMagicData(offset + (16 * i), data);
            if (!!mimeType) {
                mimeTypes.insert(mimeType);
            }
        }
        return mimeTypes;
    }

    private static compareToMagicData(offset: number, data: Int8Array): string {
        let nMatchlets = this.getInt(offset + 8);
        let firstMatchletOffset = this.getInt(offset + 12);
        if (this.matchletMagicCompareOr(nMatchlets, firstMatchletOffset, data)) {
            let mimeOffset = this.getInt(offset + 4);
            return this.getMimeType(mimeOffset);
        }
        return null;
    }

    /**
     * Returns whether one of the specified matchlets matches the data.
     */
    private static matchletMagicCompareOr(nMatchlets: number, firstMatchletOffset: number, data: Int8Array): boolean {
        for (let i = 0, matchletOffset = firstMatchletOffset; i < nMatchlets; i++, matchletOffset += 32) {
            if (this.matchletMagicCompare(matchletOffset, data)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns whether data satisfies the matchlet and its children.
     */
    private static matchletMagicCompare(offset: number, data: Int8Array): boolean {
        if (this.oneMatchletMagicEquals(offset, data)) {
            let nChildren = this.getInt(offset + 24);
            if (nChildren > 0) {
                let firstChildOffset = this.getInt(offset + 28);
                return this.matchletMagicCompareOr(nChildren, firstChildOffset, data);
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    /**
     * Tests whether one matchlet (but not its children) matches data.
     */
    private static oneMatchletMagicEquals(offset: number, data: Int8Array): boolean {
        let rangeStart = this.getInt(offset); // first byte of data for check to start at
        let rangeLength = this.getInt(offset + 4); // last byte of data for check to start at
        let dataLength = this.getInt(offset + 12); // number of bytes in match data/mask
        let dataOffset = this.getInt(offset + 16); // contentBytes offset to the match data
        let maskOffset = this.getInt(offset + 20); // contentBytes offset to the mask
        let found = false;
        for (let i = 0;!found && (i <= rangeLength) && (i + rangeStart + dataLength <= data.length); i++) {
            if (maskOffset != 0) {
                found = this.subArraysEqualWithMask(
                    this.content, dataOffset,
                    data, rangeStart + i,
                    this.content, maskOffset,
                    dataLength
                );
            } else {
                found = this.subArraysEqual(
                    this.content, dataOffset,
                    data, rangeStart + i,
                    dataLength
                );
            }
        }
        return found;
    }

    /**
     * Returns true if subarrays are equal, with the given mask.
     *
     * <p>
     * The mask must have length {@ code len}.
     * </p>
     */
    private static subArraysEqualWithMask(a: Int8Array, aStart: number, b: Int8Array, bStart: number, mask: Int8Array, maskStart: number, len: number): boolean {
        let i = aStart
        let j = bStart
        let k = maskStart

        for (len; len > 0; len--) {
            if ((a[i] & mask[k]) != (b[j] & mask[k])) {
                return false;
            }
            i++
            j++
            k++
        }
        return true;
    }

    /**
     * Returns true if subarrays are equal.
     */
    private static subArraysEqual(a: Int8Array, aStart: number, b: Int8Array, bStart: number, len: number): boolean {
        let i = aStart
        let j = bStart
        for (len; len > 0; len--) {
            if (a[i] != b[j]) {
                return false;
            }
            i++
            j++
        }
        return true;
    }

    public static detectMimeTypeAsync(filename: string): JList<string> {
        let weightedMimeTypes: JList<WeightedMimeType> = this.filenameToWmts(filename);
        let globMimeTypes: JList<string> = this.findBestMimeTypes(weightedMimeTypes);
        return globMimeTypes;
    }

    private static filenameToWmts(filename: string): JList<WeightedMimeType> {
        let ret;
        let wmt;
        if (!!this.filenameToWmtOrNullByLiteral(filename)) {
            wmt = this.filenameToWmtOrNullByLiteral(filename)
            ret = new JList<WeightedMimeType>();
            ret.insert(wmt);
            return ret;
        }

        if (!!this.filenameToWmtsOrNullBySuffixAndIgnoreCase(filename, false)) {
            ret = this.filenameToWmtsOrNullBySuffixAndIgnoreCase(filename, false)
            return ret
        }

        if (!!this.filenameToWmtsOrNullBySuffixAndIgnoreCase(filename, true)) {
            ret = this.filenameToWmtsOrNullBySuffixAndIgnoreCase(filename, true)
            return ret
        }
        return this.filenameToWmtsByGlob(filename);
    }

    private static filenameToWmtOrNullByLiteral(filename: string): WeightedMimeType {
        let filenameLower = filename.toLowerCase();
        let listOffset = this.getLiteralListOffset();
        let numEntries = this.getInt(listOffset);
        let min = 0;
        let max = numEntries - 1;
        while (max >= min) {
            let mid = Math.floor((min + max) / 2);
            let literal = this.getString(this.getInt((listOffset + 4) + (12 * mid)));
            let weightAndCaseSensitive = this.getInt((listOffset + 4) + (12 * mid) + 8);
            let ignoreCase = (weightAndCaseSensitive & 0x100) == 0;
            let cmp = this.compareTo(literal, (ignoreCase ? filenameLower : filename));
            if (cmp < 0) {
                min = mid + 1;
            } else if (cmp > 0) {
                max = mid - 1;
            } else {
                let mimeType = this.getMimeType(this.getInt((listOffset + 4) + (12 * mid) + 4));
                let weight = weightAndCaseSensitive & 0xff;
                return new WeightedMimeType(mimeType, literal, weight);
            }
        }
        return null;
    }

    private static filenameToWmtsByGlob(filename: string): JList<WeightedMimeType> {
        let ret: JList<WeightedMimeType> = new JList<WeightedMimeType>();
        let listOffset = this.getGlobListOffset();
        let numEntries = this.getInt(listOffset);
        for (let i = 0; i < numEntries; i++) {
            let offset = this.getInt((listOffset + 4) + (12 * i));
            let rawPattern = this.getRegex(offset);
            let weightAndIgnoreCase = this.getInt((listOffset + 4) + (12 * i) + 8);
            let pattern = new RegExp(rawPattern, "i");
            if (pattern.test(filename)) {
                let mimeTypeOffset = this.getInt((listOffset + 4) + (12 * i) + 4);
                let mimeType = this.getMimeType(mimeTypeOffset);
                let weight = weightAndIgnoreCase & 0xff;
                ret.insert(new WeightedMimeType(mimeType, rawPattern, weight));
            }
        }
        return ret;
    }

    private static findBestMimeTypes(weightedMimeTypes: JList<WeightedMimeType>): JList<string> {
        // Find top weight
        let bestWeight = 0;
        for (let index = 0;index < weightedMimeTypes.length(); index++) {
            let wmt: WeightedMimeType = weightedMimeTypes.get(index);
            if (wmt.weight > bestWeight) bestWeight = wmt.weight;
        }
        // bestWeightWmts: filtered for just top weight
        let bestWeightWmts = new JList<WeightedMimeType>();
        for (let index = 0;index < weightedMimeTypes.length(); index++) {
            let wmt: WeightedMimeType = weightedMimeTypes.get(index);
            if (wmt.weight == bestWeight) bestWeightWmts.insert(wmt);
        }
        // Find longest pattern length
        let bestPatternLength = 0;
        for (let index = 0;index < bestWeightWmts.length(); index++) {
            let wmt: WeightedMimeType = bestWeightWmts.get(index);
            if (wmt.pattern.length > bestPatternLength) bestPatternLength = wmt.pattern.length;
        }
        // ret: filtered for just top pattern
        let ret = new JList<string>();
        for (let index = 0;index < bestWeightWmts.length(); index++) {
            let wmt: WeightedMimeType = bestWeightWmts.get(index);
            if (wmt.pattern.length == bestPatternLength) ret.insert(wmt.mimeType);
        }
        return ret;
    }

    private static compareTo(value: string, anotherString: string): number {
        let len1 = value.length;
        let len2 = anotherString.length;
        let lim = Math.min(len1, len2);
        let v1 = new Array(len1);
        for (let index1 = 0;index1 < len1; index1++) {
            v1[index1] = value.charAt(index1)
        }
        let v2 = new Array(len2);
        for (let index2 = 0;index2 < len2; index2++) {
            v2[index2] = anotherString.charAt(index2)
        }
        let k = 0;
        while (k < lim) {
            let c1 = v1[k];
            let c2 = v2[k];
            if (c1 != c2) {
                return c1.charCodeAt(0) - c2.charCodeAt(0);
            }
            k++;
        }
        return len1 - len2;
    }

    private static getMimeType(offset: number): string {
        return this.getString(offset);
    }

    private static getRegex(offset: number): string {
        return this.getStringOrRegex(offset, true);
    }

    private static filenameToWmtsOrNullBySuffixAndIgnoreCase(filename: string, ignoreCase: boolean): JList<WeightedMimeType> {
        let listOffset = this.getReverseSuffixTreeOffset();
        let numEntries = this.getInt(listOffset);
        let offset = this.getInt(listOffset + 4);
        let len = filename.length;
        let wmts: JList<WeightedMimeType> = new JList<WeightedMimeType>();
        this.lookupGlobNodeSuffix(filename, numEntries, offset, ignoreCase, len, wmts, "");
        if (wmts.length() == 0) return null;
        return wmts;
    }

    private static lookupGlobNodeSuffix(fileName: string, numEntries: number,
                                        offset: number, ignoreCase: boolean, len: number, mimeTypes: JList<WeightedMimeType>,
                                        pattern: string): void {
        let c = ignoreCase ? fileName.toLowerCase().charAt(len - 1) : fileName.charAt(len - 1);
        if (c == '\0') return;
        let min = 0;
        let max = numEntries - 1;
        while (max >= min && len >= 0) {
            let mid = Math.floor((min + max) / 2);
            let matchChar = String.fromCharCode(this.getInt(offset + (12 * mid)));
            if (matchChar < c) {
                min = mid + 1;
            } else if (matchChar > c) {
                max = mid - 1;
            } else {
                len--;
                let numChildren = this.getInt(offset + (12 * mid) + 4);
                let childOffset = this.getInt(offset + (12 * mid) + 8);
                if (len > 0) {
                    pattern += matchChar;
                    this.lookupGlobNodeSuffix(fileName, numChildren, childOffset,
                        ignoreCase, len, mimeTypes, pattern);
                }
                if (mimeTypes.length() == 0) {
                    for (let i = 0; i < numChildren; i++) {
                        matchChar = String.fromCharCode(this.getInt(childOffset + (12 * i)));
                        if (matchChar != '\0') break;
                        let mimeOffset = this.getInt(childOffset + (12 * i) + 4);
                        let weight = this.getInt(childOffset + (12 * i) + 8);
                        mimeTypes.insert(new WeightedMimeType(
                            this.getMimeType(mimeOffset),
                            pattern.toString(),
                            weight
                        ));
                    }
                }
                return;
            }
        }
    }

    private static getMagicListOffset(): number {
        return this.getInt(24);
    }

    private static getGlobListOffset(): number {
        return this.getInt(20);
    }

    private static getLiteralListOffset(): number {
        return this.getInt(12)
    }

    private static getReverseSuffixTreeOffset(): number {
        return this.getInt(16);
    }

    private static getString(offset: number): string {
        return this.getStringOrRegex(offset, false);
    }

    private static getMaxExtents(): number {
        return this.getInt(this.getMagicListOffset() + 4);
    }

    private static getStringOrRegex(offset: number, regularExpression: boolean): string {
        let buf = "";
        if (regularExpression) buf += '^';
        let b;
        while ((b = String.fromCharCode(this.content[offset])) != '\0') {
            if (regularExpression) {
                switch (b) {
                    case '.':
                        buf += '\\';
                        break;
                    case '*':
                    case '+':
                    case '?':
                        buf += '.';
                }
            }
            buf += b;
            offset++;
        }
        if (regularExpression) buf += '$';
        return buf;
    }

    private static getInt(index): number {
        if (this.content.length > index + 3) {
            return this.makeInt(this.content[index], this.content[index+1], this.content[index+2], this.content[index+3])
        }
        return -1
    }

    //源码jar抽取的方法
    private static makeInt(b3: number, b2: number, b1: number, b0: number): number {
        return ((b3) << 24) |
        ((b2 & 0xff) << 16) |
        ((b1 & 0xff) << 8) |
        (b0 & 0xff)
    }
}
