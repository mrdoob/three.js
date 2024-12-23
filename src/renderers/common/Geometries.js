import DataMap from './DataMap.js';
import { AttributeType } from './Constants.js';

import { Uint16BufferAttribute, Uint32BufferAttribute } from '../../core/BufferAttribute.js';

/**
 * Returns `true` if the given array has values that require an Uint32 array type.
 *
 * @private
 * @function
 * @param {Array<Number>} array - The array to test.
 * @return {Booolean} Whether the given array has values that require an Uint32 array type or not.
 */
function arrayNeedsUint32( array ) {

	// assumes larger values usually on last

	for ( let i = array.length - 1; i >= 0; -- i ) {

		if ( array[ i ] >= 65535 ) return true; // account for PRIMITIVE_RESTART_FIXED_INDEX, #24565

	}

	return false;

}

/**
 * Returns the wireframe version for the given geometry.
 *
 * @private
 * @function
 * @param {BufferGeometry} geometry - The geometry.
 * @return {Number} The versio.
 */
function getWireframeVersion( geometry ) {

	return ( geometry.index !== null ) ? geometry.index.version : geometry.attributes.position.version;

}

/**
 * Returns a wireframe index attribute for the given geometry.
 *
 * @private
 * @function
 * @param {BufferGeometry} geometry - The geometry.
 * @return {BufferAttribute} The wireframe index attribute.
 */
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

/**
 * This renderer module manages geometries.
 *
 * @private
 * @augments DataMap
 */
class Geometries extends DataMap {

	/**
	 * Constructs a new geometry management component.
	 *
	 * @param {Attributes} attributes - Renderer component for managing attributes.
	 * @param {Info} info - Renderer component for managing metrics and monitoring data.
	 */
	constructor( attributes, info ) {

		super();

		/**
		 * Renderer component for managing attributes.
		 *
		 * @type {Attributes}
		 */
		this.attributes = attributes;

		/**
		 * Renderer component for managing metrics and monitoring data.
		 *
		 * @type {Info}
		 */
		this.info = info;

		/**
		 * Weak Map for managing attributes for wireframe rendering.
		 *
		 * @type {WeakMap<BufferGeometry,BufferAttribute>}
		 */
		this.wireframes = new WeakMap();

		/**
		 * This Weak Map is used to make sure buffer attributes are
		 * updated only once per render call.
		 *
		 * @type {WeakMap<BufferAttribute,Number>}
		 */
		this.attributeCall = new WeakMap();

	}

	/**
	 * Returns `true` if the given render object has an initialized geometry.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @return {Boolean} Whether if the given render object has an initialized geometry or not.
	 */
	has( renderObject ) {

		const geometry = renderObject.geometry;

		return super.has( geometry ) && this.get( geometry ).initialized === true;

	}

	/**
	 * Prepares the geometry of the given render object for rendering.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 */
	updateForRender( renderObject ) {

		if ( this.has( renderObject ) === false ) this.initGeometry( renderObject );

		this.updateAttributes( renderObject );

	}

	/**
	 * Initializes the geometry of the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 */
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

	/**
	 * Updates the geometry attributes of the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 */
	updateAttributes( renderObject ) {

		// attributes

		const attributes = renderObject.getAttributes();

		for ( const attribute of attributes ) {

			if ( attribute.isStorageBufferAttribute || attribute.isStorageInstancedBufferAttribute ) {

				this.updateAttribute( attribute, AttributeType.STORAGE );

			} else {

				this.updateAttribute( attribute, AttributeType.VERTEX );

			}

		}

		// indexes

		const index = this.getIndex( renderObject );

		if ( index !== null ) {

			this.updateAttribute( index, AttributeType.INDEX );

		}

		// indirect

		const indirect = renderObject.geometry.indirect;

		if ( indirect !== null ) {

			this.updateAttribute( indirect, AttributeType.INDIRECT );

		}

	}

	/**
	 * Updates the given attribute.
	 *
	 * @param {BufferAttribute} attribute - The attribute to update.
	 * @param {Number} type - The attribute type.
	 */
	updateAttribute( attribute, type ) {

		const callId = this.info.render.calls;

		if ( ! attribute.isInterleavedBufferAttribute ) {

			if ( this.attributeCall.get( attribute ) !== callId ) {

				this.attributes.update( attribute, type );

				this.attributeCall.set( attribute, callId );

			}

		} else {

			if ( this.attributeCall.get( attribute ) === undefined ) {

				this.attributes.update( attribute, type );

				this.attributeCall.set( attribute, callId );

			} else if ( this.attributeCall.get( attribute.data ) !== callId ) {

				this.attributes.update( attribute, type );

				this.attributeCall.set( attribute.data, callId );

				this.attributeCall.set( attribute, callId );

			}

		}

	}

	/**
	 * Returns the indirect buffer attribute of the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @return {BufferAttribute?} The indirect attribute. `null` if no indirect drawing is used.
	 */
	getIndirect( renderObject ) {

		return renderObject.geometry.indirect;

	}

	/**
	 * Returns the index of the given render object's geometry. This is implemented
	 * in a method to return a wireframe index if necessary.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @return {BufferAttribute?} The index. Returns `null` for non-indexed geometries.
	 */
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
