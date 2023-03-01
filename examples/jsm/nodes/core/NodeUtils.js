import { Color, Matrix3, Matrix4, Vector2, Vector3, Vector4 } from 'three';

export function getCacheKey( object )  {

	let cacheKey = '{';

	if ( object.isNode === true ) {

		cacheKey += `uuid:"${ object.uuid }"`;

	}

	for ( const { property, index, childNode } of getNodeChildren( object ) ) {

		// @TODO: Think about implement NodeArray and NodeObject.

		let childCacheKey = getCacheKey( childNode );
		if ( ! childCacheKey.includes( ',' ) ) childCacheKey = childCacheKey.slice( childCacheKey.indexOf( '"' ), childCacheKey.indexOf( '}' ) );
		cacheKey += `,${ property }${ index !== undefined ? '/' + index : '' }:${ childCacheKey }`;

	}

	cacheKey += '}';

	return cacheKey;

}

export function* getNodeChildren( node ) {

	for ( const property in node ) {

		const object = node[ property ];

		if ( Array.isArray( object ) === true ) {

			for ( let i = 0; i < object.length; i++ ) {

				const child = object[ i ];

				if ( child && child.isNode === true ) {

					yield { property, index: i, childNode: child };

				}

			}

		} else if ( object && object.isNode === true ) {

			yield { property, childNode: object };

		} else if ( typeof object === 'object' ) {

			for ( const subProperty in object ) {

				const child = object[ subProperty ];

				if ( child && child.isNode === true ) {

					yield { property, index: subProperty, childNode: child };

				}

			}

		}

	}

}

export function getValueType( value ) {

	if ( typeof value === 'number' ) {

		return 'float';

	} else if ( typeof value === 'boolean' ) {

		return 'bool';

	} else if ( value && value.isVector2 === true ) {

		return 'vec2';

	} else if ( value && value.isVector3 === true ) {

		return 'vec3';

	} else if ( value && value.isVector4 === true ) {

		return 'vec4';

	} else if ( value && value.isMatrix3 === true ) {

		return 'mat3';

	} else if ( value && value.isMatrix4 === true ) {

		return 'mat4';

	} else if ( value && value.isColor === true ) {

		return 'color';

	}

	return null;

}

export function getValueFromType( type, ...params ) {

	const last4 = type ? type.slice( - 4 ) : undefined;

	if ( type === 'color' ) {

		return new Color( ...params );

	} else if ( last4 === 'vec2' ) {

		return new Vector2( ...params );

	} else if ( last4 === 'vec3' ) {

		return new Vector3( ...params );

	} else if ( last4 === 'vec4' ) {

		return new Vector4( ...params );

	} else if ( last4 === 'mat3' ) {

		return new Matrix3( ...params );

	} else if ( last4 === 'mat4' ) {

		return new Matrix4( ...params );

	} else if ( type === 'bool' ) {

		return params[ 0 ] || false;

	} else if ( ( type === 'float' ) || ( type === 'int' ) || ( type === 'uint' ) ) {

		return params[ 0 ] || 0;

	}

	return null;

}
