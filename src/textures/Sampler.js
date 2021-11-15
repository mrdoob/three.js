import {
	MirroredRepeatWrapping,
	ClampToEdgeWrapping,
	RepeatWrapping,
	UVMapping
} from '../constants.js';
import * as MathUtils from '../math/MathUtils.js';
import { Matrix3 } from '../math/Matrix3.js';
import { Vector2 } from '../math/Vector2.js';

let samplerId = 0;

class Sampler {

	constructor( texture = null ) {

		Object.defineProperty( this, 'id', { value: samplerId ++ } );

		this.uuid = MathUtils.generateUUID();

		this.name = '';

		this.texture = texture;

		this.offset = new Vector2( 0, 0 );
		this.repeat = new Vector2( 1, 1 );
		this.center = new Vector2( 0, 0 );
		this.rotation = 0;

		this.matrixAutoUpdate = true;
		this.matrix = new Matrix3();

	}

	clone() {

		return new this.constructor().copy( this );

	}

	copy( source ) {

		this.name = source.name;

		this.texture = source.texture;

		this.offset.copy( source.offset );
		this.repeat.copy( source.repeat );
		this.center.copy( source.center );
		this.rotation = source.rotation;

		this.matrixAutoUpdate = source.matrixAutoUpdate;
		this.matrix.copy( source.matrix );

		return this;

	}

	toJSON( meta ) {

		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		if ( ! isRootObject && meta.samplers[ this.uuid ] !== undefined ) {

			return meta.samplers[ this.uuid ];

		}

		const output = {

			metadata: {
				version: 4.5,
				type: 'Sampler',
				generator: 'Sampler.toJSON'
			},

			uuid: this.uuid,
			name: this.name,

			texture: this.texture.toJSON( meta ).uuid,

			repeat: [ this.repeat.x, this.repeat.y ],
			offset: [ this.offset.x, this.offset.y ],
			center: [ this.center.x, this.center.y ],
			rotation: this.rotation

		};

		if ( ! isRootObject ) {

			meta.samplers[ this.uuid ] = output;

		}

		return output;

	}

	transformUv( uv ) {

		const texture = this.texture;

		if ( texture === null ) console.error( 'THREE.Sampler.transformUv(): Method can not be used without a texture.' );

		if ( texture.mapping !== UVMapping ) return uv;

		uv.applyMatrix3( this.matrix );

		if ( uv.x < 0 || uv.x > 1 ) {

			switch ( texture.wrapS ) {

				case RepeatWrapping:

					uv.x = uv.x - Math.floor( uv.x );
					break;

				case ClampToEdgeWrapping:

					uv.x = uv.x < 0 ? 0 : 1;
					break;

				case MirroredRepeatWrapping:

					if ( Math.abs( Math.floor( uv.x ) % 2 ) === 1 ) {

						uv.x = Math.ceil( uv.x ) - uv.x;

					} else {

						uv.x = uv.x - Math.floor( uv.x );

					}

					break;

			}

		}

		if ( uv.y < 0 || uv.y > 1 ) {

			switch ( texture.wrapT ) {

				case RepeatWrapping:

					uv.y = uv.y - Math.floor( uv.y );
					break;

				case ClampToEdgeWrapping:

					uv.y = uv.y < 0 ? 0 : 1;
					break;

				case MirroredRepeatWrapping:

					if ( Math.abs( Math.floor( uv.y ) % 2 ) === 1 ) {

						uv.y = Math.ceil( uv.y ) - uv.y;

					} else {

						uv.y = uv.y - Math.floor( uv.y );

					}

					break;

			}

		}

		if ( texture.flipY ) {

			uv.y = 1 - uv.y;

		}

		return uv;

	}

	updateMatrix() {

		this.matrix.setUvTransform( this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y );

	}

}

Sampler.prototype.isSampler = true;

export { Sampler };
