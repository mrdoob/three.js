import WebGPUWeakMap from './WebGPUWeakMap.js';
import WebGPURenderObject from './WebGPURenderObject.js';
import { PerspectiveCamera, OrthographicCamera } from 'three';

const dummyCameras = {
	PerspectiveCamera: new PerspectiveCamera(),
	OrthographicCamera: new OrthographicCamera()
};

function getChainKeys( object, material, scene, camera, lightsNode ) {

	// use dummy camera for optimize cache in case of use others cameras with the same type
	return [ object, material, scene, dummyCameras[ camera.type ], lightsNode ];

}

class WebGPURenderObjects {

	constructor( renderer, properties, geometries, info ) {

		this.renderer = renderer;
		this.properties = properties;
		this.geometries = geometries;
		this.info = info;

		this.cache = new WebGPUWeakMap();

	}

	get( object, material, scene, camera, lightsNode ) {

		const chainKey = getChainKeys( object, material, scene, camera, lightsNode );

		let renderObject = this.cache.get( chainKey );

		if ( renderObject === undefined ) {

			renderObject = new WebGPURenderObject( this.renderer, this.properties, object, material, scene, camera, lightsNode );

			this.cache.set( chainKey, renderObject );

		}

		return renderObject;

	}

	remove( object, material, scene, camera, lightsNode ) {

		const chainKey = getChainKeys( object, material, scene, camera, lightsNode );

		this.cache.delete( chainKey );

	}

	dispose() {

		this.cache = new WebGPUWeakMap();
		this.updateMap = new WeakMap();

	}

}

export default WebGPURenderObjects;
