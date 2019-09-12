/**   _     _   _         _____  __   _______  ______
*    | |___| |_| |__    /__  |  |  |     |  _  | * *
*    | / _ \  _|    |    __\    |  |  \  |  _  |  U _
*    |_\___/\__|_||_| _ |____/____ |__ \_|_  |_|_____|
*
*    @author LoTh / http://3dflashlo.wordpress.com/
*    @author SUNAG / http://www.sunag.com.br/
*    @author Ammo.lab / https://github.com/lo-th/Ammo.lab/
*/

import {
	Vector3,
	Quaternion,
	Matrix4
} from "../../../../../build/three.module.js";

import { SEA3DSDK } from '../SEA3DSDK.js';
import { SEA3D } from '../SEA3DLoader.js';

var AMMO = {

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

		console.log( "SEA3D.AMMO " + this.VERSION );

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

		return this.constraints.indexOf( ctrt ) > - 1;

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

		var pos = SEA3D.VECBUF.setFromMatrixPosition( mtx );
		transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );

		var scl = SEA3D.VECBUF.setFromMatrixScale( mtx );
		mtx.scale( scl.set( 1 / scl.x, 1 / scl.y, 1 / scl.z ) );

		var quat = new Quaternion().setFromRotationMatrix( mtx );

		var q = new Ammo.btQuaternion();
		q.setValue( quat.x, quat.y, quat.z, quat.w );
		transform.setRotation( q );

		Ammo.destroy( q );

		return transform;

	},
	getMatrixFromTransform: function ( transform ) {

		var position = new Vector3();
		var quaternion = new Quaternion();
		var scale = new Vector3( 1, 1, 1 );

		return function ( transform, matrix ) {

			matrix = matrix || new Matrix4();

			var pos = transform.getOrigin(),
				quat = transform.getRotation();

			position.set( pos.x(), pos.y(), pos.z() );
			quaternion.set( quat.x(), quat.y(), quat.z(), quat.w() );

			matrix.compose( position, quaternion, scale );

			return matrix;

		};

	}(),

	updateTargetTransform: function () {

		var matrix = new Matrix4();

		var position = new Vector3();
		var quaternion = new Quaternion();
		var scale = new Vector3( 1, 1, 1 );

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

//
//	Utils
//

SEA3D.prototype.toAmmoVec3 = function ( v ) {

	return new Ammo.btVector3( v.x, v.y, v.z );

};

//
//	Sphere
//

SEA3D.prototype.readSphere = function ( sea ) {

	var shape = new Ammo.btSphereShape( sea.radius );

	this.domain.shapes = this.shapes = this.shapes || [];
	this.shapes.push( this.objects[ "shpe/" + sea.name ] = sea.tag = shape );

};

//
//	Box
//

SEA3D.prototype.readBox = function ( sea ) {

	var shape = new Ammo.btBoxShape( new Ammo.btVector3( sea.width * .5, sea.height * .5, sea.depth * .5 ) );

	this.domain.shapes = this.shapes = this.shapes || [];
	this.shapes.push( this.objects[ "shpe/" + sea.name ] = sea.tag = shape );

};

//
//	Cone
//

SEA3D.prototype.readCone = function ( sea ) {

	var shape = new Ammo.btConeShape( sea.radius, sea.height );

	this.domain.shapes = this.shapes = this.shapes || [];
	this.shapes.push( this.objects[ "shpe/" + sea.name ] = sea.tag = shape );

};

//
//	Cylinder
//

SEA3D.prototype.readCylinder = function ( sea ) {

	var shape = new Ammo.btCylinderShape( new Ammo.btVector3( sea.height, sea.radius, sea.radius ) );

	this.domain.shapes = this.shapes = this.shapes || [];
	this.shapes.push( this.objects[ "shpe/" + sea.name ] = sea.tag = shape );

};

//
//	Capsule
//

SEA3D.prototype.readCapsule = function ( sea ) {

	var shape = new Ammo.btCapsuleShape( sea.radius, sea.height );

	this.domain.shapes = this.shapes = this.shapes || [];
	this.shapes.push( this.objects[ "shpe/" + sea.name ] = sea.tag = shape );

};

//
//	Convex Geometry
//

SEA3D.prototype.readConvexGeometry = function ( sea ) {

	if ( this.config.convexHull ) {

		var shape = AMMO.createConvexHull( sea.geometry.tag, sea.subGeometryIndex );

	} else {

		var triMesh = AMMO.createTriangleMesh( sea.geometry.tag, sea.subGeometryIndex );

		var shape = new Ammo.btConvexTriangleMeshShape( triMesh, true );

	}

	this.domain.shapes = this.shapes = this.shapes || [];
	this.shapes.push( this.objects[ "shpe/" + sea.name ] = sea.tag = shape );

};

//
//	Triangle Geometry
//

SEA3D.prototype.readTriangleGeometry = function ( sea ) {

	var triMesh = AMMO.createTriangleMesh( sea.geometry.tag, sea.subGeometryIndex );

	var shape = new Ammo.btBvhTriangleMeshShape( triMesh, true, true );

	this.domain.shapes = this.shapes = this.shapes || [];
	this.shapes.push( this.objects[ "shpe/" + sea.name ] = sea.tag = shape );

};

//
//	Compound
//

SEA3D.prototype.readCompound = function ( sea ) {

	var shape = new Ammo.btCompoundShape();

	for ( var i = 0; i < sea.compounds.length; i ++ ) {

		var compound = sea.compounds[ i ];

		SEA3D.MTXBUF.elements = compound.transform;

		var transform = AMMO.getTransformFromMatrix( SEA3D.MTXBUF );

		shape.addChildShape( transform, compound.shape.tag );

	}

	this.domain.shapes = this.shapes = this.shapes || [];
	this.shapes.push( this.objects[ "shpe/" + sea.name ] = sea.tag = shape );

};

//
//	Rigid Body Base
//

SEA3D.prototype.readRigidBodyBase = function ( sea ) {

	var shape = sea.shape.tag,
		transform, target;

	if ( sea.target ) {

		target = sea.target.tag;

		target.physics = { enabled: true };
		target.updateMatrix();

		transform = AMMO.getTransformFromMatrix( sea.target.tag.matrix );

	} else {

		SEA3D.MTXBUF.fromArray( sea.transform );

		transform = AMMO.getTransformFromMatrix( SEA3D.MTXBUF );

	}

	var motionState = new Ammo.btDefaultMotionState( transform );
	var localInertia = new Ammo.btVector3( 0, 0, 0 );

	shape.calculateLocalInertia( sea.mass, localInertia );

	var info = new Ammo.btRigidBodyConstructionInfo( sea.mass, motionState, shape, localInertia );
	info.set_m_friction( sea.friction );
	info.set_m_restitution( sea.restitution );
	info.set_m_linearDamping( sea.linearDamping );
	info.set_m_angularDamping( sea.angularDamping );

	var rb = new Ammo.btRigidBody( info );

	if ( target ) {

		target.physics.rigidBody = rb;

		if ( sea.offset ) {

			var offset = new Matrix4();
			offset.fromArray( sea.offset );

			target.physics.offset = offset;

		}

	}

	Ammo.destroy( info );

	this.domain.rigidBodies = this.rigidBodies = this.rigidBodies || [];
	this.rigidBodies.push( this.objects[ "rb/" + sea.name ] = sea.tag = rb );

	return rb;

};

//
//	Rigid Body
//

SEA3D.prototype.readRigidBody = function ( sea ) {

	var rb = this.readRigidBodyBase( sea );

	AMMO.addRigidBody( rb, sea.target ? sea.target.tag : undefined, this.config.enabledPhysics );

};

//
//	Car Controller
//

SEA3D.prototype.readCarController = function ( sea ) {

	var body = this.readRigidBodyBase( sea );

	body.setActivationState( AMMO.DISABLE_DEACTIVATION );

	// Car

	var vehicleRayCaster = new Ammo.btDefaultVehicleRaycaster( AMMO.world );

	var tuning = new Ammo.btVehicleTuning();

	tuning.set_m_suspensionStiffness( sea.suspensionStiffness );
	tuning.set_m_suspensionDamping( sea.suspensionDamping );
	tuning.set_m_suspensionCompression( sea.suspensionCompression );
	tuning.set_m_maxSuspensionTravelCm( sea.maxSuspensionTravelCm );
	tuning.set_m_maxSuspensionForce( sea.maxSuspensionForce );
	tuning.set_m_frictionSlip( sea.frictionSlip );

	var vehicle = new Ammo.btRaycastVehicle( tuning, body, vehicleRayCaster ),
		wheels = [];

	vehicle.setCoordinateSystem( 0, 1, 2 );

	for ( var i = 0; i < sea.wheel.length; i ++ ) {

		var wheel = sea.wheel[ i ];

		var wheelInfo = vehicle.addWheel(
			this.toAmmoVec3( wheel.pos ),
			this.toAmmoVec3( wheel.dir ),
			this.toAmmoVec3( wheel.axle ),
			wheel.suspensionRestLength,
			wheel.radius,
			tuning,
			wheel.isFront
		);

		var target = wheels[ i ] = wheel.target ? wheel.target.tag : undefined;

		if ( target ) {

			target.physics = { enabled: true, rigidBody: wheelInfo };

			if ( wheel.offset ) {

				var offset = new Matrix4();
				offset.fromArray( wheel.offset );

				target.physics.offset = offset;

			}

			if ( target.parent ) {

				target.parent.remove( target );

			}

			if ( this.container ) {

				this.container.add( target );

			}

		}

		wheelInfo.set_m_suspensionStiffness( sea.suspensionStiffness );
		wheelInfo.set_m_wheelsDampingRelaxation( sea.dampingRelaxation );
		wheelInfo.set_m_wheelsDampingCompression( sea.dampingCompression );
		wheelInfo.set_m_frictionSlip( sea.frictionSlip );

	}

	AMMO.addVehicle( vehicle, wheels );
	AMMO.addRigidBody( body, sea.target ? sea.target.tag : undefined, this.config.enabledPhysics );

	this.domain.vehicles = this.vehicles = this.vehicles || [];
	this.vehicles.push( this.objects[ "vhc/" + sea.name ] = sea.tag = vehicle );

};

//
//	P2P Constraint
//

SEA3D.prototype.readP2PConstraint = function ( sea ) {

	var ctrt;

	if ( sea.targetB ) {

		ctrt = new Ammo.btPoint2PointConstraint(
			sea.targetA.tag,
			sea.targetB.tag,
			this.toAmmoVec3( sea.pointA ),
			this.toAmmoVec3( sea.pointB )
		);

	} else {

		ctrt = new Ammo.btPoint2PointConstraint(
			sea.targetA.tag,
			this.toAmmoVec3( sea.pointA )
		);

	}

	AMMO.addConstraint( ctrt );

	this.domain.constraints = this.constraints = this.constraints || [];
	this.constraints.push( this.objects[ "ctnt/" + sea.name ] = sea.tag = ctrt );

};

//
//	Hinge Constraint
//

SEA3D.prototype.readHingeConstraint = function ( sea ) {

	var ctrt;

	if ( sea.targetB ) {

		ctrt = new Ammo.btHingeConstraint(
			sea.targetA.tag,
			sea.targetB.tag,
			this.toAmmoVec3( sea.pointA ),
			this.toAmmoVec3( sea.pointB ),
			this.toAmmoVec3( sea.axisA ),
			this.toAmmoVec3( sea.axisB ),
			false
		);

	} else {

		ctrt = new Ammo.btHingeConstraint(
			sea.targetA.tag,
			this.toAmmoVec3( sea.pointA ),
			this.toAmmoVec3( sea.axisA ),
			false
		);

	}

	if ( sea.limit ) {

		ctrt.setLimit( sea.limit.low, sea.limit.high, sea.limit.softness, sea.limit.biasFactor, sea.limit.relaxationFactor );

	}

	if ( sea.angularMotor ) {

		ctrt.enableAngularMotor( true, sea.angularMotor.velocity, sea.angularMotor.impulse );

	}

	AMMO.addConstraint( ctrt );

	this.domain.constraints = this.constraints = this.constraints || [];
	this.constraints.push( this.objects[ "ctnt/" + sea.name ] = sea.tag = ctrt );

};

//
//	Cone Twist Constraint
//

SEA3D.prototype.readConeTwistConstraint = function ( sea ) {

	var ctrt;

	if ( sea.targetB ) {

		ctrt = new Ammo.btConeTwistConstraint(
			sea.targetA.tag,
			sea.targetB.tag,
			this.toAmmoVec3( sea.pointA ),
			this.toAmmoVec3( sea.pointB ),
			false
		);

	} else {

		ctrt = new Ammo.btConeTwistConstraint(
			sea.targetA.tag,
			this.toAmmoVec3( sea.pointA ),
			false
		);

	}

	AMMO.addConstraint( ctrt );

	this.domain.constraints = this.constraints = this.constraints || [];
	this.constraints.push( this.objects[ "ctnt/" + sea.name ] = sea.tag = ctrt );

};

//
//	Domain
//

SEA3D.Domain.prototype.enabledPhysics = function ( enabled ) {

	var i = this.rigidBodies ? this.rigidBodies.length : 0;

	while ( i -- ) {

		AMMO.setEnabledRigidBody( this.rigidBodies[ i ], enabled );

	}

};

SEA3D.Domain.prototype.applyContainerTransform = function () {

	this.container.updateMatrix();

	var matrix = this.container.matrix.clone();

	this.container.position.set( 0, 0, 0 );
	this.container.quaternion.set( 0, 0, 0, 1 );
	this.container.scale.set( 1, 1, 1 );

	this.applyTransform( matrix );

};

SEA3D.Domain.prototype.applyTransform = function ( matrix ) {

	var mtx = SEA3D.MTXBUF, vec = SEA3D.VECBUF;

	var i = this.rigidBodies ? this.rigidBodies.length : 0,
		childs = this.container ? this.container.children : [],
		targets = [];

	while ( i -- ) {

		var rb = this.rigidBodies[ i ],
			target = AMMO.getTargetByRigidBody( rb ),
			transform = rb.getWorldTransform(),
			transformMatrix = AMMO.getMatrixFromTransform( transform );

		transformMatrix.multiplyMatrices( transformMatrix, matrix );

		transform = AMMO.getTransformFromMatrix( transformMatrix );

		rb.setWorldTransform( transform );

		if ( target ) targets.push( target );

	}

	for ( i = 0; i < childs.length; i ++ ) {

		var obj3d = childs[ i ];

		if ( targets.indexOf( obj3d ) > - 1 ) continue;

		obj3d.updateMatrix();

		mtx.copy( obj3d.matrix );

		mtx.multiplyMatrices( matrix, mtx );

		obj3d.position.setFromMatrixPosition( mtx );
		obj3d.scale.setFromMatrixScale( mtx );

		// ignore rotation scale

		mtx.scale( vec.set( 1 / obj3d.scale.x, 1 / obj3d.scale.y, 1 / obj3d.scale.z ) );
		obj3d.quaternion.setFromRotationMatrix( mtx );

	}

};

//
//	Extension
//

SEA3D.Domain.prototype.getShape = SEA3D.prototype.getShape = function ( name ) {

	return this.objects[ "shpe/" + name ];

};

SEA3D.Domain.prototype.getRigidBody = SEA3D.prototype.getRigidBody = function ( name ) {

	return this.objects[ "rb/" + name ];

};

SEA3D.Domain.prototype.getConstraint = SEA3D.prototype.getConstraint = function ( name ) {

	return this.objects[ "ctnt/" + name ];

};

SEA3D.EXTENSIONS_LOADER.push( {

	parse: function () {

		delete this.shapes;
		delete this.rigidBodies;
		delete this.vehicles;
		delete this.constraints;

	},

	setTypeRead: function () {

		// CONFIG

		this.config.physics = this.config.physics !== undefined ? this.config.physics : true;
		this.config.convexHull = this.config.convexHull !== undefined ? this.config.convexHull : true;
		this.config.enabledPhysics = this.config.enabledPhysics !== undefined ? this.config.enabledPhysics : true;

		if ( this.config.physics ) {

			// SHAPES

			this.file.typeRead[ SEA3DSDK.Sphere.prototype.type ] = this.readSphere;
			this.file.typeRead[ SEA3DSDK.Box.prototype.type ] = this.readBox;
			this.file.typeRead[ SEA3DSDK.Capsule.prototype.type ] = this.readCapsule;
			this.file.typeRead[ SEA3DSDK.Cone.prototype.type ] = this.readCone;
			this.file.typeRead[ SEA3DSDK.Cylinder.prototype.type ] = this.readCylinder;
			this.file.typeRead[ SEA3DSDK.ConvexGeometry.prototype.type ] = this.readConvexGeometry;
			this.file.typeRead[ SEA3DSDK.TriangleGeometry.prototype.type ] = this.readTriangleGeometry;
			this.file.typeRead[ SEA3DSDK.Compound.prototype.type ] = this.readCompound;

			// CONSTRAINTS

			this.file.typeRead[ SEA3DSDK.P2PConstraint.prototype.type ] = this.readP2PConstraint;
			this.file.typeRead[ SEA3DSDK.HingeConstraint.prototype.type ] = this.readHingeConstraint;
			this.file.typeRead[ SEA3DSDK.ConeTwistConstraint.prototype.type ] = this.readConeTwistConstraint;

			// PHYSICS

			this.file.typeRead[ SEA3DSDK.RigidBody.prototype.type ] = this.readRigidBody;
			this.file.typeRead[ SEA3DSDK.CarController.prototype.type ] = this.readCarController;

		}

	}
} );

SEA3D.EXTENSIONS_DOMAIN.push( {

	dispose: function () {

		var i;

		i = this.rigidBodies ? this.rigidBodies.length : 0;
		while ( i -- ) AMMO.removeRigidBody( this.rigidBodies[ i ], true );

		i = this.vehicles ? this.vehicles.length : 0;
		while ( i -- ) AMMO.removeVehicle( this.vehicles[ i ], true );

		i = this.constraints ? this.constraints.length : 0;
		while ( i -- ) AMMO.removeConstraint( this.constraints[ i ], true );

		i = this.shapes ? this.shapes.length : 0;
		while ( i -- ) Ammo.destroy( this.shapes[ i ] );

	}

} );

export { AMMO };
