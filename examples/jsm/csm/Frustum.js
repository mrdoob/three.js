import * as THREE from '../../../build/three.module.js';
import FrustumVertex from './FrustumVertex.js';
import { toRad } from './Utils.js';

export default class Frustum {

	constructor( data ) {

		data = data || {};

		this.fov = data.fov || 70;
		this.near = data.near || 0.1;
		this.far = data.far || 1000;
		this.aspect = data.aspect || 1;

		this.vertices = {
			near: [],
			far: []
		};

	}

	getViewSpaceVertices() {

		this.nearPlaneY = this.near * Math.tan( toRad( this.fov / 2 ) );
		this.nearPlaneX = this.aspect * this.nearPlaneY;

		this.farPlaneY = this.far * Math.tan( toRad( this.fov / 2 ) );
		this.farPlaneX = this.aspect * this.farPlaneY;

		// 3 --- 0  vertices.near/far order
		// |     |
		// 2 --- 1

		this.vertices.near.push(
			new FrustumVertex( this.nearPlaneX, this.nearPlaneY, - this.near ),
			new FrustumVertex( this.nearPlaneX, - this.nearPlaneY, - this.near ),
			new FrustumVertex( - this.nearPlaneX, - this.nearPlaneY, - this.near ),
			new FrustumVertex( - this.nearPlaneX, this.nearPlaneY, - this.near )
		);

		this.vertices.far.push(
			new FrustumVertex( this.farPlaneX, this.farPlaneY, - this.far ),
			new FrustumVertex( this.farPlaneX, - this.farPlaneY, - this.far ),
			new FrustumVertex( - this.farPlaneX, - this.farPlaneY, - this.far ),
			new FrustumVertex( - this.farPlaneX, this.farPlaneY, - this.far )
		);

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
		const point = new THREE.Vector3();

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
