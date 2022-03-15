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

	} else if ( type === 'bool' ) {

		return false;

	} else if ( ( type === 'float' ) || ( type === 'int' ) || ( type === 'uint' ) ) {

		return 0;

	}

	return null;

};

export class ArrayMap {

	constructor( iterable ) {

		this.map = new Map();

		this.value = undefined;
		this.hasValue = false;

		if ( iterable ) {

			for ( let el of iterable ) {

				this.set( el[ 0 ], el[ 1 ] );

			}

		}

	}

	get size() {

		let total = this.hasValue ? 1 : 0;

		for ( let el of this.map.entries() ) {

			total += el.size;

		}

		return total;

	}

	clear() {

		this.map.clear();

		this.value = undefined;
		this.hasValue = false;

	}

	delete( key ) {

		if ( key.length === 0 ) {

			const hadValue = this.hasValue;

			this.value = undefined;
			this.hasValue = false;

			return hadValue;

		}

		const firstKey = key.shift();

		return this.map.has( firstKey ) ? this.map.get( firstKey ).delete( key ) : false;

	}

	get( key ) {

		if ( key.length === 0 ) {

			return this.hasValue ? this.value : undefined;

		}

		const firstKey = key.shift();

		return this.map.has( firstKey ) ? this.map.get( firstKey ).get( key ) : undefined;

	}

	has( key ) {

		if ( key.length === 0 ) {

			return this.hasValue;

		}

		const firstKey = key.shift();

		return this.map.has( firstKey ) && this.map.get( firstKey ).has( key );

	}

	set( key, value ) {

		if ( key.length === 0 ) {

			this.value = value;
			this.hasValue = true;

			return this;

		}

		const firstKey = key.shift();

		if ( ! this.map.has( firstKey ) ) {

			this.map.set( firstKey, new ArrayMap() );

		}

		this.map.get( firstKey ).set( key, value );

		return this;

	}

	[ Symbol.iterator ]() {

		return this.entries();

	}

	* keys() {

		if ( this.hasValue ) {

			yield [];

		}

		for ( let [ key, value ] of this.map ) {

			for ( let key2 of value.keys() ) {

				key2.unshift( key );

				yield key2;

			}

		}

	}

	* values() {

		if ( this.hasValue ) {

			yield this.value;

		}

		for ( let value of this.map.values() ) {

			for ( let value2 of value.values() ) {

				yield value2;

			}

		}

	}

	* entries() {

		if ( this.hasValue ) {

			yield [ [], this.value ];

		}

		for ( let [ key, value ] of this.map ) {

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
