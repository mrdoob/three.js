import { hashString } from '../../nodes/core/NodeUtils.js';

function getKeys( obj ) {

	const keys = Object.keys( obj );

	let proto = Object.getPrototypeOf( obj );

	while ( proto ) {

		const descriptors = Object.getOwnPropertyDescriptors( proto );

		for ( const key in descriptors ) {

			if ( descriptors[ key ] !== undefined ) {

				const descriptor = descriptors[ key ];

				if ( descriptor && typeof descriptor.get === 'function' ) {

					keys.push( key );

				}

			}

		}

		proto = Object.getPrototypeOf( proto );

	}

	return keys;

}

export function getGeometryCacheKey( geometry ) {

	let cacheKey = '';

	for ( const name of Object.keys( geometry.attributes ).sort() ) {

		const attribute = geometry.attributes[ name ];

		cacheKey += name + ',';

		if ( attribute.data ) cacheKey += attribute.data.stride + ',';
		if ( attribute.offset ) cacheKey += attribute.offset + ',';
		if ( attribute.itemSize ) cacheKey += attribute.itemSize + ',';
		if ( attribute.normalized ) cacheKey += 'n,';

	}

	// structural equality isn't sufficient for morph targets since the
	// data are maintained in textures. only if the targets are all equal
	// the texture and thus the instance of `MorphNode` can be shared.

	for ( const name of Object.keys( geometry.morphAttributes ).sort() ) {

		const targets = geometry.morphAttributes[ name ];

		cacheKey += 'morph-' + name + ',';

		for ( let i = 0, l = targets.length; i < l; i ++ ) {

			const attribute = targets[ i ];

			cacheKey += attribute.id + ',';

		}

	}

	if ( geometry.index ) {

		cacheKey += 'index,';

	}

	return cacheKey;


}

export function getProgramCacheKey( object, material, renderer, context, clippingContext = null ) {

	let cacheKey = material.customProgramCacheKey();

	for ( const property of getKeys( material ) ) {

		if ( /^(is[A-Z]|_)|^(visible|version|uuid|name|opacity|userData)$/.test( property ) ) continue;

		const value = material[ property ];

		let valueKey;

		if ( value !== null ) {

			// some material values require a formatting

			const type = typeof value;

			if ( type === 'number' ) {

				valueKey = value !== 0 ? '1' : '0'; // Convert to on/off, important for clearcoat, transmission, etc

			} else if ( type === 'object' ) {

				valueKey = '{';

				if ( value.isTexture ) {

					valueKey += value.mapping;

					// WebGPU must honor the sampler data because they are part of the bindings

					if ( renderer.backend.isWebGPUBackend === true ) {

						valueKey += value.magFilter;
						valueKey += value.minFilter;
						valueKey += value.wrapS;
						valueKey += value.wrapT;
						valueKey += value.wrapR;

					}

				}

				valueKey += '}';

			} else {

				valueKey = String( value );

			}

		} else {

			valueKey = String( value );

		}

		cacheKey += /*property + ':' +*/ valueKey + ',';

	}

	if ( clippingContext !== null ) {

		cacheKey += clippingContext.cacheKey + ',';

	}

	if ( object.geometry ) {

		cacheKey += getGeometryCacheKey( object.geometry );

	}

	if ( object.skeleton ) {

		cacheKey += object.skeleton.bones.length + ',';

	}

	if ( object.isBatchedMesh ) {

		cacheKey += object._matricesTexture.uuid + ',';

		if ( object._colorsTexture !== null ) {

			cacheKey += object._colorsTexture.uuid + ',';

		}

	}

	if ( object.isInstancedMesh || object.count > 1 || Array.isArray( object.morphTargetInfluences ) ) {

		// TODO: https://github.com/mrdoob/three.js/pull/29066#issuecomment-2269400850

		cacheKey += object.uuid + ',';

	}

	cacheKey += context.id + ',';

	cacheKey += object.receiveShadow + ',';

	return hashString( cacheKey );

}
