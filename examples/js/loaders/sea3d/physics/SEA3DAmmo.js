/**   _     _   _         _____  __   _______  ______
*    | |___| |_| |__    /__  |  |  |     |  _  | * *
*    | / _ \  _|    |    __\    |  |  \  |  _  |  U _
*    |_\___/\__|_||_| _ |____/____ |__ \_|_  |_|_____|
*
*    @author LoTh / http://3dflashlo.wordpress.com/
*    @author SUNAG / http://www.sunag.com.br/
*    @author Ammo.lab / https://github.com/lo-th/Ammo.lab/
*/

'use strict';

SEA3D.AMMO = {

	world: null,

	rigidBodies: [],
	rigidBodiesTarget: [],
	rigidBodiesEnabled: [],

	constraints: [],

	vehicles: [],
	vehiclesWheels: [],

	ACTIVE: 1,
	ISLAND_SLEEPING: 2,
	WANTS_DEACTIVATION: 3,
	DISABLE_DEACTIVATION: 4,
	DISABLE_SIMULATION: 5,
	VERSION: 0.8,

	init: function ( gravity, worldScale, broadphase ) {

		gravity = gravity !== undefined ? gravity : - 90.8;

		this.worldScale = worldScale == undefined ? 1 : worldScale;
		this.broadphase = broadphase == undefined ? 'bvt' : broadphase;

		this.solver = new Ammo.btSequentialImpulseConstraintSolver();
		this.collisionConfig = new Ammo.btDefaultCollisionConfiguration();
		this.dispatcher = new Ammo.btCollisionDispatcher( this.collisionConfig );

		switch ( this.broadphase ) {

			case 'bvt':

				this.broadphase = new Ammo.btDbvtBroadphase();

				break;

			case 'sap':

				this.broadphase = new Ammo.btAxisSweep3(
					new Ammo.btVector3( - this.worldScale, - this.worldScale, - this.worldScale ),
					new Ammo.btVector3( this.worldScale, this.worldScale, this.worldScale ),
					4096
				);

				break;

			case 'simple':

				this.broadphase = new Ammo.btSimpleBroadphase();

				break;

		}

		this.world = new Ammo.btDiscreteDynamicsWorld( this.dispatcher, this.broadphase, this.solver, this.collisionConfig );

		this.setGravity( gravity );

		console.log( "THREE.AMMO " + this.VERSION );

	},

	setGravity: function ( gravity ) {

		this.gravity = gravity;

		this.world.setGravity( new Ammo.btVector3( 0, gravity, 0 ) );

		return this;

	},
	getGravity: function () {

		return this.gravity;

	},

	setEnabledRigidBody: function ( rb, enabled ) {

		var index = this.rigidBodies.indexOf( rb );

		if ( this.rigidBodiesEnabled[ index ] == enabled ) return;

		if ( enabled ) this.world.addRigidBody( rb );
		else this.world.removeRigidBody( rb );

		this.rigidBodiesEnabled[ index ] = true;

		return this;

	},
	getEnabledRigidBody: function ( rb ) {

		return this.rigidBodiesEnabled[ this.rigidBodies.indexOf( rb ) ];

	},
	addRigidBody: function ( rb, target, enabled ) {

		enabled = enabled !== undefined ? enabled : true;

		this.rigidBodies.push( rb );
		this.rigidBodiesTarget.push( target );
		this.rigidBodiesEnabled.push( false );

		this.setEnabledRigidBody( rb, enabled );

		return this;

	},
	removeRigidBody: function ( rb, destroy ) {

		var index = this.rigidBodies.indexOf( rb );

		this.setEnabledRigidBody( rb, false );

		this.rigidBodies.splice( index, 1 );
		this.rigidBodiesTarget.splice( index, 1 );
		this.rigidBodiesEnabled.splice( index, 1 );

		if ( destroy ) Ammo.destroy( rb );

		return this;

	},
	containsRigidBody: function ( rb ) {

		return this.rigidBodies.indexOf( rb ) > - 1;

	},

	addConstraint: function ( ctrt, disableCollisionsBetweenBodies ) {

		disableCollisionsBetweenBodies = disableCollisionsBetweenBodies == undefined ? true : disableCollisionsBetweenBodies;

		this.constraints.push( ctrt );
		this.world.addConstraint( ctrt, disableCollisionsBetweenBodies );

		return this;

	},
	removeConstraint: function ( ctrt, destroy ) {

		this.constraints.splice( this.constraints.indexOf( ctrt ), 1 );
		this.world.removeConstraint( ctrt );

		if ( destroy ) Ammo.destroy( ctrt );

		return this;

	},
	containsConstraint: function ( ctrt ) {

		return this.constraints.indexOf( rb ) > - 1;

	},

	addVehicle: function ( vehicle, wheels ) {

		this.vehicles.push( vehicle );
		this.vehiclesWheels.push( wheels != undefined ? wheels : [] );

		this.world.addAction( vehicle );

		return this;

	},
	removeVehicle: function ( vehicle, destroy ) {

		var index = this.vehicles.indexOf( vehicle );

		this.vehicles.splice( index, 1 );
		this.vehiclesWheels.splice( index, 1 );

		this.world.removeAction( vehicle );

		if ( destroy ) Ammo.destroy( vehicle );

		return this;

	},
	containsVehicle: function ( vehicle ) {

		return this.vehicles.indexOf( vehicle ) > - 1;

	},

	createTriangleMesh: function ( geometry, index, removeDuplicateVertices ) {

		index = index == undefined ? - 1 : index;
		removeDuplicateVertices = removeDuplicateVertices == undefined ? false : removeDuplicateVertices;

		var mTriMesh = new Ammo.btTriangleMesh();

		var v0 = new Ammo.btVector3( 0, 0, 0 );
		var v1 = new Ammo.btVector3( 0, 0, 0 );
		var v2 = new Ammo.btVector3( 0, 0, 0 );

		var vertex = geometry.getAttribute( 'position' ).array;
		var indexes = geometry.getIndex().array;

		var group = index >= 0 ? geometry.groups[ index ] : undefined,
			start = group ? group.start : 0,
			count = group ? group.count : indexes.length;

		var scale = 1 / this.worldScale;

		for ( var idx = start; idx < count; idx += 3 ) {

			var vx1 = indexes[ idx ] * 3,
				vx2 = indexes[ idx + 1 ] * 3,
				vx3 = indexes[ idx + 2 ] * 3;

			v0.setValue( vertex[ vx1 ] * scale, vertex[ vx1 + 1 ] * scale, vertex[ vx1 + 2 ] * scale );
			v1.setValue( vertex[ vx2 ] * scale, vertex[ vx2 + 1 ] * scale, vertex[ vx2 + 2 ] * scale );
			v2.setValue( vertex[ vx3 ] * scale, vertex[ vx3 + 1 ] * scale, vertex[ vx3 + 2 ] * scale );

			mTriMesh.addTriangle( v0, v1, v2, removeDuplicateVertices );

		}

		return mTriMesh;

	},
	createConvexHull: function ( geometry, index ) {

		index = index == undefined ? - 1 : index;

		var mConvexHull = new Ammo.btConvexHullShape();

		var v0 = new Ammo.btVector3( 0, 0, 0 );

		var vertex = geometry.getAttribute( 'position' ).array;
		var indexes = geometry.getIndex().array;

		var group = index >= 0 ? geometry.groups[ index ] : undefined,
			start = group ? group.start : 0,
			count = group ? group.count : indexes.length;

		var scale = 1 / this.worldScale;

		for ( var idx = start; idx < count; idx += 3 ) {

			var vx1 = indexes[ idx ] * 3;

			var point = new Ammo.btVector3(
				vertex[ vx1 ] * scale, vertex[ vx1 + 1 ] * scale, vertex[ vx1 + 2 ] * scale
			);

			mConvexHull.addPoint( point );

		}

		return mConvexHull;

	},

	getTargetByRigidBody: function ( rb ) {

		return this.rigidBodiesTarget[ this.rigidBodies.indexOf( rb ) ];

	},
	getRigidBodyByTarget: function ( target ) {

		return this.rigidBodies[ this.rigidBodiesTarget.indexOf( target ) ];

	},
	getTransformFromMatrix: function ( mtx ) {

		var transform = new Ammo.btTransform();

		var pos = THREE.SEA3D.VECBUF.setFromMatrixPosition( mtx );
		transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );

		var scl = THREE.SEA3D.VECBUF.setFromMatrixScale( mtx );
		mtx.scale( scl.set( 1 / scl.x, 1 / scl.y, 1 / scl.z ) );

		var quat = new THREE.Quaternion().setFromRotationMatrix( mtx );

		var q = new Ammo.btQuaternion();
		q.setValue( quat.x, quat.y, quat.z, quat.w );
		transform.setRotation( q );

		Ammo.destroy( q );

		return transform;

	},
	getMatrixFromTransform: function ( transform ) {

		var position = new THREE.Vector3();
		var quaternion = new THREE.Quaternion();
		var scale = new THREE.Vector3( 1, 1, 1 );

		return function ( transform, matrix ) {

			matrix = matrix || new THREE.Matrix4();

			var pos = transform.getOrigin(),
				quat = transform.getRotation();

			position.set( pos.x(), pos.y(), pos.z() );
			quaternion.set( quat.x(), quat.y(), quat.z(), quat.w() );

			matrix.compose( position, quaternion, scale );

			return matrix;

		};

	}(),

	updateTargetTransform: function () {

		var matrix = new THREE.Matrix4();

		var position = new THREE.Vector3();
		var quaternion = new THREE.Quaternion();
		var scale = new THREE.Vector3( 1, 1, 1 );

		return function ( obj3d, transform, offset ) {

			var pos = transform.getOrigin(),
				quat = transform.getRotation();

			if ( offset ) {

				position.set( pos.x(), pos.y(), pos.z() );
				quaternion.set( quat.x(), quat.y(), quat.z(), quat.w() );

				matrix.compose( position, quaternion, scale );

				matrix.multiplyMatrices( matrix, offset );

				obj3d.position.setFromMatrixPosition( matrix );
				obj3d.quaternion.setFromRotationMatrix( matrix );

			} else {

				obj3d.position.set( pos.x(), pos.y(), pos.z() );
				obj3d.quaternion.set( quat.x(), quat.y(), quat.z(), quat.w() );

			}

			return this;

		};

	}(),
	update: function ( delta, iteration, fixedDelta ) {

		this.world.stepSimulation( delta, iteration || 0, fixedDelta || ( 60 / 1000 ) );

		var i, j;

		for ( i = 0; i < this.vehicles.length; i ++ ) {

			var vehicle = this.vehicles[ i ],
				numWheels = vehicle.getNumWheels(),
				wheels = this.vehiclesWheels[ i ];

			for ( j = 0; j < numWheels; j ++ ) {

				vehicle.updateWheelTransform( j, true );

				var wheelsTransform = vehicle.getWheelTransformWS( j ),
					wheelTarget = wheels[ j ];

				if ( wheelTarget ) {

					this.updateTargetTransform( wheelTarget, wheelsTransform, wheelTarget.physics ? wheelTarget.physics.offset : null );

				}

			}

		}

		for ( i = 0; i < this.rigidBodies.length; i ++ ) {

			var rb = this.rigidBodies[ i ],
				target = this.rigidBodiesTarget[ i ];

			if ( target && rb.isActive() ) {

				this.updateTargetTransform( target, rb.getWorldTransform(), target.physics ? target.physics.offset : null );

			}

		}

		return this;

	}
};
