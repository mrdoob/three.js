/**
 * @author vHawk / https://github.com/vHawk/
 */

import { Vector3, Matrix4 } from '../../../build/three.module.js';

const inverseProjectionMatrix = new Matrix4();

export default class Frustum {

	constructor( data ) {

		data = data || {};

		this.projectionMatrix = data.projectionMatrix;
		this.maxFar = data.maxFar || 10000;

		this.vertices = {
			near: [],
			far: []
		};

	}

	getViewSpaceVertices() {

		const maxFar = this.maxFar;
		const projectionMatrix = this.projectionMatrix;
		const isOrthographic = projectionMatrix.elements[ 2 * 4 + 3 ] === 0;

		inverseProjectionMatrix.getInverse( this.projectionMatrix );

		// 3 --- 0  vertices.near/far order
		// |     |
		// 2 --- 1
		// clip space spans from [-1, 1]

		this.vertices.near.push(
			new Vector3( 1, 1, - 1 ),
			new Vector3( 1, - 1, - 1 ),
			new Vector3( - 1, - 1, - 1 ),
			new Vector3( - 1, 1, - 1 )
		);
		this.vertices.near.forEach( function( v ) {

			v.applyMatrix4( inverseProjectionMatrix );

		} );

		this.vertices.far.push(
			new Vector3( 1, 1, 1 ),
			new Vector3( 1, - 1, 1 ),
			new Vector3( - 1, - 1, 1 ),
			new Vector3( - 1, 1, 1 )
		)
		this.vertices.far.forEach( function( v ) {

			v.applyMatrix4( inverseProjectionMatrix );

			const absZ = Math.abs( v.z );
			if ( isOrthographic ) {

				v.z *= Math.min( maxFar / absZ, 1.0 );

			} else {

				v.multiplyScalar( Math.min( maxFar / absZ, 1.0 ) );

			}

		} );

		return this.vertices;

	}

	split( breaks ) {

		const result = [];

		for ( let i = 0; i < breaks.length; i ++ ) {

			const cascade = new Frustum();

			if ( i === 0 ) {

				cascade.vertices.near = this.vertices.near;

			} else {

				for ( let j = 0; j < 4; j ++ ) {

					cascade.vertices.near.push( new Vector3().lerpVectors( this.vertices.near[ j ], this.vertices.far[ j ], breaks[ i - 1 ] ) );

				}

			}

			if ( i === breaks - 1 ) {

				cascade.vertices.far = this.vertices.far;

			} else {

				for ( let j = 0; j < 4; j ++ ) {

					cascade.vertices.far.push( new Vector3().lerpVectors( this.vertices.near[ j ], this.vertices.far[ j ], breaks[ i ] ) );

				}

			}

			result.push( cascade );

		}

		return result;

	}

	toSpace( cameraMatrix ) {

		const result = new Frustum();
		const point = new Vector3();

		for ( var i = 0; i < 4; i ++ ) {

			point.set( this.vertices.near[ i ].x, this.vertices.near[ i ].y, this.vertices.near[ i ].z );
			point.applyMatrix4( cameraMatrix );
			result.vertices.near.push( new Vector3( point.x, point.y, point.z ) );

			point.set( this.vertices.far[ i ].x, this.vertices.far[ i ].y, this.vertices.far[ i ].z );
			point.applyMatrix4( cameraMatrix );
			result.vertices.far.push( point.clone() );

		}

		return result;

	}

}
