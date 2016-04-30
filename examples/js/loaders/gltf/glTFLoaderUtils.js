/**
 * @author Tony Parisi / http://www.tonyparisi.com/
 */

THREE.GLTFLoaderUtils = Object.create(Object, {

    // errors
    MISSING_DESCRIPTION: { value: "MISSING_DESCRIPTION" },
    INVALID_PATH: { value: "INVALID_PATH" },
    INVALID_TYPE: { value: "INVALID_TYPE" },
    XMLHTTPREQUEST_STATUS_ERROR: { value: "XMLHTTPREQUEST_STATUS_ERROR" },
    NOT_FOUND: { value: "NOT_FOUND" },
    // misc constants
    ARRAY_BUFFER: { value: "ArrayBuffer" },

    _streams : { value:{}, writable: true },

    _streamsStatus: { value: {}, writable: true },
    
    _resources: { value: {}, writable: true },

    _resourcesStatus: { value: {}, writable: true },

    // initialization
    init: {
        value: function() {
	        this._streams = {};
	        this._streamsStatus = {};
            this._resources = {};
            this._resourcesStatus = {};
        }
    },

    //manage entries
    _containsResource: {
        enumerable: false,
        value: function(resourceID) {
            return this._resources[resourceID] ? true : false;
        }
    },

    _storeResource: {
        enumerable: false,
        value: function(resourceID, resource) {
            if (!resourceID) {
                console.log("ERROR: entry does not contain id, cannot store");
                return;
            }

            if (this._containsResource[resourceID]) {
                console.log("WARNING: resource:"+resourceID+" is already stored, overriding");
            }

           this._resources[resourceID] = resource;
        }
    },

    _getResource: {
        enumerable: false,
        value: function(resourceID) {
            return this._resources[resourceID];
        }
    },

    _loadStream: {
        value: function(path, type, delegate) {



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
                case 'ArrayBuffer':
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

            var dataUriRegexResult = dataUriRegex.exec(path);
            if (dataUriRegexResult !== null) {
                delegate.streamAvailable(path, decodeDataUri(dataUriRegexResult, type));
                return;
            }

            var self = this;

            if (!type) {
                delegate.handleError(THREE.GLTFLoaderUtils.INVALID_TYPE, null);
                return;
            }

            if (!path) {
                delegate.handleError(THREE.GLTFLoaderUtils.INVALID_PATH);
                return;
            }

            var xhr = new XMLHttpRequest();
            xhr.open('GET', path, true);
            xhr.responseType = (type === this.ARRAY_BUFFER) ? "arraybuffer" : "text";

            //if this is not specified, 1 "big blob" scenes fails to load.
            xhr.setRequestHeader("If-Modified-Since", "Sat, 01 Jan 1970 00:00:00 GMT");
            xhr.onload = function(e) {
                if ((xhr.status == 200) || (xhr.status == 206)) {

                    delegate.streamAvailable(path, xhr.response);

                } else {
                    delegate.handleError(THREE.GLTFLoaderUtils.XMLHTTPREQUEST_STATUS_ERROR, this.status);
                }
            };
            xhr.send(null);
        }
    },

    send: { value: 0, writable: true },
    requested: { value: 0, writable: true },

    _handleRequest: {
        value: function(request) {
            var resourceStatus = this._resourcesStatus[request.id];
            if (resourceStatus)
            {
            	this._resourcesStatus[request.id]++;
            }
            else
            {
            	this._resourcesStatus[request.id] = 1;
            }
            
            var streamStatus = this._streamsStatus[request.uri];
            if (streamStatus && streamStatus.status === "loading" )
            {
            	streamStatus.requests.push(request);
                return;
            }
            
            this._streamsStatus[request.uri] = { status : "loading", requests : [request] };
    		
            var self = this;
            var processResourceDelegate = {};

            processResourceDelegate.streamAvailable = function(path, res_) {
            	var streamStatus = self._streamsStatus[path];
            	var requests = streamStatus.requests;
                requests.forEach( function(req_) {
                    var subArray = res_.slice(req_.range[0], req_.range[1]);
                    var convertedResource = req_.delegate.convert(subArray, req_.ctx);
                    self._storeResource(req_.id, convertedResource);
                    req_.delegate.resourceAvailable(convertedResource, req_.ctx);
                    --self._resourcesStatus[req_.id];

                }, this);
            	
                delete self._streamsStatus[path];

            };

            processResourceDelegate.handleError = function(errorCode, info) {
                request.delegate.handleError(errorCode, info);
            }

            this._loadStream(request.uri, request.type, processResourceDelegate);
        }
    },


    _elementSizeForGLType: {
        value: function(componentType, type) {
    	
    		var nElements = 0;
    		switch(type) {    		
	            case "SCALAR" :
	                nElements = 1;
	                break;
	            case "VEC2" :
	                nElements = 2;
	                break;
	            case "VEC3" :
	                nElements = 3;
	                break;
	            case "VEC4" :
	                nElements = 4;
	                break;
	            case "MAT2" :
	                nElements = 4;
	                break;
	            case "MAT3" :
	                nElements = 9;
	                break;
	            case "MAT4" :
	                nElements = 16;
	                break;
	            default :
	            	debugger;
	            	break;
    		}
    		
            switch (componentType) {
                case WebGLRenderingContext.FLOAT :
                    return Float32Array.BYTES_PER_ELEMENT * nElements;
                case WebGLRenderingContext.UNSIGNED_BYTE :
                    return Uint8Array.BYTES_PER_ELEMENT * nElements;
                case WebGLRenderingContext.UNSIGNED_SHORT :
                    return Uint16Array.BYTES_PER_ELEMENT * nElements;
                default :
                	debugger;
                    return null;
            }
        }
    },

    _handleWrappedBufferViewResourceLoading: {
        value: function(wrappedBufferView, delegate, ctx) {
            var bufferView = wrappedBufferView.bufferView;
            var buffer = bufferView.buffer;
            var byteOffset = wrappedBufferView.byteOffset + bufferView.description.byteOffset;
            var range = [byteOffset , (this._elementSizeForGLType(wrappedBufferView.componentType, wrappedBufferView.type) * wrappedBufferView.count) + byteOffset];

            this._handleRequest({   "id" : wrappedBufferView.id,
                                    "range" : range,
                                    "type" : buffer.description.type,
                                    "uri" : buffer.description.uri,
                                    "delegate" : delegate,
                                    "ctx" : ctx }, null);
        }
    },
    
    getBuffer: {
    	
            value: function(wrappedBufferView, delegate, ctx) {

            var savedBuffer = this._getResource(wrappedBufferView.id);
            if (false) { // savedBuffer) {
                return savedBuffer;
            } else {
                this._handleWrappedBufferViewResourceLoading(wrappedBufferView, delegate, ctx);
            }

            return null;
        }
    },

    getFile: {
    	
        value: function(request, delegate, ctx) {

    		request.delegate = delegate;
    		request.ctx = ctx;

            this._handleRequest({   "id" : request.id,
                "uri" : request.uri,
                "range" : [0],
                "type" : "text",
                "delegate" : delegate,
                "ctx" : ctx }, null);
    	
            return null;
	    }
	},    
});
