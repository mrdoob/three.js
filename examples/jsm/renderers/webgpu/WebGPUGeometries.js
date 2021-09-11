class WebGPUGeometries {

	constructor( attributes, info ) {

		this.attributes = attributes;
		this.info = info;

		this.geometries = new WeakMap();

	}

	update( geometry ) {

		if ( this.geometries.has( geometry ) === false ) {

			const disposeCallback = onGeometryDispose.bind( this );

			this.geometries.set( geometry, disposeCallback );

			this.info.memory.geometries ++;

			geometry.addEventListener( 'dispose', disposeCallback );

		}

		const geometryAttributes = geometry.attributes;

		for ( const name in geometryAttributes ) {

			this.attributes.update( geometryAttributes[ name ] );

		}

		const index = geometry.index;

		if ( index !== null ) {

			this.attributes.update( index, true );

		}

	}

}

function onGeometryDispose( event ) {

	const geometry = event.target;
	const disposeCallback = this.geometries.get( geometry );

	this.geometries.delete( geometry );

	this.info.memory.geometries --;

	geometry.removeEventListener( 'dispose', disposeCallback );

	//

	const index = geometry.index;
	const geometryAttributes = geometry.attributes;

	if ( index !== null ) {

		this.attributes.remove( index );

	}

	for ( const name in geometryAttributes ) {

		this.attributes.remove( geometryAttributes[ name ] );

	}

}

export default WebGPUGeometries;
