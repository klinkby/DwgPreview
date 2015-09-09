/* jslint browser: true */
/*!
 * Requests a dwg file from the host web, extract and display thumbnail.
 * Copyright (c) 2015 Mads Breusch Klinkby.
 * All rights reserved.
 */
(function () {
    "use strict";

    /**
     * Base64 encodes an ArrayBuffer. Hat tip to https://gist.github.com/jonleighton/958841
     * @param {ArrayBuffer} arrayBuffer
     * @return {String}
     */
    function base64ArrayBuffer(arrayBuffer) {
        var base64 = '',
          encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
          bytes = new Uint8Array(arrayBuffer),
          byteLength = bytes.byteLength,
          byteRemainder = byteLength % 3,
          mainLength = byteLength - byteRemainder,
          a, b, c, d,
          chunk;
        // Main loop deals with bytes in chunks of 3
        for (var i = 0; i < mainLength; i = i + 3) {
            // Combine the three bytes into a single integer
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
            c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
            d = chunk & 63;               // 63       = 2^6 - 1
            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
        }
        // Deal with the remaining bytes and padding
        if (byteRemainder == 1) {
            chunk = bytes[mainLength];
            a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2
            // Set the 4 least significant bits to zero
            b = (chunk & 3) << 4; // 3   = 2^2 - 1
            base64 += encodings[a] + encodings[b]; + '=='
        } else if (byteRemainder == 2) {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
            a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
            b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4
            // Set the 2 least significant bits to zero
            c = (chunk & 15) << 2; // 15    = 2^4 - 1
            base64 += encodings[a] + encodings[b] + encodings[c] + '=';
        }
        return base64;
    }

    /**
     * Parse a AutoCAD DWG file and return embedded bmp or png preview image as data uri.
     * @param {ArrayBuffer} arrayBuffer
     * @return {String}
     */
    function dwgToDataURI(arrayBuffer) {
        var bytes = new DataView(arrayBuffer),
            offset = bytes.getInt32(0xd, true) + 0x14,
            imageCode, headerStart, headerLength,
            imageCount = bytes.getUint8(offset);
        offset += 1;

        /**
         * Read bmp from array buffer
         * @param {ArrayBuffer} bytes
         * @param {Number} offset
         * @param {Number} headerStart
         * @param {Number} hreaderLength
         */
        function readBmp(headerStart, headerLength) {
            var bitCount, imageLength, colorTableSize, bmpBytes, bmpView, bmpOffset;
            offset += 0xe;
            bitCount = bytes.getUint16(offset, true);
            offset += 2 + 4;
            imageLength = bytes.getUint32(offset, true);
            offset += 4;
            offset = headerStart;
            colorTableSize = Math.floor(bitCount < 9 ? 4 * Math.pow(2, bitCount) : 0);
            bmpBytes = new ArrayBuffer(
              2 +
              4 +
              2 +
              2 +
              4 +
              headerLength);
            bmpView = new DataView(bmpBytes);
            bmpOffset = 0;
            bmpView.setUint16(bmpOffset, 0x4d42, true);
            bmpOffset += 2;
            bmpView.setUint32(bmpOffset, 54 + colorTableSize + imageLength, true);
            bmpOffset += 4 + 2 + 2;
            bmpView.setUint32(bmpOffset, 54 + colorTableSize, true);
            bmpOffset += 4;
            for (var i = 0; i < headerLength; i++) {
                bmpView.setUint8(bmpOffset + i, bytes.getUint8(headerStart + i));
            }
            return bmpBytes;
        }

        /**
         * Read png from array buffer
         * @param {ArrayBuffer} bytes
         * @param {Number} offset
         * @param {Number} headerStart
         * @param {Number} hreaderLength
         */
        function readPng(headerStart, headerLength) {
            var pngBytes = arrayBuffer.slice(headerStart, headerStart + headerLength);
            return pngBytes;
        }

        if (0 === imageCount) return;
        for (var i = 0; i < imageCount; i += 1) {
            imageCode = bytes.getUint8(offset);
            offset += 1;
            headerStart = bytes.getInt32(offset, true);
            offset += 4;
            headerLength = bytes.getInt32(offset, true);
            offset += 4;
            switch (imageCode) {
                case 2: // BMP Preview (2010-2012 file format)
                    return "data:image/bmp;base64," + base64ArrayBuffer(readBmp(headerStart, headerLength));
                    break;
                case 3:
                    return;
                    break;
                case 6: // PNG Preview (2013 file format)
                    return "data:image/png;base64," + base64ArrayBuffer(readPng(headerStart, headerLength));
                    break;
                default:
                    break;
            }
        }
    }

    /**
     *  Get the server relative part of an absolut URL
     *  @param {String} absoluteUrl
     *  @return {String}
     */
    function getRelativeUrlFromAbsolute(absoluteUrl) {
        absoluteUrl = absoluteUrl.replace("https://", "");
        var parts = absoluteUrl.split("/");
        var relativeUrl = "/";
        for (var i = 1; i < parts.length; i++) {
            relativeUrl += parts[i] + "/";
        }
        return relativeUrl;
    }

    /**
     * Executes X domain request for a file on the host web
     * @param {String} filePath
     */
    function previewRemoteDwgFile() {
        var caption = document.getElementById("caption"),
            img = document.getElementById("preview"),
            queryString = {};
        caption.innerHTML = "Loading&hellip;";

        /**
         * Convert a (binary) string to an ArrayBuffer
         * @param {String} str
         * @return {ArrayBuffer}
         */
        function stringToArrayBuffer(str, callback) {

            //var bb = new Blob([str]);
            //var f = new FileReader();
            //f.onload = function (e) {
            //    callback(e.target.result);
            //}
            //f.readAsArrayBuffer(bb);

            var len = str.length,
                arr = new Uint8Array(len);
            for (var i = 0; i < len; i += 1) {
                arr[i] = str.charCodeAt(i);
            }
            return arr.buffer;
        }

        /**
         * Displays an image format error message
         */
        function badImage() {
            img.style.display = "none";
            caption.innerHTML = "Sorry, the drawing cannot be previewed in this browser.";
            document.getElementById("closeDialog").style.display = caption.style.display = "initial";
        }

        /**
         * Parse the SP file object and set the img data Uri
         * @param {Object} data
         */
        function readContents(data) {
            var arrBuf = stringToArrayBuffer(data.body);
            caption.innerHTML = "Parsing&hellip;";
            document.getElementById("closeDialog").style.display = "none";
            caption.innerHTML = "";
            caption.style.display = "none";
            img.addEventListener("error", badImage);
            img.src = dwgToDataURI(arrBuf);
        }

        // parse query string
        location.href.replace(
            /([^?=&]+)(=([^&]*))?/g,
            function ($0, $1, $2, $3) { queryString[decodeURIComponent($1)] = decodeURIComponent($3); }
        );
        var hostweburl = queryString["SPHostUrl"],
            appweburl = queryString["SPAppWebUrl"],
            itemUrl = queryString["SPItemUrl"],
            executor = new window.SP.RequestExecutor(appweburl);
        // get the dwg file
        executor.executeAsync(
        {
            url: appweburl + "/_api/SP.AppContextSite(@target)/web/GetFileByServerRelativeUrl('" +
                itemUrl +
                "')/$value?@target='" +
                hostweburl + "'",
            type: "GET",
            binaryStringResponseBody: true,
            success: readContents,
            error: function (xhr) {
                alert(xhr.status + ": " + xhr.statusText)
            }
        });
    }

    /**
     * Event handler that closes the modal
     */
    function closeParentDialog() {
        var target = parent.postMessage ? parent : (parent.document.postMessage ? parent.document : undefined);
        target.postMessage('CloseCustomActionDialogNoRefresh', '*');
    }
    document.getElementById("closeDialog").addEventListener("click", closeParentDialog);

    // wait for SP lazy loaders
    window.ExecuteOrDelayUntilScriptLoaded(function () {
        window.SP.SOD.registerSod("sp.requestexecutor.js", "/_layouts/15/sp.requestexecutor.js");
        window.SP.SOD.executeFunc("sp.requestexecutor.js", "SP.RequestExecutor", previewRemoteDwgFile);
    }, "sp.js");
}());
