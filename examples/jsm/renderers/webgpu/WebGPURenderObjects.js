import WebGPUWeakMap from './WebGPUWeakMap.js';
import WebGPURenderObject from './WebGPURenderObject.js';

class WebGPURenderObjects {

	constructor( renderer, nodes, geometries, info ) {

		this.renderer = renderer;
		this.nodes = nodes;
		this.geometries = geometries;
		this.info = info;

		this.cache = new WebGPUWeakMap();

	}

	get( object, material, scene, camera, lightsNode ) {

		const chainKey = [ object, material, scene, camera, lightsNode ];

		let renderObject = this.cache.get( chainKey );

		if ( renderObject === undefined ) {

			renderObject = new WebGPURenderObject( this.renderer, this.nodes, object, material, scene, camera, lightsNode );

			this.cache.set( chainKey, renderObject );

		}

		return renderObject;

	}

	remove( object, material, scene, camera, lightsNode ) {

		this.cache.delete( [ object, material, scene, camera, lightsNode ] );

	}

	dispose() {

		this.cache = new WebGPUWeakMap();
		this.updateMap = new WeakMap();

	}

}

export default WebGPURenderObjects;
