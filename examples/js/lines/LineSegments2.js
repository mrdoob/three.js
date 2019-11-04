import { Matrix4, Vector3, Line, Math as MathUtils } from "../../../build/three.module.js";

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

		var ssOrigin = new Vector4();
		var mvMatrix = new Matrix4();
		var line = new Line();
		var closestPoint = new Vector3();

		return function raycast( raycaster, intersects ) {

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

			// ndc space [ - 0.5, 0.5 ]
			ssOrigin.copy( ray.origin );
			ssOrigin.w = 1;
			ssOrigin.applyMatrix4( camera.matrixWorldInverse );
			ssOrigin.applyMatrix4( projectionMatrix );
			ssOrigin.multiplyScalar( 1 / ssOrigin.w );

			// screen space
			ssOrigin.x *= resolution.x;
			ssOrigin.y *= resolution.y;
			ssOrigin.z = 0;

			var matrixWorld = this.matrixWorld;
			mvMatrix.multiplyMatrices( camera.matrixWorldInverse, matrixWorld );

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

				// segment is behind camera near
				if ( start.z > 0 && end.z > 0 ) {

					continue;

				}

				// segment is in front of camera far
				if ( start.z < - 1 && end.z < - 1 ) {

					continue;

				}

				// ndc space [ - 0.5, 0.5 ]
				start.multiplyScalar( 1 / start.w );
				end.multiplyScalar( 1 / end.w );

				// screen space
				start.x *= resolution.x;
				start.y *= resolution.y;

				end.y *= resolution.y;
				end.y *= resolution.y;

				// create 2d segment
				line.start.copy( start );
				line.start.z = 0;

				line.end.copy( end );
				line.end.z = 0;

				// get closest point on ray to segment
				var param = line.closestPointToPointParameter( ssOrigin, true );
				line.at( param, closestPoint );

				// check if the intersection point is within clip space
				var zPos = MathUtils.lerp( start.z, end.z, param );
				var isInClipSpace = zPos < 0 && zPos > - 1;

				if ( isInClipSpace && ssOrigin.distanceTo( closestPoint ) < lineWidth * 0.5 ) {

					line.start.fromBufferAttribute( instanceStart, i );
					line.end.fromBufferAttribute( instanceEnd, i );

					line.start.applyMatrix4( matrixWorld );
					line.end.applyMatrix4( matrixWorld );

					var pointOnLine = new Vector3();
					line.at( param, pointOnLine );

					var point = new Vector3();
					ray.closestPointToPoint( pointOnLine, point );

					intersects.push( {

						point: point,
						pointOnLine: pointOnLine,
						distance: ray.origin.distanceTo( point ),

						object: this,
						face: null,
						faceIndex: i,
						uv: null,
						uv2: null,

					} );

				}

			}

		}

	} () )

} );
