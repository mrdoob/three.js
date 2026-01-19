import { Uint16BufferAttribute, Uint32BufferAttribute } from '../../core/BufferAttribute.js';
import { arrayNeedsUint32 } from '../../utils.js';

/**
 * Manages WebGL geometry resources, including geometry registration, updates, and wireframe attribute generation.
 * This class handles the lifecycle of geometries in the WebGL renderer, tracking them for proper cleanup
 * and managing wireframe rendering attributes.
 *
 * @private
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl - The WebGL rendering context.
 * @param {WebGLAttributes} attributes - The WebGL attributes manager for buffer management.
 * @param {WebGLInfo} info - The WebGL info object for tracking memory usage.
 * @param {WebGLBindingStates} bindingStates - The WebGL binding states manager for VAO management.
 */
function WebGLGeometries( gl, attributes, info, bindingStates ) {

	const geometries = {};
	const wireframeAttributes = new WeakMap();

	/**
	 * Handles geometry disposal events, cleaning up associated WebGL resources.
	 * This function is called when a geometry is disposed, ensuring all buffers,
	 * attributes, and binding states are properly released.
	 *
	 * @private
	 * @param {Event} event - The dispose event containing the geometry as event.target.
	 */
	function onGeometryDispose( event ) {

		const geometry = event.target;

		if ( geometry.index !== null ) {

			attributes.remove( geometry.index );

		}

		for ( const name in geometry.attributes ) {

			attributes.remove( geometry.attributes[ name ] );

		}

		geometry.removeEventListener( 'dispose', onGeometryDispose );

		delete geometries[ geometry.id ];

		const attribute = wireframeAttributes.get( geometry );

		if ( attribute ) {

			attributes.remove( attribute );
			wireframeAttributes.delete( geometry );

		}

		bindingStates.releaseStatesOfGeometry( geometry );

		if ( geometry.isInstancedBufferGeometry === true ) {

			delete geometry._maxInstanceCount;

		}

		//

		info.memory.geometries --;

	}

	/**
	 * Registers a geometry with the WebGL renderer and sets up disposal handling.
	 * If the geometry is already registered, it returns immediately. Otherwise,
	 * it registers the geometry, increments the memory counter, and sets up
	 * the disposal event listener.
	 *
	 * @private
	 * @param {Object3D} object - The 3D object containing the geometry (currently unused but kept for API consistency).
	 * @param {BufferGeometry} geometry - The geometry to register.
	 * @return {BufferGeometry} The registered geometry.
	 */
	function get( object, geometry ) {

		if ( geometries[ geometry.id ] === true ) return geometry;

		geometry.addEventListener( 'dispose', onGeometryDispose );

		geometries[ geometry.id ] = true;

		info.memory.geometries ++;

		return geometry;

	}

	/**
	 * Updates all attributes of a geometry in the WebGL context.
	 * This function iterates through all geometry attributes and updates
	 * their corresponding WebGL buffers. The index buffer is handled separately
	 * in WebGLBindingStates.
	 *
	 * @private
	 * @param {BufferGeometry} geometry - The geometry whose attributes should be updated.
	 */
	function update( geometry ) {

		const geometryAttributes = geometry.attributes;

		// Updating index buffer in VAO now. See WebGLBindingStates.

		for ( const name in geometryAttributes ) {

			attributes.update( geometryAttributes[ name ], gl.ARRAY_BUFFER );

		}

	}

	/**
	 * Generates or updates wireframe attributes for a geometry.
	 * Creates line segments from triangle indices or position data to enable
	 * wireframe rendering. The function handles both indexed and non-indexed geometries,
	 * automatically selecting the appropriate buffer type (Uint16 or Uint32) based on
	 * the maximum index value.
	 *
	 * @private
	 * @param {BufferGeometry} geometry - The geometry to generate wireframe attributes for.
	 */
	function updateWireframeAttribute( geometry ) {

		const indices = [];

		const geometryIndex = geometry.index;
		const geometryPosition = geometry.attributes.position;
		let version = 0;

		if ( geometryIndex !== null ) {

			const array = geometryIndex.array;
			version = geometryIndex.version;

			for ( let i = 0, l = array.length; i < l; i += 3 ) {

				const a = array[ i + 0 ];
				const b = array[ i + 1 ];
				const c = array[ i + 2 ];

				indices.push( a, b, b, c, c, a );

			}

		} else if ( geometryPosition !== undefined ) {

			const array = geometryPosition.array;
			version = geometryPosition.version;

			for ( let i = 0, l = ( array.length / 3 ) - 1; i < l; i += 3 ) {

				const a = i + 0;
				const b = i + 1;
				const c = i + 2;

				indices.push( a, b, b, c, c, a );

			}

		} else {

			return;

		}

		const attribute = new ( arrayNeedsUint32( indices ) ? Uint32BufferAttribute : Uint16BufferAttribute )( indices, 1 );
		attribute.version = version;

		// Updating index buffer in VAO now. See WebGLBindingStates

		//

		const previousAttribute = wireframeAttributes.get( geometry );

		if ( previousAttribute ) attributes.remove( previousAttribute );

		//

		wireframeAttributes.set( geometry, attribute );

	}

	/**
	 * Retrieves the wireframe attribute for a geometry, creating it if necessary.
	 * This function checks if a wireframe attribute exists and is up-to-date.
	 * If the geometry's index has been updated since the wireframe attribute was created,
	 * it regenerates the attribute. Otherwise, it returns the cached attribute.
	 *
	 * @private
	 * @param {BufferGeometry} geometry - The geometry to get wireframe attributes for.
	 * @return {BufferAttribute|null} The wireframe attribute, or null if the geometry has no valid data.
	 */
	function getWireframeAttribute( geometry ) {

		const currentAttribute = wireframeAttributes.get( geometry );

		if ( currentAttribute ) {

			const geometryIndex = geometry.index;

			if ( geometryIndex !== null ) {

				// if the attribute is obsolete, create a new one

				if ( currentAttribute.version < geometryIndex.version ) {

					updateWireframeAttribute( geometry );

				}

			}

		} else {

			updateWireframeAttribute( geometry );

		}

		return wireframeAttributes.get( geometry );

	}

	return {

		get: get,
		update: update,

		getWireframeAttribute: getWireframeAttribute

	};

}


export { WebGLGeometries };
