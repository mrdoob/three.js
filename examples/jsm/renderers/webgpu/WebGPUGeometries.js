import { Uint32BufferAttribute, Uint16BufferAttribute } from 'three';

function arrayNeedsUint32( array ) {

	// assumes larger values usually on last

	for ( let i = array.length - 1; i >= 0; -- i ) {

		if ( array[ i ] >= 65535 ) return true; // account for PRIMITIVE_RESTART_FIXED_INDEX, #24565

	}

	return false;

}

class WebGPUGeometries {

	constructor( attributes, info ) {

		this.attributes = attributes;
		this.info = info;

		this.geometries = new WeakMap();
		this.wireframeGeometries = new WeakMap();

	}

	has( geometry ) {

		return this.geometries.has( geometry );

	}

	update( geometry, wireframe = false ) {

		const { geometries, attributes, info } = this;

		if ( geometries.has( geometry ) === false ) {

			const disposeCallback = onGeometryDispose.bind( this );

			geometries.set( geometry, disposeCallback );

			info.memory.geometries ++;

			geometry.addEventListener( 'dispose', disposeCallback );

		}

		const geometryAttributes = geometry.attributes;

		for ( const name in geometryAttributes ) {

			attributes.update( geometryAttributes[ name ] );

		}

		const index = this.getIndex( geometry, wireframe );

		if ( index !== null ) {

			attributes.update( index, true );

		}

	}

	getIndex( geometry, wireframe = false ) {

		let index = geometry.index;

		if ( wireframe ) {

			const wireframeGeometries = this.wireframeGeometries;

			let wireframeAttribute = wireframeGeometries.get( geometry );

			if ( wireframeAttribute === undefined ) {

				wireframeAttribute = this.getWireframeIndex( geometry );

				wireframeGeometries.set( geometry, wireframeAttribute );

			} else if ( wireframeAttribute.version !== this.getWireframeVersion( geometry ) ) {

				this.attributes.remove( wireframeAttribute );

				wireframeAttribute = this.getWireframeIndex( geometry );

				wireframeGeometries.set( geometry, wireframeAttribute );

			}

			index = wireframeAttribute;

		}

		return index;

	}

	getWireframeIndex( geometry ) {

		const indices = [];

		const geometryIndex = geometry.index;
		const geometryPosition = geometry.attributes.position;

		if ( geometryIndex !== null ) {

			const array = geometryIndex.array;

			for ( let i = 0, l = array.length; i < l; i += 3 ) {

				const a = array[ i + 0 ];
				const b = array[ i + 1 ];
				const c = array[ i + 2 ];

				indices.push( a, b, b, c, c, a );

			}

		} else {

			const array = geometryPosition.array;

			for ( let i = 0, l = ( array.length / 3 ) - 1; i < l; i += 3 ) {

				const a = i + 0;
				const b = i + 1;
				const c = i + 2;

				indices.push( a, b, b, c, c, a );

			}

		}

		const attribute = new ( arrayNeedsUint32( indices ) ? Uint32BufferAttribute : Uint16BufferAttribute )( indices, 1 );
		attribute.version = this.getWireframeVersion( geometry );

		return attribute;

	}

	getWireframeVersion( geometry ) {

		return ( geometry.index !== null ) ? geometry.index.version : geometry.attributes.position.version;

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
