class WebGPUObjects {

	constructor( geometries, info ) {

		this.geometries = geometries;
		this.info = info;

		this.updateMap = new WeakMap();

	}

	update( object ) {

		const geometry = object.geometry;
		const updateMap = this.updateMap;
		const frame = this.info.render.frame;

		if ( geometry.isGeometry ) {

			throw 'THREE.WebGPURenderer: Geometries of type THREE.Geometry are not supported. Please use BufferGeometry.';

		}

		if ( updateMap.get( geometry ) !== frame ) {

			this.geometries.update( geometry );

			updateMap.set( geometry, frame );

		}

	}

	dispose() {

		this.updateMap = new WeakMap();

	}

}

export default WebGPUObjects;
