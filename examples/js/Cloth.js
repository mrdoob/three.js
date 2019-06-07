/*
 * Cloth Simulation using a relaxed constraints solver
 */

// Suggested Readings

// Advanced Character Physics by Thomas Jakobsen Character
// http://freespace.virgin.net/hugo.elias/models/m_cloth.htm
// http://en.wikipedia.org/wiki/Cloth_modeling
// http://cg.alexandra.dk/tag/spring-mass-system/
// Real-time Cloth Animation http://www.darwin3d.com/gamedev/articles/col0599.pdf

THREE.Cloth = ( function() {

	var pos = new THREE.Vector3();
	var pos2 = new THREE.Vector3();
	var acc = new THREE.Vector3();
	var tmp = new THREE.Vector3();

	var timestep = 18 / 1000;
	var timestepSq = timestep * timestep;

	var Cloth = function( width, height, xSegs, ySegs, material ) {

		this.width = width  || 1;
		this.height = height  || 1;
		this.xSegs = xSegs  || 10;
		this.ySegs = ySegs  || 10;

		this.geometry = createGeometry( width, height, xSegs, ySegs )

		material = material || new THREE.MeshBasicMaterial();

		THREE.Mesh.call( this, this.geometry, material );

		// physics constants

		this.damping = 0.03;
		this.drag = 1 - this.damping;
		this.mass = 1;
		this.massInv = 1 / this.mass;

		this.gravity = - 9.81 * this.mass;
		this.gravityVector = new THREE.Vector3();

		this.force = new THREE.Vector3( 0, 0, 0 );

		// constraints
		this.pins = [];
		this.groundPos = 0;

		this.positions = this.geometry.attributes.position;
		this.count = this.positions.count;

		this.prevPositions = this.geometry.attributes.position.clone();
		this.origPositions = this.geometry.attributes.position.clone();

		this.acceleration = new THREE.BufferAttribute( new Float32Array( this.count * 3 ), 3 );


		// create constraints
		this.constraints = [];

		for ( var v = 0; v < this.ySegs; v ++ ) {

			for ( var u = 0; u < this.xSegs; u ++ ) {

				this.constraints.push(
					[
						getIndex( u, v, this.xSegs ),
						getIndex( u, v + 1, this.xSegs ),
					],
					[
						getIndex( u, v, this.xSegs ),
						getIndex( u + 1, v, this.xSegs ),
					]
				);

			}

		}

		for ( u = this.xSegs, v = 0; v < this.ySegs; v ++ ) {

			this.constraints.push( [
				getIndex( u, v, this.xSegs ),
				getIndex( u, v + 1, this.xSegs )
			] );

		}

		for ( v = this.ySegs, u = 0; u < this.xSegs; u ++ ) {

			this.constraints.push( [
				getIndex( u, v, this.xSegs ),
				getIndex( u + 1, v, this.xSegs )
			] );

		}

	}

	Cloth.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {

		constructor: Cloth,

		updateGeometry: function () {

			for ( var i = 0, il = this.particles.length; i < il; i ++ ) {

				var v = this.particles[ i ].position;

				this.geometry.attributes.position.setXYZ( i, v.x, v.y, v.z );

			}

			this.geometry.attributes.position.needsUpdate = true;

			this.geometry.computeVertexNormals();

		},

		addForce( force ) {

			force.multiplyScalar( 1 / this.mass );

			for( var i = 0; i < this.count; i++) {

				this.acceleration.setXY(
					i,
					this.acceleration.getX( i ) + force.x,
					this.acceleration.getY( i ) + force.y
				);

			}

		},

		addGravity: function() {

			this.gravityVector.set( 0, -this.gravity, 0 ).applyQuaternion( this.quaternion );

			this.addForce( this.gravityVector );

		},

		integrate() {

			for( var i = 0; i < this.count; i++) {

				pos.fromBufferAttribute( this.positions, i );

				var x = this.positions.getX( i );
				var y = this.positions.getY( i );

				acc.fromBufferAttribute( this.acceleration, i ).multiplyScalar( timestepSq );

				tmp.set(
					x - this.prevPositions.getX( i ),
					y - this.prevPositions.getY( i ),
					0,
				).multiplyScalar( this.drag ).add( pos ).add( acc );

				this.prevPositions.setXY( i, x, y );
				this.positions.setXY( i, tmp.x, tmp.y );
				this.acceleration.setXY( i, 0, 0 );

			}

		},

		applyConstraints: function() {

			for ( i = 0, l = this.constraints.length; i < l; i ++ ) {

				constraint = this.constraints[ i ];

				pos.fromBufferAttribute( this.positions, constraint[ 0 ] );
				pos2.fromBufferAttribute( this.positions, constraint[ 1 ] );

				tmp.subVectors( pos2, pos );

				var distance = this.width / this.xSegs;
				var currentDist = tmp.length();
				if ( currentDist === 0 ) return; // prevents division by 0
				tmp.multiplyScalar( 1 - distance / currentDist ).multiplyScalar( 0.5 );

				pos.add( tmp );
				pos2.sub( tmp );

				this.positions.setXY( constraint[ 0 ], pos.x, pos.y );
				this.positions.setXY( constraint[ 1 ], pos2.x, pos2.y );

			}

		},

		applyPinConstraints: function() {

			var pos = new THREE.Vector3();

			for ( i = 0; i < this.pins.length; i ++ ) {

				var index = this.pins[ i ];
				pos.fromBufferAttribute( this.origPositions, i );
				this.positions.setXY( index, pos.x, pos.y );
				this.prevPositions.setXY( index, pos.x, pos.y );

			}

		},

		simulate: function ( time ) {

			// Aerodynamics forces

			// wind force
			// var indx;
			// var normal = new THREE.Vector3();
			// var indices = this.geometry.index;
			// var indicesCount = this.geometry.index.count;
			// var normals = this.geometry.attributes.normal;

			// for ( i = 0; i < indicesCount; i += 3 ) {

			// 	for ( j = 0; j < 3; j ++ ) {

			// 		indx = indices.getX( i + j );
			// 		normal.fromBufferAttribute( normals, indx )
			// 		tmpForce.copy( normal ).normalize().multiplyScalar( normal.dot( this.force ) );
			// 		this.particles[ indx ].addForce( tmpForce, this.mass );

			// 	}

			// }

			this.addGravity();




			// Floor Constraints

			// for ( i = 0; i < particlesCount; i ++ ) {

			// 	particle = this.particles[ i ];
			// 	var pos = particle.position;
			// 	if ( pos.y < this.groundPos  ) {

			// 		pos.y = this.groundPos;

			// 	}

			// }

			this.applyConstraints();
			this.applyPinConstraints();

			this.integrate();

			this.positions.needsUpdate = true;

		}

	} );

	function createGeometry( width, height, wSegs, hSegs ) {

		var geo = new THREE.PlaneBufferGeometry( width, height, wSegs, hSegs );
		geo.translate( 0, - width, 0 );
		geo.rotateX( Math.PI );

		geo.attributes.position.setDynamic( true );

		return geo;

	}

	function getIndex( u, v, xSegs ) {

		return u + v * ( xSegs + 1 );

	}

	return Cloth;

} )()
