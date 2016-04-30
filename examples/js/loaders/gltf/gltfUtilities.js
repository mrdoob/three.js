/**
gltfUtilities
@license
The MIT License (MIT)
Copyright (c) 2014 Analytical Graphics, Inc.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
(function(root, factory) {
    "use strict";
    /*global define*/
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals
        root.gltfUtilities = factory();
    }
}(this, function() {
    "use strict";

    /**
     * Given a URL, determine whether that URL is considered cross-origin to the current page.
     */
    var isCrossOriginUrl = function(url) {
        var location = window.location;
        var a = document.createElement('a');

        a.href = url;

        // host includes both hostname and port if the port is not standard
        return location.protocol !== a.protocol || location.host !== a.host;
    };

    var isDataUriRegex = /^data:/;

    /**
     * Asynchronously loads the given image URL.  Attempts to load cross-origin images using CORS.
     *
     * @param {String} url The source of the image.
     * @param {Function} success A function that will be called with an Image object
     *                           once the image has loaded successfully.
     * @param {Function} [error] A function that will be called if the request fails.
     *
     * @see <a href='http://www.w3.org/TR/cors/'>Cross-Origin Resource Sharing</a>
     */
    var loadImage = function(url, success, error) {
        var image = new Image();

        image.onload = function() {
            success(image);
        };

        if (typeof error !== 'undefined') {
            image.onerror = error;
        }

        var crossOrigin;
        if (isDataUriRegex.test(url)) {
            crossOrigin = false;
        } else {
            crossOrigin = isCrossOriginUrl(url);
        }

        if (crossOrigin) {
            image.crossOrigin = '';
        }

        image.src = url;
    };

    var dataUriRegex = /^data:(.*?)(;base64)?,(.*)$/;

    function decodeDataUriText(isBase64, data) {
        var result = decodeURIComponent(data);
        if (isBase64) {
            return atob(result);
        }
        return result;
    }

    function decodeDataUriArrayBuffer(isBase64, data) {
        var byteString = decodeDataUriText(isBase64, data);
        var buffer = new ArrayBuffer(byteString.length);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < byteString.length; i++) {
            view[i] = byteString.charCodeAt(i);
        }
        return buffer;
    }

    function decodeDataUri(dataUriRegexResult, responseType) {
        responseType = typeof responseType !== 'undefined' ? responseType : '';
        var mimeType = dataUriRegexResult[1];
        var isBase64 = !!dataUriRegexResult[2];
        var data = dataUriRegexResult[3];

        switch (responseType) {
        case '':
        case 'text':
            return decodeDataUriText(isBase64, data);
        case 'arraybuffer':
            return decodeDataUriArrayBuffer(isBase64, data);
        case 'blob':
            var buffer = decodeDataUriArrayBuffer(isBase64, data);
            return new Blob([buffer], {
                type : mimeType
            });
        case 'document':
            var parser = new DOMParser();
            return parser.parseFromString(decodeDataUriText(isBase64, data), mimeType);
        case 'json':
            return JSON.parse(decodeDataUriText(isBase64, data));
        default:
            throw 'Unhandled responseType: ' + responseType;
        }
    }

    var loadWithXhr = function(url, responseType, success, error) {
        var dataUriRegexResult = dataUriRegex.exec(url);
        if (dataUriRegexResult !== null) {
            success(decodeDataUri(dataUriRegexResult, responseType));
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        if (typeof responseType !== 'undefined') {
            xhr.responseType = responseType;
        }

        xhr.onload = function(e) {
            if (xhr.status === 200) {
                success(xhr.response);
            } else {
                error(xhr);
            }
        };

        xhr.onerror = function(e) {
            error(xhr);
        };

        xhr.send();
    };

    /**
     * Asynchronously loads the given URL as raw binary data.  The data is loaded
     * using XMLHttpRequest, which means that in order to make requests to another origin,
     * the server must have Cross-Origin Resource Sharing (CORS) headers enabled.
     *
     * @param {String} url The URL of the binary data.
     * @param {Function} success A function that will be called with an ArrayBuffer object
     *                           once the data has loaded successfully.
     * @param {Function} [error] A function that will be called with the XMLHttpRequest object
     *                           if the request fails.
     *
     * @see <a href="http://en.wikipedia.org/wiki/XMLHttpRequest">XMLHttpRequest</a>
     * @see <a href='http://www.w3.org/TR/cors/'>Cross-Origin Resource Sharing</a>
     */
    var loadArrayBuffer = function(url, success, error) {
        loadWithXhr(url, 'arraybuffer', success, error);
    };

    /**
     * Asynchronously loads the given URL as text.  The data is loaded
     * using XMLHttpRequest, which means that in order to make requests to another origin,
     * the server must have Cross-Origin Resource Sharing (CORS) headers enabled.
     *
     * @param {String} url The URL to request.
     * @param {Function} success A function that will be called with a String
     *                           once the data has loaded successfully.
     * @param {Function} [error] A function that will be called with the XMLHttpRequest object
     *                           if the request fails.
     *
     * @see <a href="http://en.wikipedia.org/wiki/XMLHttpRequest">XMLHttpRequest</a>
     * @see <a href='http://www.w3.org/TR/cors/'>Cross-Origin Resource Sharing</a>
     */
    var loadText = function(url, success, error) {
        return loadWithXhr(url, undefined, success, error);
    };

    return {
        loadImage : loadImage,
        loadArrayBuffer : loadArrayBuffer,
        loadText : loadText
    };
}));


