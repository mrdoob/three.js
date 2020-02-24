/**
 * @author vHawk / https://github.com/vHawk/
 */

import { MathUtils, Vector3, Matrix4 } from '../../../build/three.module.js';
import FrustumVertex from './FrustumVertex.js';

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
		).forEach( function( v ) {

			v.applyMatrix4( inverseProjectionMatrix );
			v.multiplyScalar( Math.min( v.z / maxFar, 1.0 ) );

		} );

		this.vertices.far.push(
			new Vector3( 1, 1, 1 ),
			new Vector3( 1, - 1, 1 ),
			new Vector3( - 1, - 1, 1 ),
			new Vector3( - 1, 1, 1 )
		).forEach( function( v ) {

			v.applyMatrix4( inverseProjectionMatrix );
			v.multiplyScalar( Math.min( v.z / maxFar, 1.0 ) );

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

					cascade.vertices.near.push( new FrustumVertex().fromLerp( this.vertices.near[ j ], this.vertices.far[ j ], breaks[ i - 1 ] ) );

				}

			}

			if ( i === breaks - 1 ) {

				cascade.vertices.far = this.vertices.far;

			} else {

				for ( let j = 0; j < 4; j ++ ) {

					cascade.vertices.far.push( new FrustumVertex().fromLerp( this.vertices.near[ j ], this.vertices.far[ j ], breaks[ i ] ) );

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
			result.vertices.near.push( new FrustumVertex( point.x, point.y, point.z ) );

			point.set( this.vertices.far[ i ].x, this.vertices.far[ i ].y, this.vertices.far[ i ].z );
			point.applyMatrix4( cameraMatrix );
			result.vertices.far.push( new FrustumVertex( point.x, point.y, point.z ) );

		}

		return result;

	}

}
