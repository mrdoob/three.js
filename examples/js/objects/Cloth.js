/*
 * Cloth Simulation using a relaxed constraints solver
 *
 * @author @zz85 / https://github.com/zz85
 * @author Lewy Blue https://discoverthreejs.com/
 *
 * Suggested Readings
 *
 * Advanced Character Physics by Thomas Jakobsen Character
 * http://freespace.virgin.net/hugo.elias/models/m_cloth.htm
 * http://en.wikipedia.org/wiki/Cloth_modeling
 * http://cg.alexandra.dk/tag/spring-mass-system/
 * Real-time Cloth Animation http://www.darwin3d.com/gamedev/articles/col0599.pdf
 *
 */

THREE.Cloth = ( function () {

	var tmp = new THREE.Vector3();

	var gravityVector = new THREE.Vector3();

	var timestep = 18 / 1000;
	var timestepSq = timestep * timestep;

	var Cloth = function ( width, height, xSegs, ySegs, material ) {

		this.width = width || 1;
		this.height = height || 1;
		this.xSegs = xSegs || 10;
		this.ySegs = ySegs || 10;

		this.geometry = new THREE.PlaneBufferGeometry( width, height, xSegs, ySegs );
		this.geometry.attributes.position.setDynamic( true );

		material = material || new THREE.MeshBasicMaterial();

		THREE.Mesh.call( this, this.geometry, material );

		this.damping = 0.03;
		this.mass = 1;

		this.gravity = - 9.81;
		this.force = new THREE.Vector3( 0, 0, 0 );

		// pin constraints correspond to to vertex indices
		this.pins = [];

		// create one particle for each vertex
		this.particles = [];

		var positions = this.geometry.attributes.position;
		this.particlesCount = positions.count;
		for ( var i = 0; i < this.particlesCount; i ++ ) {

			this.particles.push(
				new Particle( positions.getX( i ), positions.getY( i ) )
			);

		}

		this.constraints = buildConstraintIndices( this.xSegs, this.ySegs );

	};

	Cloth.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {

		constructor: Cloth,

		updateGeometry: function () {

			for ( var i = 0; i < this.particlesCount; i ++ ) {

				var p = this.particles[ i ].position;

				this.geometry.attributes.position.setXYZ( i, p.x, p.y, p.z );

			}

			this.geometry.attributes.position.needsUpdate = true;

			this.geometry.computeVertexNormals();

		},

		applyAerodynamicForce: function () {

			var index, m;
			var indices = this.geometry.index;
			var normals = this.geometry.attributes.normal;

			for ( var i = 0, l = this.geometry.index.count; i < l; i ++ ) {

				index = indices.getX( i );
				tmp.fromBufferAttribute( normals, index );
				m = tmp.dot( this.force );
				tmp.normalize().multiplyScalar( m );
				this.particles[ index ].addForce( tmp, this.mass );

			}

		},

		// TODO: gravity is not correctly taking into account mesh rotation
		applyGravity: function () {


			gravityVector.set( 0, - this.gravity * this.mass, 0 ).applyEuler( this.rotation );

			for ( var i = 0; i < this.particlesCount; i ++ ) {

				this.particles[ i ].addForce( gravityVector, this.mass );

			}

		},

		applyVerletIntegration: function () {

			var drag = 1 - this.damping;

			for ( var i = 0; i < this.particlesCount; i ++ ) {

				this.particles[ i ].integrate( drag );

			}

		},

		applyConstraints: function () {

			for ( var i = 0, l = this.constraints.length, constraint, p1, p2; i < l; i ++ ) {

				constraint = this.constraints[ i ];
				p1 = this.particles[ constraint[ 0 ] ];
				p2 = this.particles[ constraint[ 1 ] ];
				satisfyConstraints( p1, p2, this.width / this.xSegs );

			}

		},

		applyPinConstraints: function () {

			for ( var i = 0, idx, p; i < this.pins.length; i ++ ) {

				idx = this.pins[ i ];

				p = this.particles[ idx ];

				p.position.copy( p.original );
				p.previous.copy( p.original );

			}

		},

		simulate: function () {

			this.applyAerodynamicForce();
			this.applyGravity();

			this.applyConstraints();
			this.applyPinConstraints();

			this.applyVerletIntegration();

			this.updateGeometry();

		}

	} );

	function Particle( x, y ) {

		this.position = new THREE.Vector3( x, y, 0 );
		this.previous = this.position.clone();
		this.original = this.position.clone();
		this.acceleration = new THREE.Vector3();

	}

	Particle.prototype.addForce = function ( force, mass ) {

		this.acceleration.add(
			tmp.copy( force ).multiplyScalar( 1 / mass )
		);

	};

	// Performs Verlet integration
	Particle.prototype.integrate = function ( drag ) {

		var newPos = tmp.subVectors( this.position, this.previous );

		newPos.multiplyScalar( drag ).add( this.position );
		newPos.add( this.acceleration.multiplyScalar( timestepSq ) );

		tmp = this.previous;
		this.previous = this.position;

		this.position = newPos;
		this.acceleration.set( 0, 0, 0 );

	};

	function satisfyConstraints( p1, p2, distance ) {

		tmp.subVectors( p2.position, p1.position );
		var currentDist = tmp.length();

		if ( currentDist === 0 ) return;

		tmp.multiplyScalar( ( 1 - distance / currentDist ) * 0.5 );

		p1.position.add( tmp );
		p2.position.sub( tmp );

	}

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
