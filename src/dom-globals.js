let _Blob;
let _atob;
let _btoa;
let _DOMParser;
let _document;
let _XMLHttpRequest;
let _TextEncoder;
let _TextDecoder;
let _decodeURIComponent;
let _CustomEvent;
let _WebGLRenderingContext;
let _WebGL2RenderingContext;
let _innerWidth;
let _innerHeight;
let _DeviceOrientationEvent;
let _orientation;
let _addEventListener;
let _removeEventListener;
let _focus;
let _pageXOffset;
let _pageYOffset;
let _FileReader;
let _URL;
let _ActiveXObject;

function defineGlobals() {

	try {

		_Blob = window.Blob;
		_atob = window.atob;
		_btoa = window.btoa;
		_DOMParser = window.DOMParser;
		_document = window.document;
		_XMLHttpRequest = window.XMLHttpRequest;
		_TextEncoder = window.TextEncoder;
		_TextDecoder = window.TextDecoder;
		_decodeURIComponent = window.decodeURIComponent;
		_CustomEvent = window.CustomEvent;
		_WebGLRenderingContext = window.WebGLRenderingContext;
		_WebGL2RenderingContext = window.WebGL2RenderingContext;
		_innerWidth = window.innerWidth;
		_innerHeight = window.innerHeight;
		_DeviceOrientationEvent = window.DeviceOrientationEvent;
		_orientation = window.orientation;
		_addEventListener = window.addEventListener;
		_removeEventListener = window.removeEventListener;
		_focus = window.focus;
		_pageXOffset = window.pageXOffset;
		_pageYOffset = window.pageYOffset;
		_FileReader = window.FileReader;
		_URL = window.URL;
		_ActiveXObject = window.ActiveXObject;

	} catch ( e ) { }

}

defineGlobals();

export const Blob = _Blob;
export const atob = _atob;
export const btoa = _btoa;
export const DOMParser = _DOMParser;
export const document = _document;
export const XMLHttpRequest = _XMLHttpRequest;
export const TextEncoder = _TextEncoder;
export const TextDecoder = _TextDecoder;
export const decodeURIComponent = _decodeURIComponent;
export const CustomEvent = _CustomEvent;
export const WebGLRenderingContext = _WebGLRenderingContext;
export const WebGL2RenderingContext = _WebGL2RenderingContext;
export const innerWidth = _innerWidth;
export const innerHeight = _innerHeight;
export const DeviceOrientationEvent = _DeviceOrientationEvent;
export const orientation = _orientation;
export const addEventListener = _addEventListener;
export const removeEventListener = _removeEventListener;
export const focus = _focus;
export const pageXOffset = _pageXOffset;
export const pageYOffset = _pageYOffset;
export const FileReader = _FileReader;
export const URL = _URL;
export const ActiveXObject = _ActiveXObject;
