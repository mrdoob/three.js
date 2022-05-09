import { BufferGeometry } from './core/BufferGeometry.js';
import { Material } from './materials/Material.js';
import { Euler } from './math/Euler.js';
import { WebGLRenderer } from './renderers/WebGLRenderer.js';
import { WebGLRenderTarget } from './renderers/WebGLRenderTarget.js';
import { DataArrayTexture } from './textures/DataArrayTexture.js';
import { Data3DTexture } from './textures/Data3DTexture.js';

// r138, 02cf0df1cb4575d5842fef9c85bb5a89fe020d53

Euler.prototype.toVector3 = function () {

	console.error( 'THREE.Euler: .toVector3() has been removed. Use Vector3.setFromEuler() instead' );

};

//

Object.defineProperties( Material.prototype, {

	// r131, f5803c62cc4a29d90744e9dc7811d086e354c1d8

	vertexTangents: {
		get: function () {

			console.warn( 'THREE.' + this.type + ': .vertexTangents has been removed.' );

		},
		set: function () {

			console.warn( 'THREE.' + this.type + ': .vertexTangents has been removed.' );

		}
	},

} );

Object.defineProperties( WebGLRenderer.prototype, {

	// r136, 0e21088102b4de7e0a0a33140620b7a3424b9e6d

	gammaFactor: {
		get: function () {

			console.warn( 'THREE.WebGLRenderer: .gammaFactor has been removed.' );
			return 2;

		},
		set: function () {

			console.warn( 'THREE.WebGLRenderer: .gammaFactor has been removed.' );

		}
	}

} );

// r133, c5bb5434555a3c3ddd784944a0a124f996fc721b

export class ParametricGeometry extends BufferGeometry {

	constructor() {

		console.error( 'THREE.ParametricGeometry has been moved to /examples/jsm/geometries/ParametricGeometry.js' );
		super();

	}

}

// r133, eb58ff153119090d3bbb24474ea0ffc40c70dc92

export class TextGeometry extends BufferGeometry {

	constructor() {

		console.error( 'THREE.TextGeometry has been moved to /examples/jsm/geometries/TextGeometry.js' );
		super();

	}

}

// r133, eb58ff153119090d3bbb24474ea0ffc40c70dc92

export function FontLoader() {

	console.error( 'THREE.FontLoader has been moved to /examples/jsm/loaders/FontLoader.js' );

}

// r133, eb58ff153119090d3bbb24474ea0ffc40c70dc92

export function Font() {

	console.error( 'THREE.Font has been moved to /examples/jsm/loaders/FontLoader.js' );

}

// r134, d65e0af06644fe5a84a6fc0e372f4318f95a04c0

export function ImmediateRenderObject() {

	console.error( 'THREE.ImmediateRenderObject has been removed.' );

}

// r138, 48b05d3500acc084df50be9b4c90781ad9b8cb17

export class WebGLMultisampleRenderTarget extends WebGLRenderTarget {

	constructor( width, height, options ) {

		console.error( 'THREE.WebGLMultisampleRenderTarget has been removed. Use a normal render target and set the "samples" property to greater 0 to enable multisampling.' );
		super( width, height, options );
		this.samples = 4;

	}

}

// r138, f9cd9cab03b7b64244e304900a3a2eeaa3a588ce

export class DataTexture2DArray extends DataArrayTexture {

	constructor( data, width, height, depth ) {

		console.warn( 'THREE.DataTexture2DArray has been renamed to DataArrayTexture.' );
		super( data, width, height, depth );

	}

}

// r138, f9cd9cab03b7b64244e304900a3a2eeaa3a588ce

export class DataTexture3D extends Data3DTexture {

	constructor( data, width, height, depth ) {

		console.warn( 'THREE.DataTexture3D has been renamed to Data3DTexture.' );
		super( data, width, height, depth );

	}

}
