/**
 * @author fordacious / fordacious.github.io
 */

class WebGLProperties {

	constructor() {

		this.properties = new WeakMap();

	}

	get( object ) {

		var map = this.properties.get( object );

		if ( map === undefined ) {

			map = {};
			this.properties.set( object, map );

		}

		return map;

	}

	remove( object ) {

		this.properties.delete( object );

	}

	update( object, key, value ) {

		this.properties.get( object )[ key ] = value;

	}

	dispose() {

		this.properties = new WeakMap();

	}

}


export { WebGLProperties };
