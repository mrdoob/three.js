import DataMap from './DataMap.js';
import { AttributeType } from './Constants.js';
import { Uint32BufferAttribute, Uint16BufferAttribute } from 'three';

function arrayNeedsUint32( array ) {

	// assumes larger values usually on last

	for ( let i = array.length - 1; i >= 0; -- i ) {

		if ( array[ i ] >= 65535 ) return true; // account for PRIMITIVE_RESTART_FIXED_INDEX, #24565

	}

	return false;

}

function getWireframeVersion( geometry ) {

	return ( geometry.index !== null ) ? geometry.index.version : geometry.attributes.position.version;

}

function getWireframeIndex( geometry ) {

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
	attribute.version = getWireframeVersion( geometry );

	return attribute;

}

class Geometries extends DataMap {

	constructor( attributes, info ) {

		super();

		this.attributes = attributes;
		this.info = info;

		this.wireframes = new WeakMap();
		this.attributeCall = new WeakMap();

	}

	has( renderObject ) {

		const geometry = renderObject.geometry;

		return super.has( geometry ) && this.get( geometry ).initialized === true;

	}

	updateForRender( renderObject ) {

		if ( this.has( renderObject ) === false ) this.initGeometry( renderObject );

		this.updateAttributes( renderObject );

	}

	initGeometry( renderObject ) {

		const geometry = renderObject.geometry;
		const geometryData = this.get( geometry );

		geometryData.initialized = true;

		this.info.memory.geometries ++;

		const onDispose = () => {

			this.info.memory.geometries --;

			const index = geometry.index;
			const geometryAttributes = renderObject.getAttributes();

			if ( index !== null ) {

				this.attributes.delete( index );

			}

			for ( const geometryAttribute of geometryAttributes ) {

				this.attributes.delete( geometryAttribute );

			}

			const wireframeAttribute = this.wireframes.get( geometry );

			if ( wireframeAttribute !== undefined ) {

				this.attributes.delete( wireframeAttribute );

			}

			geometry.removeEventListener( 'dispose', onDispose );

		};

		geometry.addEventListener( 'dispose', onDispose );

	}

	updateAttributes( renderObject ) {

		const attributes = renderObject.getAttributes();

		for ( const attribute of attributes ) {

			this.updateAttribute( attribute, AttributeType.VERTEX );

		}

		const index = this.getIndex( renderObject );

		if ( index !== null ) {

			this.updateAttribute( index, AttributeType.INDEX );

		}

	}

	updateAttribute( attribute, type ) {

		const callId = this.info.render.calls;

		if ( this.attributeCall.get( attribute ) !== callId ) {

			this.attributes.update( attribute, type );

			this.attributeCall.set( attribute, callId );

		}

	}

	getIndex( renderObject ) {

		const { geometry, material } = renderObject;

		let index = geometry.index;

		if ( material.wireframe === true ) {

			const wireframes = this.wireframes;

			let wireframeAttribute = wireframes.get( geometry );

			if ( wireframeAttribute === undefined ) {

				wireframeAttribute = getWireframeIndex( geometry );

				wireframes.set( geometry, wireframeAttribute );

			} else if ( wireframeAttribute.version !== getWireframeVersion( geometry ) ) {

				this.attributes.delete( wireframeAttribute );

				wireframeAttribute = getWireframeIndex( geometry );

				wireframes.set( geometry, wireframeAttribute );

			}

			index = wireframeAttribute;

		}

		return index;

	}

}

export default Geometries;
