/*
 * Cloth Simulation using a relaxed constraints solver
 *
 * @author @zz85 / https://github.com/zz85
 * @author Lewy Blue https://discoverthreejs.com/
 *
 * Suggested Readings
 *
 * Advanced Character Physics by Thomas Jakobsen Character
 * http://en.wikipedia.org/wiki/Cloth_modeling
 * https://viscomp.alexandra.dk/?p=147
 * Real-time Cloth Animation http://www.darwin3d.com/gamedev/articles/col0599.pdf
 *
 */

THREE.Cloth = ( function () {

	var tmp = new THREE.Vector3();

	var gravityVector = new THREE.Vector3();

	var positions, verticesCount, indices, prevPositions, originalPositions, acceleration, normals;

	function createGeometry( width, height, xSegs, ySegs ) {

		var geometry = new THREE.PlaneBufferGeometry( width, height, xSegs, ySegs );
		geometry.attributes.position.setDynamic( true );

		geometry.addAttribute( 'originalPos', geometry.attributes.position.clone() );
		geometry.addAttribute( 'prevPos', geometry.attributes.position.clone() );

		positions = geometry.attributes.position;
		normals = geometry.attributes.normal;
		indices = geometry.index;
		verticesCount = positions.count;

		prevPositions = geometry.attributes.position.clone();
		originalPositions = geometry.attributes.position.clone();
		acceleration = new THREE.BufferAttribute( new Float32Array( verticesCount * 3 ), 3 );

		return geometry;

	}

	var Cloth = function ( width, height, xSegs, ySegs, material ) {

		THREE.Mesh.call( this, createGeometry( width, height, xSegs, ySegs ), material );

		this.distance = width / xSegs;
		this.damping = 0.03;
		this.mass = 1;

		this.gravity = - 9.81;
		this.force = new THREE.Vector3( 0, 0, 0 );

		// pin constraints correspond to vertex indices
		this.pins = [];

		this.constraints = buildConstraintIndices( xSegs, ySegs );

	};

	Cloth.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {

		constructor: Cloth,

		updateGeometry: function () {

			this.geometry.attributes.position.needsUpdate = true;
			this.geometry.computeVertexNormals();

		},

		applyForceToVertex: function ( force, index ) {

			acceleration.setXYZ(
				index,
				acceleration.getX( index ) + force.x * ( 1 / this.mass ),
				acceleration.getY( index ) + force.y * ( 1 / this.mass ),
				acceleration.getZ( index ) + force.z * ( 1 / this.mass ),
			);

		},

		applyAerodynamicForce: function () {

			for ( var i = 0, l = indices.count, index; i < l; i ++ ) {

				index = indices.getX( i );
				tmp.fromBufferAttribute( normals, index );
				tmp.normalize().multiplyScalar( tmp.dot( this.force ) );
				this.applyForceToVertex( tmp, index );

			}

		},

		// TODO: gravity is not taking into account mesh rotation
		applyGravity: function () {

			gravityVector.set( this.gravity * this.mass, 0, 0 );

			for ( var i = 0; i < verticesCount; i ++ ) {

				this.applyForceToVertex( gravityVector, i );

			}

		},

		applyVerletIntegration: function () {

			var drag = 1 - this.damping;

			// Todo: use clock.delta instead of fixed timestep
			var timestep = 18 / 1000;
			var timestepSq = timestep * timestep;

			var x, y, z, px, py, pz, ax, ay, az, nx, ny, nz;

			for ( var i = 0; i < verticesCount; i ++ ) {

				x = positions.getX( i );
				y = positions.getY( i );
				z = positions.getZ( i );
				px = prevPositions.getX( i );
				py = prevPositions.getY( i );
				pz = prevPositions.getZ( i );
				ax = acceleration.getX( i );
				ay = acceleration.getY( i );
				az = acceleration.getZ( i );

				nx = ( x - px ) * drag + x + ( ax * timestepSq );
				ny = ( y - py ) * drag + y + ( ay * timestepSq );
				nz = ( z - pz ) * drag + z + ( az * timestepSq );

				positions.setXYZ( i, nx, ny, nz );
				prevPositions.setXYZ( i, x, y, z );
				acceleration.setXYZ( i, 0, 0, 0	);

			}

		},

		applyConstraints: function () {

			var index1, index2, currentDist;

			for ( var i = 0, l = this.constraints.length; i < l; i ++ ) {

				index1 = this.constraints[ i ][ 0 ];
				index2 = this.constraints[ i ][ 1 ];

				tmp.set(
					positions.getX( index2 ) - positions.getX( index1 ),
					positions.getY( index2 ) - positions.getY( index1 ),
					positions.getZ( index2 ) - positions.getZ( index1 ),
				);

				currentDist = tmp.length();

				if ( currentDist === 0 ) return;

				tmp.multiplyScalar( ( 1 - this.distance / currentDist ) * 0.5 );

				positions.setXYZ(
					index1,
					positions.getX( index1 ) + tmp.x,
					positions.getY( index1 ) + tmp.y,
					positions.getZ( index1 ) + tmp.z,
				);

				positions.setXYZ(
					index2,
					positions.getX( index2 ) - tmp.x,
					positions.getY( index2 ) - tmp.y,
					positions.getZ( index2 ) - tmp.z,
				);

			}

		},

		applyPinConstraints: function () {

			for ( var i = 0; i < this.pins.length; i ++ ) {

				var x = originalPositions.getX( this.pins[ i ] );
				var y = originalPositions.getY( this.pins[ i ] );
				var z = originalPositions.getZ( this.pins[ i ] );

				positions.setXYZ( this.pins[ i ], x, y, z );
				prevPositions.setXYZ( this.pins[ i ], x, y, z );

			}

		},

		update: function () {

			this.applyAerodynamicForce();
			this.applyGravity();

			this.applyVerletIntegration();

			this.applyConstraints();
			this.applyPinConstraints();

			this.updateGeometry();

		}

	} );

	function buildConstraintIndices( xSegs, ySegs ) {

		var constraints = [];

		for ( var v = 0; v < ySegs; v ++ ) {

			for ( var u = 0; u < xSegs; u ++ ) {

				constraints.push( [
					getIndex( u, v, xSegs ),
					getIndex( u, v + 1, xSegs ),
				],
				[
					getIndex( u, v, xSegs ),
					getIndex( u + 1, v, xSegs ),
				] );

			}

		}

		for ( var u = xSegs, v = 0; v < ySegs; v ++ ) {

			constraints.push( [
				getIndex( u, v, xSegs ),
				getIndex( u, v + 1, xSegs )
			] );

		}

		for ( var v = ySegs, u = 0; u < xSegs; u ++ ) {

			constraints.push( [
				getIndex( u, v, xSegs ),
				getIndex( u + 1, v, xSegs )
			] );

		}

		return constraints;

	}

	function getIndex( u, v, xSegs ) {

		return u + v * ( xSegs + 1 );

	}

	return Cloth;

} )();
