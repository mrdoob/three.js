/**
 * @author fernandojsg / http://fernandojsg.com
 */

import { WebGLConstants } from './WebGLConstants';

var THREE_TO_WEBGL = {
	// @TODO Replace with computed property name [THREE.*] when available on es6
	1003: WebGLConstants.NEAREST,
	1004: WebGLConstants.LINEAR,
	1005: WebGLConstants.NEAREST_MIPMAP_NEAREST,
	1006: WebGLConstants.LINEAR_MIPMAP_NEAREST,
	1007: WebGLConstants.NEAREST_MIPMAP_LINEAR,
	1008: WebGLConstants.LINEAR_MIPMAP_LINEAR
 };

 export { THREE_TO_WEBGL };
