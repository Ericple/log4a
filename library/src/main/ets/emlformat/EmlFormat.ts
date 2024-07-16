/*
 * Copyright (c) 2017 papnkukn
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
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
 */

import fs from '@ohos.file.fs';
import Result from '../emlformat/Result'
import Attachment from '../emlformat/Attachment'
import Data from '../emlformat/Data'
import { Util } from '../Util';
import { MailLogger } from '../MailLogger';
import Boundary from './Boundary';
import { Constant } from '../Constant';


export class EmlFormat {
    public static verbose: false
    fileExtensions: {
        "text/plain": ".txt",
        "text/html": ".html",
        "image/png": ".png",
        "image/jpg": ".jpg",
        "image/jpeg": ".jpg",
    }

    private guid(): string {

        return 'xxxxxxxxxxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).replace("-", "");
    }

    public wrap(s: string, i: number): string {
        var a = [];
        do {
            a.push(s.substring(0, i))
        }
        while ((s = s.substring(i, s.length)) != "");
        return a.join(Constant.LINEFEED);
    }

    public getFileExtension(mimeType: string): string {
        return this.fileExtensions[mimeType] || "";
    }

    public static getBoundary(contentType: string): string {
        var match = /boundary="?(.+?)"?(\s*;[\s\S]*)?$/g.exec(contentType);
        return match ? match[1] : undefined;
    }

    public getEmailAddress(raw: string): any {
        var result = { name: '', email: '' };
        var regex = /^(.*?)(\s*\<(.*?)\>)$/g;
        var match = regex.exec(raw);
        if (match) {
            var name = this.unquoteUTF8(match[1]).replace(/"/g, "").trim();
            if (name && name.length) {
                result.name = name;
            }
            result.email = match[3].trim();
        }
        else {
            result.email = raw;
        }
        return result;
    }

    public toEmailAddress(data): string {
        var email = "";
        if ((!!!data)) {
            return email
        }
        else if (Array.isArray(data)) {
            return data.map(oneReceiver => this.toEmailAddress(oneReceiver)).join(", ")
        }
        else if (typeof data == "string") {
            email = data;
        }
        else {
            if (data.name) {
                email += '"' + data.name + '"';
            }
            if (data.email) {
                email += (email.length ? ' ' : '') + '<' + data.email + '>';
            }
        }
        return email;
    }

    public unquoteUTF8(s: string): string {
        var regex = /=\?UTF\-8\?(B|Q)\?(.+?)(\?=)/gi;
        var match = regex.exec(s);
        if (match) {
            var type = match[1].toUpperCase();
            var value = match[2];
            if (type == "Q") {
                return this.unquotePrintable(value);
            }
        }
        return s;
    }

    public unquotePrintable(s: string): string {
        return s
            .replace(/=([\w\d]{2})=([\w\d]{2})=([\w\d]{2})/gi, function (matcher, p1, p2, p3, offset, string) {
                return new Uint16Array([parseInt(p1, 16), parseInt(p2, 16), parseInt(p3, 16)]).toString();
            })
            .replace(/=([\w\d]{2})=([\w\d]{2})/gi, function (matcher, p1, p2, offset, string) {
                return new Uint16Array([parseInt(p1, 16), parseInt(p2, 16)]).toString();
            })
            .replace(/=([\w\d]{2})/gi, function (matcher, p1, offset, string) {
                return String.fromCharCode(parseInt(p1, 16));
            })
            .replace(/=\r?\n/gi, "");
    }

    /**
     *
     * Parses EML file content and return user-friendly object.
     * @params data        EML structure
     * @params options     EML build options
     * @params callback    Callback function(error, data)
     */
    public buildEml(data: Data, callback?) {
        var eml = "";
        var EOL = Constant.LINEFEED; //End-of-line

        try {
            if (!data || typeof data != "object") {
                throw new Error("Argument 'data' expected to be an object!");
            }

            if (!data.headers) {
                data.headers = {};
            }

            if (typeof data.subject == "string") {
                data.headers["Subject"] = data.subject;
            }

            if (!!data.from) {
                data.headers["From"] = (typeof data.from == "string" ? data.from : this.toEmailAddress(data.from));
            }

            if (!!data.to) {
                data.headers["To"] = (typeof data.to == "string" ? data.to : this.toEmailAddress(data.to));
            }

            if (!data.headers["To"]) {
                throw new Error("Missing 'To' e-mail address!");
            }

            var boundary = "----=" + this.guid();
            if (!!!data.headers["Content-Type"]) {
                data.headers["Content-Type"] = 'multipart/mixed;' + EOL + 'boundary="' + boundary + '"'
            } else {
                var name = EmlFormat.getBoundary(data.headers["Content-Type"]);
                if (name) {
                    boundary = name;
                }
            }

            //Build headers
            var keys = Object.keys(data.headers)
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = data.headers[key];
                if (!!!value) {
                    continue;
                } else if (typeof value == "string") {
                    eml += key + ": " + value.replace(/\r?\n/g, EOL + "  ") + EOL;
                } else {
                    for (var j = 0; j < value.length; j++) {
                        eml += key + ": " + value[j].replace(/\r?\n/g, EOL + "  ") + EOL;
                    }
                }
            }


            //Start the body
            eml += EOL;

            //Plain text content
            if (data.text) {
                eml += "--" + boundary + EOL;
                eml += "Content-Type: text/plain; charset=utf-8" + EOL;
                eml += EOL;
                eml += data.text;
                eml += EOL + EOL;
            }


            //HTML content
            if (data.html) {
                eml += "--" + boundary + EOL;
                eml += "Content-Type: text/html; charset=utf-8" + EOL;
                eml += EOL;
                eml += data.html;
                eml += EOL + EOL;
            }


            //Append attachments
            if (data.attachments) {
                for (let i = 0; i < data.attachments.length; i++) {
                    var attachment = data.attachments[i];
                    eml += '--' + boundary + EOL;
                    eml += 'Content-Type: ' + (attachment.contentType || "application/octet-stream") + EOL;
                    eml += 'Content-Transfer-Encoding: base64' + EOL;
                    eml += 'Content-Disposition: ' + (attachment.inline ? "inline" : "attachment") + '; filename="' + (attachment.filename || attachment.name || ("attachment_" + (i + 1))) + '"' + EOL;
                    eml += EOL;
                    if (typeof attachment.getData() == "string") {
                        var content = Util.encodeString(attachment.data);
                        eml += this.wrap(content, 76) + EOL;
                    } else {
                        let content: string = Util.encodeString(attachment.data)
                        eml += this.wrap(content, 76) + EOL;
                    }
                    eml += EOL;
                }
            }

            //Finish the boundary
            eml += "--" + boundary + "--" + EOL;
            callback(null, eml);
        }
        catch (e) {
            callback(e);
        }
    }


    /******************************************************************************************
     * Parses EML file content and return user-friendly object.
     * @params eml         EML file content or object from 'parse'
     * @params options     EML parse options
     * @params callback    Callback function(error, data)
     ******************************************************************************************/
    public read(path, options, callback?) {
        var eml
        let fd = fs.openSync(path, 0o2);
        let stat = fs.statSync(path);

        eml = new ArrayBuffer(stat.size);
        fs.readSync(fd.fd, eml);

        //Shift arguments
        if (typeof options == "function" && !!!callback) {
            callback = options;
        }

        if (typeof callback != "function") {
            callback = function (error, result) {
            };
        }

        if (typeof eml == "string") {
            this.parse(eml, function (error, data) {
                if (error) return callback(error);
                this.read(data);
            });
        }
        else if (typeof eml == "object") {
            this.readData(eml);
        }
        else {
            callback(new Error("Missing EML file content!"));
        }
    }

    public readData(data) {
        var result: Result = {}
        if (data.headers["Date"]) {
            result.date = new Date(data.headers["Date"]);
        }
        if (data.headers["Subject"]) {
            result.subject = this.unquoteUTF8(data.headers["Subject"]);
        }
        if (data.headers["From"]) {
            result.from = this.getEmailAddress(data.headers["From"]);
        }
        if (data.headers["To"]) {
            result.setTo = this.getEmailAddress(data.headers["To"]);
        }
        result.headers = data.headers;

        function append(headers, content) {
            var encoding = headers["Content-Transfer-Encoding"];
            if (encoding == "base64") {
                //          content = Buffer.from(content.replace(/\r?\n/g, ""), "base64");
            }
            else if (encoding == "quoted-printable") {
                content = this.unquotePrintable(content);
            }

            var contentType = headers["Content-Type"];
            if (!result.html && contentType && contentType.indexOf("text/html") >= 0) {
                if (typeof content != "string") {
                    content = content.toString("utf8");
                }
                result.html = content;
            }
            else if (!result.text && contentType && contentType.indexOf("text/plain") >= 0) {
                if (typeof content != "string") {
                    content = content.toString("utf8");
                }
                result.text = content;
            }
            else {
                if (!result.attachments) {
                    result.attachments = [];
                }

                var attachment: Attachment = {}

                var id = headers["Content-ID"];
                if (id) {
                    attachment.id = id;
                }

                var name = headers["Content-Disposition"] || headers["Content-Type"];
                if (name) {
                    var match = /name="?(.+?)"?$/gi.exec(name);
                    if (match && match.length > 1) {
                        name = match[1];
                    }
                    else {
                        name = null;
                    }
                }
                if (name) {
                    attachment.name = name;
                }

                var ct = headers["Content-Type"];
                if (ct) {
                    attachment.contentType = ct;
                }

                var cd = headers["Content-Disposition"];
                if (cd) {
                    attachment.inline = /^\s*inline/g.test(cd);
                }
                attachment.data = content;
                result.attachments.push(attachment);
            }
        }

        //Content mime type
        var boundary = null;
        var ct = data.headers["Content-Type"];
        if (ct && /^multipart\//g.test(ct)) {
            var b = EmlFormat.getBoundary(ct);
            if (b && b.length) {
                boundary = b;
            }
        }

        if (boundary) {
            for (var i = 0; i < data.body.length; i++) {
                var body = data.body[i];

                //Get the message content
                if (!!!body.part) {
                    MailLogger.warn("Warning: undefined b.part");
                }
                else if (typeof body.part == "string") {
                    result.setData(body.part);
                }
                else {
                    if (!!!body.part.body) {
                        MailLogger.warn("Warning: undefined b.part.body");
                    } else if (typeof body.part.body == "string") {
                        var headers = body.part.headers;
                        var content = body.part.body;

                        append(headers, content);
                    } else {
                        for (var j = 0; j < body.part.body.length; j++) {
                            if (typeof body.part.body[j] == "string") {
                                result.setData(body.part.body[j]);
                                continue;
                            }

                            var partHeaders = body.part.body[j].part.headers;
                            var partBody = body.part.body[j].part.body;
                            append(partHeaders, partBody);
                        }
                    }
                }
            }
        }
        else if (typeof data.body == "string") {
            append(data.headers, data.body);
        }
        return result

    }

    /******************************************************************************************
     * Parses EML file content and returns object-oriented representation of the content.
     * @params eml         EML file content
     * @params options     EML parse options
     * @params callback    Callback function(error, data)
     ******************************************************************************************/
    public parse(path: string, callback) {
        fs.readText(path).then(function (str) {
            try {
                if (!!!str || str == "") {
                    callback(false, "mail content is empty");
                }
                var lines = str.split(/\r?\n/);
                var result = {};
                EmlFormat.parseRecursive(lines, 0, result, callback, false);
                callback(true, result);
            } catch (e) {
                callback(false, e);
            }
        }).catch((err) => {
            callback(false, err);
        });
    }

    public static parseString(eml: string, parseCallBack) {
        if (eml == "") {
            parseCallBack(false, "mail content is empty");
        }

        try {
            var lines = eml.split(Constant.LINEFEED);
            var result: Result = {};
            this.parseRecursive(lines, 0, result, parseCallBack, false);
            parseCallBack(true, result);
        } catch (e) {
            parseCallBack(false, e);
        }
    }

    public static parseHeaders(eml: string, parseCallBack) {
        if (eml == "") {
            parseCallBack(false, "mail content is empty");
        }

        try {
            var lines = eml.split(Constant.READ_LINEFEED);
            var result: Result = {};
            this.parseRecursive(lines, 0, result, parseCallBack, true);
            parseCallBack(true, result);
        } catch (e) {
            parseCallBack(false, e);
        }
    }


    /**
     * Parses EML file content.
     */
    public static parseRecursive(lines: string[], start: number, parent: Result, options, isHeaders) {
        var boundary: Boundary;
        var lastHeaderName = "";
        var findBoundary = "";
        var insideBody = false;
        var insideBoundary = false;
        var isMultiHeader = false;
        var isMultipart = false;
        parent.headers = {};

        //Read line by line
        for (var i = start; i < lines.length; i++) {
            var line = lines[i];
            //Header
            if (!insideBody) {
                //Search for empty line
                if (line == "") {
                    insideBody = true;
                    //Expected boundary
                    var ct = parent.headers["Content-Type"];
                    if (ct && /^multipart\//g.test(ct)) {
                        var b = this.getBoundary(ct);
                        if (b && b.length) {
                            findBoundary = b;
                            isMultipart = true;
                            if (!isHeaders) {
                                parent.body = [];
                            }

                        } else {
                            if (this.verbose) {
                                MailLogger.warn("Multipart without boundary! " + ct.replace(/\r?\n/g, " "));
                            }
                        }
                    }
                    continue;
                }

                //Header value with new line
                var match = /^\s+([^\r\n]+)/g.exec(line);
                if (match && match.length > 1) {
                    if (isMultiHeader) {
                        parent.headers[lastHeaderName][parent.headers[lastHeaderName].length - 1] += Constant.LINEFEED + match[1];
                    } else {
                        parent.headers[lastHeaderName] += Constant.LINEFEED + match[1];
                    }
                    continue;
                }

                if(line.trim().toLowerCase() === "subject:"){
                    let pattern = /^[\w\d\-]+:.*$/;
                    let subjectStr = "";
                    for (let nextLine = i + 1; nextLine < lines.length; nextLine++) {
                        let lineStr = lines[nextLine];
                        if(!pattern.test(lineStr)){
                            subjectStr += lineStr.trim();
                        }else{
                            break;
                        }
                    }
                    parent.headers.Subject = subjectStr.trim();
                }

                //Header name and value
                match = /^([\w\d\-]+):\s+([^\r\n]+)/gi.exec(line);
                let match2 = /^([\w\d\-]+):+([^\r\n]+)/gi.exec(line);
                if (match && match.length > 1) {
                    lastHeaderName = match[1];
                    if (match.length > 2) {
                        if (parent.headers[lastHeaderName]) {
                            //Multiple headers with the same name
                            isMultiHeader = true;
                            if (typeof parent.headers[lastHeaderName] == "string") {
                                parent.headers[lastHeaderName] = [parent.headers[lastHeaderName]];
                            }
                            parent.headers[lastHeaderName].push(match[2]);
                        } else {
                            //Header first appeared here
                            isMultiHeader = false;
                            parent.headers[lastHeaderName] = match[2];
                        }
                        if(lastHeaderName === "Content-Type"){
                            const regex = /name="([^"]+)"/;
                            const result = line.match(regex);
                            if (result && result[1]) {
                                parent.headers['filename'] = result[1];
                            }
                        }
                    }
                    continue;
                }

                if (match2 && match2.length > 1) {
                    lastHeaderName = match2[1];
                    if (match2.length > 2) {
                        if (parent.headers[lastHeaderName]) {
                            //Multiple headers with the same name
                            isMultiHeader = true;
                            if (typeof parent.headers[lastHeaderName] == "string") {
                                parent.headers[lastHeaderName] = [parent.headers[lastHeaderName]];
                            }
                            parent.headers[lastHeaderName].push(match2[2]);
                        } else {
                            //Header first appeared here
                            isMultiHeader = false;
                            parent.headers[lastHeaderName] = match2[2];
                        }
                    }
                    continue;
                }
            } else {
                //Multipart body
                if (isHeaders) {
                    return
                }

                if (isMultipart) {
                    //Search for boundary start
                    if (line.indexOf("--" + findBoundary) == 0 && !/\-\-(\r?\n)?$/g.test(line)) {
                        insideBoundary = true;
                        //Complete the previous boundary
                        if (boundary && boundary.lines) {
                            this.complete(boundary, options, isHeaders);
                        }

                        //Start a new boundary
                        match = /^\-\-([^\r\n]+)(\r?\n)?$/g.exec(line);
                        if (match.length > 1) {
                            boundary = { boundary: match[1], lines: [] };
                        }
                        parent.body.push(boundary);
                        if (this.verbose) {
                            MailLogger.info("Found boundary: " + boundary.boundary);
                        }
                        continue;
                    }

                    if (insideBoundary) {
                        //Search for boundary end
                        if (boundary.boundary && lines[i - 1] == "" && line.indexOf("--" + findBoundary + "--") == 0) {
                            insideBoundary = false;
                            this.complete(boundary, options, isHeaders);
                            continue;
                        }
                        boundary.lines.push(line);
                    }
                } else {
                    //Solid string body
                    let tempStringArr = lines.splice(i);
                    let chunkSize = 100; //限制每次处理的元素
                    parent.body = ""
                    let result = []
                    for (let start = 0; start < tempStringArr.length; start+= chunkSize) {
                        let end = Math.min(start + chunkSize, tempStringArr.length);
                        result.push(tempStringArr.slice(start, end).join(Constant.LINEFEED));
                    }
                    parent.body = result.join(Constant.LINEFEED)
                    break;
                }
            }
        }

        // Complete the last boundary
        if (parent.body && parent.body.length && parent.body[parent.body.length - 1].lines) {
            this.complete(parent.body[parent.body.length - 1], options, isHeaders);
        }
    }

    public static complete(boundary: Boundary, options, isHeaders) {
        boundary.part = {};
        this.parseRecursive(boundary.lines, 0, boundary.part, options, isHeaders);
        delete boundary.lines;
    }
}