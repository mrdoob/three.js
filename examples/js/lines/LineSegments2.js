THREE.LineSegments2 = function ( geometry, material ) {

	if ( geometry === undefined ) geometry = new THREE.LineSegmentsGeometry();
	if ( material === undefined ) material = new THREE.LineMaterial( { color: Math.random() * 0xffffff } );

	THREE.Mesh.call( this, geometry, material );

	this.type = 'LineSegments2';

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
			var lineDistances = new Float32Array( 2 * instanceStart.count );

			for ( var i = 0, j = 0, l = instanceStart.count; i < l; i ++, j += 2 ) {

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

		var start = new THREE.Vector4();
		var end = new THREE.Vector4();

		var ssOrigin = new THREE.Vector4();
		var ssOrigin3 = new THREE.Vector3();
		var mvMatrix = new THREE.Matrix4();
		var line = new THREE.Line3();
		var closestPoint = new THREE.Vector3();

		var box = new THREE.Box3();
		var sphere = new THREE.Sphere();
		var clipToWorldVector = new THREE.Vector4();

		return function raycast( raycaster, intersects ) {

			if ( raycaster.camera === null ) {

				console.error( 'LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2.' );

			}

			var threshold = ( raycaster.params.Line2 !== undefined ) ? raycaster.params.Line2.threshold || 0 : 0;

			var ray = raycaster.ray;
			var camera = raycaster.camera;
			var projectionMatrix = camera.projectionMatrix;

			var matrixWorld = this.matrixWorld;
			var geometry = this.geometry;
			var material = this.material;
			var resolution = material.resolution;
			var lineWidth = material.linewidth + threshold;

			var instanceStart = geometry.attributes.instanceStart;
			var instanceEnd = geometry.attributes.instanceEnd;

			// camera forward is negative
			var near = - camera.near;

			// clip space is [ - 1, 1 ] so multiply by two to get the full
			// width in clip space
			var ssMaxWidth = 2.0 * Math.max( lineWidth / resolution.width, lineWidth / resolution.height );

			//

			// check if we intersect the sphere bounds
			if ( geometry.boundingSphere === null ) {

				geometry.computeBoundingSphere();

			}

			sphere.copy( geometry.boundingSphere ).applyMatrix4( matrixWorld );
			var distanceToSphere = Math.max( camera.near, sphere.distanceToPoint( ray.origin ) );

			// get the w component to scale the world space line width
			clipToWorldVector.set( 0, 0, - distanceToSphere, 1.0 ).applyMatrix4( camera.projectionMatrix );
			clipToWorldVector.multiplyScalar( 1.0 / clipToWorldVector.w );
			clipToWorldVector.applyMatrix4( camera.projectionMatrixInverse );

			// increase the sphere bounds by the worst case line screen space width
			var sphereMargin = Math.abs( ssMaxWidth / clipToWorldVector.w ) * 0.5;
			sphere.radius += sphereMargin;

			if ( raycaster.ray.intersectsSphere( sphere ) === false ) {

				return;

			}

			//

			// check if we intersect the box bounds
			if ( geometry.boundingBox === null ) {

				geometry.computeBoundingBox();

			}

			box.copy( geometry.boundingBox ).applyMatrix4( matrixWorld );
			var distanceToBox = Math.max( camera.near, box.distanceToPoint( ray.origin ) );

			// get the w component to scale the world space line width
			clipToWorldVector.set( 0, 0, - distanceToBox, 1.0 ).applyMatrix4( camera.projectionMatrix );
			clipToWorldVector.multiplyScalar( 1.0 / clipToWorldVector.w );
			clipToWorldVector.applyMatrix4( camera.projectionMatrixInverse );

			// increase the sphere bounds by the worst case line screen space width
			var boxMargin = Math.abs( ssMaxWidth / clipToWorldVector.w ) * 0.5;
			box.max.x += boxMargin;
			box.max.y += boxMargin;
			box.max.z += boxMargin;
			box.min.x -= boxMargin;
			box.min.y -= boxMargin;
			box.min.z -= boxMargin;

			if ( raycaster.ray.intersectsBox( box ) === false ) {

				return;

			}

			//

			// pick a point 1 unit out along the ray to avoid the ray origin
			// sitting at the camera origin which will cause "w" to be 0 when
			// applying the projection matrix.
			ray.at( 1, ssOrigin );

			// ndc space [ - 1.0, 1.0 ]
			ssOrigin.w = 1;
			ssOrigin.applyMatrix4( camera.matrixWorldInverse );
			ssOrigin.applyMatrix4( projectionMatrix );
			ssOrigin.multiplyScalar( 1 / ssOrigin.w );

			// screen space
			ssOrigin.x *= resolution.x / 2;
			ssOrigin.y *= resolution.y / 2;
			ssOrigin.z = 0;

			ssOrigin3.copy( ssOrigin );

			mvMatrix.multiplyMatrices( camera.matrixWorldInverse, matrixWorld );

			for ( var i = 0, l = instanceStart.count; i < l; i ++ ) {

				start.fromBufferAttribute( instanceStart, i );
				end.fromBufferAttribute( instanceEnd, i );

				start.w = 1;
				end.w = 1;

				// camera space
				start.applyMatrix4( mvMatrix );
				end.applyMatrix4( mvMatrix );

				// skip the segment if it's entirely behind the camera
				var isBehindCameraNear = start.z > near && end.z > near;
				if ( isBehindCameraNear ) {

					continue;

				}

				// trim the segment if it extends behind camera near
				if ( start.z > near ) {

					const deltaDist = start.z - end.z;
					const t = ( start.z - near ) / deltaDist;
					start.lerp( end, t );

				} else if ( end.z > near ) {

					const deltaDist = end.z - start.z;
					const t = ( end.z - near ) / deltaDist;
					end.lerp( start, t );

				}

				// clip space
				start.applyMatrix4( projectionMatrix );
				end.applyMatrix4( projectionMatrix );

				// ndc space [ - 1.0, 1.0 ]
				start.multiplyScalar( 1 / start.w );
				end.multiplyScalar( 1 / end.w );

				// screen space
				start.x *= resolution.x / 2;
				start.y *= resolution.y / 2;

				end.x *= resolution.x / 2;
				end.y *= resolution.y / 2;

				// create 2d segment
				line.start.copy( start );
				line.start.z = 0;

				line.end.copy( end );
				line.end.z = 0;

				// get closest point on ray to segment
				var param = line.closestPointToPointParameter( ssOrigin3, true );
				line.at( param, closestPoint );

				// check if the intersection point is within clip space
				var zPos = THREE.MathUtils.lerp( start.z, end.z, param );
				var isInClipSpace = zPos >= - 1 && zPos <= 1;

				var isInside = ssOrigin3.distanceTo( closestPoint ) < lineWidth * 0.5;

				if ( isInClipSpace && isInside ) {

					line.start.fromBufferAttribute( instanceStart, i );
					line.end.fromBufferAttribute( instanceEnd, i );

					line.start.applyMatrix4( matrixWorld );
					line.end.applyMatrix4( matrixWorld );

					var pointOnLine = new THREE.Vector3();
					var point = new THREE.Vector3();

					ray.distanceSqToSegment( line.start, line.end, point, pointOnLine );

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

		};

	}() )

} );
