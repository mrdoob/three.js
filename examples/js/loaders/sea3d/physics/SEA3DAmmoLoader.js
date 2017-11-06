/**
 * 	SEA3D+AMMO for Three.JS
 * 	@author Sunag / http://www.sunag.com.br/
 */

'use strict';

THREE.SEA3D.prototype.toAmmoVec3 = function ( v ) {

	return new Ammo.btVector3( v.x, v.y, v.z );

};

//
//	Sphere
//

THREE.SEA3D.prototype.readSphere = function ( sea ) {

	var shape = new Ammo.btSphereShape( sea.radius );

	this.domain.shapes = this.shapes = this.shapes || [];
	this.shapes.push( this.objects[ "shpe/" + sea.name ] = sea.tag = shape );

};

//
//	Box
//

THREE.SEA3D.prototype.readBox = function ( sea ) {

	var shape = new Ammo.btBoxShape( new Ammo.btVector3( sea.width * .5, sea.height * .5, sea.depth * .5 ) );

	this.domain.shapes = this.shapes = this.shapes || [];
	this.shapes.push( this.objects[ "shpe/" + sea.name ] = sea.tag = shape );

};

//
//	Cone
//

THREE.SEA3D.prototype.readCone = function ( sea ) {

	var shape = new Ammo.btConeShape( sea.radius, sea.height );

	this.domain.shapes = this.shapes = this.shapes || [];
	this.shapes.push( this.objects[ "shpe/" + sea.name ] = sea.tag = shape );

};

//
//	Cylinder
//

THREE.SEA3D.prototype.readCylinder = function ( sea ) {

	var shape = new Ammo.btCylinderShape( new Ammo.btVector3( sea.height, sea.radius, sea.radius ) );

	this.domain.shapes = this.shapes = this.shapes || [];
	this.shapes.push( this.objects[ "shpe/" + sea.name ] = sea.tag = shape );

};

//
//	Capsule
//

THREE.SEA3D.prototype.readCapsule = function ( sea ) {

	var shape = new Ammo.btCapsuleShape( sea.radius, sea.height );

	this.domain.shapes = this.shapes = this.shapes || [];
	this.shapes.push( this.objects[ "shpe/" + sea.name ] = sea.tag = shape );

};

//
//	Convex Geometry
//

THREE.SEA3D.prototype.readConvexGeometry = function ( sea ) {

	if ( this.config.convexHull ) {

		var shape = SEA3D.AMMO.createConvexHull( sea.geometry.tag, sea.subGeometryIndex );

	} else {

		var triMesh = SEA3D.AMMO.createTriangleMesh( sea.geometry.tag, sea.subGeometryIndex );

		var shape = new Ammo.btConvexTriangleMeshShape( triMesh, true );

	}

	this.domain.shapes = this.shapes = this.shapes || [];
	this.shapes.push( this.objects[ "shpe/" + sea.name ] = sea.tag = shape );

};

//
//	Triangle Geometry
//

THREE.SEA3D.prototype.readTriangleGeometry = function ( sea ) {

	var triMesh = SEA3D.AMMO.createTriangleMesh( sea.geometry.tag, sea.subGeometryIndex );

	var shape = new Ammo.btBvhTriangleMeshShape( triMesh, true, true );

	this.domain.shapes = this.shapes = this.shapes || [];
	this.shapes.push( this.objects[ "shpe/" + sea.name ] = sea.tag = shape );

};

//
//	Compound
//

THREE.SEA3D.prototype.readCompound = function ( sea ) {

	var shape = new Ammo.btCompoundShape();

	for ( var i = 0; i < sea.compounds.length; i ++ ) {

		var compound = sea.compounds[ i ];

		THREE.SEA3D.MTXBUF.elements = compound.transform;

		var transform = SEA3D.AMMO.getTransformFromMatrix( THREE.SEA3D.MTXBUF );

		shape.addChildShape( transform, compound.shape.tag );

	}

	this.domain.shapes = this.shapes = this.shapes || [];
	this.shapes.push( this.objects[ "shpe/" + sea.name ] = sea.tag = shape );

};

//
//	Rigid Body Base
//

THREE.SEA3D.prototype.readRigidBodyBase = function ( sea ) {

	var shape = sea.shape.tag,
		transform, target;

	if ( sea.target ) {

		target = sea.target.tag;

		target.physics = { enabled: true };
		target.updateMatrix();

		transform = SEA3D.AMMO.getTransformFromMatrix( sea.target.tag.matrix );

	} else {

		THREE.SEA3D.MTXBUF.fromArray( sea.transform );

		transform = SEA3D.AMMO.getTransformFromMatrix( THREE.SEA3D.MTXBUF );

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

			var offset = new THREE.Matrix4();
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

THREE.SEA3D.prototype.readRigidBody = function ( sea ) {

	var rb = this.readRigidBodyBase( sea );

	SEA3D.AMMO.addRigidBody( rb, sea.target ? sea.target.tag : undefined, this.config.enabledPhysics );

};

//
//	Car Controller
//

THREE.SEA3D.prototype.readCarController = function ( sea ) {

	var body = this.readRigidBodyBase( sea );

	body.setActivationState( SEA3D.AMMO.DISABLE_DEACTIVATION );

	// Car

	var vehicleRayCaster = new Ammo.btDefaultVehicleRaycaster( SEA3D.AMMO.world );

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

				var offset = new THREE.Matrix4();
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

	SEA3D.AMMO.addVehicle( vehicle, wheels );
	SEA3D.AMMO.addRigidBody( body, sea.target ? sea.target.tag : undefined, this.config.enabledPhysics );

	this.domain.vehicles = this.vehicles = this.vehicles || [];
	this.vehicles.push( this.objects[ "vhc/" + sea.name ] = sea.tag = vehicle );

};

//
//	P2P Constraint
//

THREE.SEA3D.prototype.readP2PConstraint = function ( sea ) {

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

	SEA3D.AMMO.addConstraint( ctrt );

	this.domain.constraints = this.constraints = this.constraints || [];
	this.constraints.push( this.objects[ "ctnt/" + sea.name ] = sea.tag = ctrt );

};

//
//	Hinge Constraint
//

THREE.SEA3D.prototype.readHingeConstraint = function ( sea ) {

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

	SEA3D.AMMO.addConstraint( ctrt );

	this.domain.constraints = this.constraints = this.constraints || [];
	this.constraints.push( this.objects[ "ctnt/" + sea.name ] = sea.tag = ctrt );

};

//
//	Cone Twist Constraint
//

THREE.SEA3D.prototype.readConeTwistConstraint = function ( sea ) {

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

	SEA3D.AMMO.addConstraint( ctrt );

	this.domain.constraints = this.constraints = this.constraints || [];
	this.constraints.push( this.objects[ "ctnt/" + sea.name ] = sea.tag = ctrt );

};

//
//	Domain
//

THREE.SEA3D.Domain.prototype.enabledPhysics = function ( enabled ) {

	var i = this.rigidBodies ? this.rigidBodies.length : 0;

	while ( i -- ) {

		SEA3D.AMMO.setEnabledRigidBody( this.rigidBodies[ i ], enabled );

	}

};

THREE.SEA3D.Domain.prototype.applyContainerTransform = function () {

	this.container.updateMatrix();

	var matrix = this.container.matrix.clone();

	this.container.position.set( 0, 0, 0 );
	this.container.rotation.set( 0, 0, 0 );
	this.container.scale.set( 1, 1, 1 );

	this.applyTransform( matrix );

};

THREE.SEA3D.Domain.prototype.applyTransform = function ( matrix ) {

	var mtx = THREE.SEA3D.MTXBUF, vec = THREE.SEA3D.VECBUF;

	var i = this.rigidBodies ? this.rigidBodies.length : 0,
		childs = this.container ? this.container.children : [],
		targets = [];

	while ( i -- ) {

		var rb = this.rigidBodies[ i ],
			target = SEA3D.AMMO.getTargetByRigidBody( rb ),
			transform = rb.getWorldTransform(),
			transformMatrix = SEA3D.AMMO.getMatrixFromTransform( transform );

		transformMatrix.multiplyMatrices( transformMatrix, matrix );

		transform = SEA3D.AMMO.getTransformFromMatrix( transformMatrix );

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
		obj3d.rotation.setFromRotationMatrix( mtx );

	}

};

//
//	Extension
//

THREE.SEA3D.Domain.prototype.getShape = THREE.SEA3D.prototype.getShape = function ( name ) {

	return this.objects[ "shpe/" + name ];

};

THREE.SEA3D.Domain.prototype.getRigidBody = THREE.SEA3D.prototype.getRigidBody = function ( name ) {

	return this.objects[ "rb/" + name ];

};

THREE.SEA3D.Domain.prototype.getConstraint = THREE.SEA3D.prototype.getConstraint = function ( name ) {

	return this.objects[ "ctnt/" + name ];

};

THREE.SEA3D.EXTENSIONS_LOADER.push( {

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

			this.file.typeRead[ SEA3D.Sphere.prototype.type ] = this.readSphere;
			this.file.typeRead[ SEA3D.Box.prototype.type ] = this.readBox;
			this.file.typeRead[ SEA3D.Capsule.prototype.type ] = this.readCapsule;
			this.file.typeRead[ SEA3D.Cone.prototype.type ] = this.readCone;
			this.file.typeRead[ SEA3D.Cylinder.prototype.type ] = this.readCylinder;
			this.file.typeRead[ SEA3D.ConvexGeometry.prototype.type ] = this.readConvexGeometry;
			this.file.typeRead[ SEA3D.TriangleGeometry.prototype.type ] = this.readTriangleGeometry;
			this.file.typeRead[ SEA3D.Compound.prototype.type ] = this.readCompound;

			// CONSTRAINTS

			this.file.typeRead[ SEA3D.P2PConstraint.prototype.type ] = this.readP2PConstraint;
			this.file.typeRead[ SEA3D.HingeConstraint.prototype.type ] = this.readHingeConstraint;
			this.file.typeRead[ SEA3D.ConeTwistConstraint.prototype.type ] = this.readConeTwistConstraint;

			// PHYSICS

			this.file.typeRead[ SEA3D.RigidBody.prototype.type ] = this.readRigidBody;
			this.file.typeRead[ SEA3D.CarController.prototype.type ] = this.readCarController;

		}

	}
} );

THREE.SEA3D.EXTENSIONS_DOMAIN.push( {

	dispose: function () {

		var i;

		i = this.rigidBodies ? this.rigidBodies.length : 0;
		while ( i -- ) SEA3D.AMMO.removeRigidBody( this.rigidBodies[ i ], true );

		i = this.vehicles ? this.vehicles.length : 0;
		while ( i -- ) SEA3D.AMMO.removeVehicle( this.vehicles[ i ], true );

		i = this.constraints ? this.constraints.length : 0;
		while ( i -- ) SEA3D.AMMO.removeConstraint( this.constraints[ i ], true );

		i = this.shapes ? this.shapes.length : 0;
		while ( i -- ) Ammo.destroy( this.shapes[ i ] );

	}

} );
