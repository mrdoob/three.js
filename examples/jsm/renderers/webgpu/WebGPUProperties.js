class WebGPUProperties {

	constructor() {

		this.properties = new WeakMap();

	}

	get( object ) {

		let map = this.properties.get( object );

		if ( map === undefined ) {

			map = {};
			this.properties.set( object, map );

		}

		return map;

	}

	remove( object ) {

		this.properties.delete( object );

	}

	dispose() {

		this.properties = new WeakMap();

	}

}

export default WebGPUProperties;
