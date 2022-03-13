import { Color, Matrix3, Matrix4, Vector2, Vector3, Vector4 } from 'three';

export const getNodesKeys = ( object ) => {

	const props = [];

	for ( const name in object ) {

		const value = object[ name ];

		if ( value && value.isNode === true ) {

			props.push( name );

		}

	}

	return props;

};

export const getValueType = ( value ) => {

	if ( typeof value === 'number' ) {

		return 'float';

	} else if ( typeof value === 'boolean' ) {

		return 'bool';

	} else if ( value?.isVector2 === true ) {

		return 'vec2';

	} else if ( value?.isVector3 === true ) {

		return 'vec3';

	} else if ( value?.isVector4 === true ) {

		return 'vec4';

	} else if ( value?.isMatrix3 === true ) {

		return 'mat3';

	} else if ( value?.isMatrix4 === true ) {

		return 'mat4';

	} else if ( value?.isColor === true ) {

		return 'color';

	}

	return null;

};

export const getValueFromType = ( type ) => {

	const last4 = type?.slice( -4 );

	if ( type === 'color' ) {

		return new Color();

	} else if ( last4 === 'vec2' ) {

		return new Vector2();

	} else if ( last4 === 'vec3' ) {

		return new Vector3();

	} else if ( last4 === 'vec4' ) {

		return new Vector4();

	} else if ( last4 === 'mat3' ) {

		return new Matrix3();

	} else if ( last4 === 'mat4' ) {

		return new Matrix4();

	}

	return null;

};

export class ArrayMap {

	constructor( iterable ) {

		this.map = new Map();

		if ( iterable ) {

			for ( let el of iterable ) {

				this.set( el.slice( 0, -1 ), el[ el.length - 1 ] );

			}

		}

	}

	get size() {

		let total = 0;

		for ( let el of this.map.entries() ) {

			total += ( el.size !== undefined ) ? el.size : 1;

		}

	}

	clear() {

		this.map.clear();

	}

	delete( key ) {

		if ( key.length === 1 ) {

			return this.map.delete( key[ 0 ] );

		}

		return this.map.has( key[ 0 ] ) ? this.map.get( key[ 0 ] ).delete( key.slice( 1 ) ) : false;

	}

	get( key ) {

		if ( key.length === 1 ) {

			return this.map.get( key[ 0 ] );

		}

		return this.map.get( key[ 0 ] ).get( key.slice( 1 ) );

	}

	has( key ) {

		if ( key.length === 1 ) {

			return this.map.has( key[ 0 ] );

		}

		return this.map.has( key[ 0 ] ) && this.map.get( key[ 0 ] ).has( key.slice( 1 ) );

	}

	set( key, value ) {

		if ( key.length === 1 ) {

			return this.map.set( key[ 0 ], value );

		}

		if ( ! this.map.has( key[ 0 ] ) ) {

			this.map.set( key[ 0 ], new ArrayMap() );

		}

		this.map.get( key[ 0 ] ).set( key.slice( 1 ), value );

		return this;

	}

	[ Symbol.iterator ]() {

		return this.entries();

	}

	* keys() {

		for ( let [ key, value ] of this.map ) {

			if ( value.keys === undefined ) {

				yield [ key ];

			}

			for ( let key2 of value.keys() ) {

				key2.unshift( key );

				yield key2;

			}

		}

	}

	* values() {

		for ( let value of this.map.values() ) {

			if ( value.values === undefined ) {

				yield value;

			}

			for ( let value2 of value.values() ) {

				yield value2;

			}

		}

	}

	* entries() {

		for ( let [ key, value ] of this.map ) {

			if ( value.entries === undefined ) {

				yield [ [ key ], value ];

			}

			for ( let [ key2, value2 ] of value.entries() ) {

				key2.unshift( key );

				yield [ key2, value ];

			}

		}

	}

	forEach( callbackFn, thisArg ) {

		for ( let [ key, value ] of this ) {

			callbackFn.call( thisArg, value, key, this );

		}

	}

}

export const flatArray = obj => {

	let arr = [];

	for ( let el of obj ) {

		if ( Array.isArray( el ) ) {

			arr = arr.concat( flatArray( el ) );

		} else if ( typeof el === 'object' ) {

			// We should not flat number and strings, but should flat vectors, matrices, and colors

			arr = arr.concat( flatArray( el.toArray() ) );

		} else {

			arr.push( el );

		}

	}

	return arr;

};
