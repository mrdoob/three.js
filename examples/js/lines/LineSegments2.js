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

			geometry.addAttribute( 'instanceDistanceStart', new THREE.InterleavedBufferAttribute( instanceDistanceBuffer, 1, 0 ) ); // d0
			geometry.addAttribute( 'instanceDistanceEnd', new THREE.InterleavedBufferAttribute( instanceDistanceBuffer, 1, 1 ) ); // d1

			return this;

		};

	}() ),

	raycast: ( function () {

		var ray = new THREE.Ray();
		var inverseMatrix = new THREE.Matrix4();
		var pointOnSegment = new THREE.Vector3();
		var pointOnSegmentNDC = new THREE.Vector3();
		var pointOnRay = new THREE.Vector3();
		var pointOnRayNDC = new THREE.Vector3();
		var startPoint3 = new THREE.Vector3();
		var endPoint3 = new THREE.Vector3();

		return function raycast( raycaster, intersects ) {

			if ( raycaster.camera === undefined ) return;

			var precision = this.material.linewidth / this.material.resolution.y;

			inverseMatrix.getInverse( this.matrixWorld );
			ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

			const geometry = this.geometry;
			var count = geometry.attributes.instanceStart.count;

			for ( var i = 0; i < count; ++ i ) {

				startPoint3.fromBufferAttribute( geometry.attributes.instanceStart, i );
				endPoint3.fromBufferAttribute( geometry.attributes.instanceEnd, i );

				ray.distanceSqToSegment( startPoint3, endPoint3, pointOnRay, pointOnSegment );

				// Set z to 0 because for raycasting we shouldn't consider depth.
				pointOnSegmentNDC.copy( pointOnSegment ).project( raycaster.camera ).setZ( 0 );
				pointOnRayNDC.copy( pointOnRay ).project( raycaster.camera ).setZ( 0 );

				var distSq = pointOnSegmentNDC.distanceTo( pointOnRayNDC )

				if ( distSq > precision ) continue;

				pointOnRay.applyMatrix4( this.matrixWorld );

				var distance = raycaster.ray.origin.distanceTo( pointOnRay );

				if ( distance > raycaster.near && distance < raycaster.far ) {

					intersects.push( {

						distance: distance,
						point: pointOnSegment.clone().applyMatrix4( this.matrixWorld ),
						object: this

					} );

				}

			}

		};

	}() ),

	copy: function ( source ) {

		// todo

		return this;

	}

} );
