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









