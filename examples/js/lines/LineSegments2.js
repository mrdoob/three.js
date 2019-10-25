import { Matrix4, Vector3, Vector2, PositionalAudio, Line } from "../../../build/three.module.js";

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

THREE.LineSegments2 = function ( geometry, material ) {

	THREE.Mesh.call( this );

	this.type = 'LineSegments2';

	this.geometry = geometry !== undefined ? geometry : new THREE.LineSegmentsGeometry();
	this.material = material !== undefined ? material : new THREE.LineMaterial( { color: Math.random() * 0xffffff } );

};

THREE.LineSegments2.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {

	constructor: THREE.LineSegments2,

	isLineSegments2: true,

	computeLineDistances: ( function () { // for backwards-compatability, but could be a method of LineSegmentsGeometry...

		var start = new THREE.Vector3();
		var end = new THREE.Vector3();

		return function computeLineDistances() {

			var geometry = this.geometry;

			var instanceStart = geometry.attributes.instanceStart;
			var instanceEnd = geometry.attributes.instanceEnd;
			var lineDistances = new Float32Array( 2 * instanceStart.data.count );

			for ( var i = 0, j = 0, l = instanceStart.data.count; i < l; i ++, j += 2 ) {

				start.fromBufferAttribute( instanceStart, i );
				end.fromBufferAttribute( instanceEnd, i );

				lineDistances[ j ] = ( j === 0 ) ? 0 : lineDistances[ j - 1 ];
				lineDistances[ j + 1 ] = lineDistances[ j ] + start.distanceTo( end );

			}

			var instanceDistanceBuffer = new THREE.InstancedInterleavedBuffer( lineDistances, 2, 1 ); // d0, d1

			geometry.setAttribute( 'instanceDistanceStart', new THREE.InterleavedBufferAttribute( instanceDistanceBuffer, 1, 0 ) ); // d0
			geometry.setAttribute( 'instanceDistanceEnd', new THREE.InterleavedBufferAttribute( instanceDistanceBuffer, 1, 1 ) ); // d1

			return this;

		};

	}() ),

	raycast: ( function () {

		var start = new Vector4();
		var end = new Vector4();

		var origin = new Vector4();
		var mvMatrix = new Matrix4();
		var line = new Line();
		var closestPoint = new Vector3();

		return function raycast( raycaster, insterescts ) {

			if ( raycaster.camera === null ) {

				console.error( 'THREE.LineSegments2: "Raycaster.camera" needs to be set in order to raycast against sprites.' );

			}

			var ray = raycaster.ray;
			var camera = raycaster.camera;
			var projectionMatrix = camera.projectionMatrix;

			var geometry = this.geometry;
			var material = this.material;
			var resolution = material.resolution;
			var lineWidth = material.lineWidth;

			var instanceStart = geometry.attributes.instanceStart;
			var instanceEnd = geometry.attributes.instanceEnd;

			var isPerspective = projectionMatrix[ 2 ][ 3 ] === -1;
			var aspect = resolution.x / resolution.y;

			// ndc space [ - 0.5, 0.5 ]
			origin.copy( ray.origin );
			origin.w = 1;
			origin.applyMatrix4( camera.matrixWorldInverse );
			origin.applyMatrix4( projectionMatrix );
			origin.multiplyScalar( 1 / origin.w );

			// screen space
			origin.x *= resolution.x;
			origin.y *= resolution.y;
			origin.z = 0;

			mvMatrix.multiplyMatrices( camera.matrixWorldInverse, this.matrixWorld );

			for ( var i = 0, l = instanceStart.count; i < l; i ++ ) {

				// TODO: Maybe have to clip the line based on the camera?

				start.fromBufferAttribute( instanceStart, i );
				end.fromBufferAttribute( instanceEnd, i );

				start.w = 1;
				end.w = 1;

				// camera space
				start.applyMatrix4( mvMatrix );
				end.applyMatrix4( mvMatrix );

				// clip space
				start.applyMatrix4( projectionMatrix );
				end.applyMatrix4( projectionMatrix );

				// ndc space [ - 0.5, 0.5 ]
				start.multiplyScalar( 1 / start.w );
				end.multiplyScalar( 1 / end.w );

				// screen space
				start.x *= resolution.x;
				start.y *= resolution.y;

				end.y *= resolution.y;
				end.y *= resolution.y;

				line.start.copy( start );
				line.start.z = 0;

				line.end.copy( end );
				line.end.z = 0;

				var param = line.closestPointToPointParameter( origin, true );
				line.at( param, closestPoint );

				if ( origin.distanceTo( closestPoint ) < lineWidth * 0.5 ) {

					// intersected! output a hit

				}

			}

		}

	} () )

} );
