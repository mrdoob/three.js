import { createWireframeIndexBufferAttribute, getWireframeRangeKey } from '../common/WireframeIndexUtils.js';

function WebGLGeometries( gl, attributes, info, bindingStates ) {

	const geometries = {};
	const wireframeAttributes = new WeakMap();

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

	function get( object, geometry ) {

		if ( geometries[ geometry.id ] === true ) return geometry;

		geometry.addEventListener( 'dispose', onGeometryDispose );

		geometries[ geometry.id ] = true;

		info.memory.geometries ++;

		return geometry;

	}

	function update( geometry ) {

		const geometryAttributes = geometry.attributes;

		// Updating index buffer in VAO now. See WebGLBindingStates.

		for ( const name in geometryAttributes ) {

			attributes.update( geometryAttributes[ name ], gl.ARRAY_BUFFER );

		}

	}

	function updateWireframeAttribute( geometry ) {

		const geometryPosition = geometry.attributes.position;
		if ( geometryPosition === undefined ) {

			return;

		}

		const version = geometry.index !== null ? geometry.index.version : geometryPosition.version;

		const attribute = createWireframeIndexBufferAttribute( geometry );
		if ( attribute === null ) return;

		attribute.version = version;
		attribute.__rangeKey = getWireframeRangeKey( geometry );

		// Updating index buffer in VAO now. See WebGLBindingStates

		//

		const previousAttribute = wireframeAttributes.get( geometry );

		if ( previousAttribute ) attributes.remove( previousAttribute );

		//

		wireframeAttributes.set( geometry, attribute );

	}

	function getWireframeAttribute( geometry ) {

		const currentAttribute = wireframeAttributes.get( geometry );

		if ( currentAttribute ) {

			const geometryIndex = geometry.index;
			const geometryPosition = geometry.attributes.position;

			let needsUpdate = false;
			if ( geometryIndex !== null ) {

				if ( currentAttribute.version < geometryIndex.version ) needsUpdate = true;

			} else if ( geometryPosition !== undefined ) {

				if ( currentAttribute.version < geometryPosition.version ) needsUpdate = true;

			}

			if ( currentAttribute.__rangeKey !== getWireframeRangeKey( geometry ) ) needsUpdate = true;

			if ( needsUpdate ) updateWireframeAttribute( geometry );

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
