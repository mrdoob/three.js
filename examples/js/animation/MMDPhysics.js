/**
 * @author takahiro / https://github.com/takahirox
 *
 * Dependencies
 *  - Ammo.js https://github.com/kripken/ammo.js
 *
 *
 * MMD specific Physics class.
 *
 * See THREE.MMDLoader for the passed parameter list of RigidBody/Constraint.
 *
 *
 * TODO
 *  - use Physijs http://chandlerprall.github.io/Physijs/
 *    and improve the performance by making use of Web worker.
 *  - if possible, make this class being non-MMD specific.
 */

THREE.MMDPhysics = function ( mesh, params ) {

	this.mesh = mesh;
	this.helper = new THREE.MMDPhysics.PhysicsHelper();

	/*
	 * Note: Default 1 / 65 unit step is a workaround that
	 *       some bones go wrong at near 60fps if it's 1 / 60.
	 *       Be careful that small unitStep could cause heavy
	 *       physics calculation.
	 */
	this.unitStep = ( params && params.unitStep ) ? params.unitStep : 1 / 65;
	this.maxStepNum = ( params && params.maxStepNum ) ? params.maxStepNum : 3;

	this.world = null;
	this.bodies = [];
	this.constraints = [];

	this.init();

};

THREE.MMDPhysics.prototype = {

	constructor: THREE.MMDPhysics,

	init: function () {

		this.initWorld();
		this.initRigidBodies();
		this.initConstraints();
		this.reset();

	},

	initWorld: function () {

		var config = new Ammo.btDefaultCollisionConfiguration();
		var dispatcher = new Ammo.btCollisionDispatcher( config );
		var cache = new Ammo.btDbvtBroadphase();
		var solver = new Ammo.btSequentialImpulseConstraintSolver();
		var world = new Ammo.btDiscreteDynamicsWorld( dispatcher, cache, solver, config );
		world.setGravity( new Ammo.btVector3( 0, -10 * 10, 0 ) );
		this.world = world;

	},

	initRigidBodies: function () {

		var bodies = this.mesh.geometry.rigidBodies;

		for ( var i = 0; i < bodies.length; i++ ) {

			var b = new THREE.MMDPhysics.RigidBody( this.mesh, this.world, bodies[ i ], this.helper );
			this.bodies.push( b );

		}

	},

	initConstraints: function () {

		var constraints = this.mesh.geometry.constraints;

		for ( var i = 0; i < constraints.length; i++ ) {

			var params = constraints[ i ];
			var bodyA = this.bodies[ params.rigidBodyIndex1 ];
			var bodyB = this.bodies[ params.rigidBodyIndex2 ];
			var c = new THREE.MMDPhysics.Constraint( this.mesh, this.world, bodyA, bodyB, params, this.helper );
			this.constraints.push( c );

		}


	},

	update: function ( delta ) {

		var unitStep = this.unitStep;
		var stepTime = delta;
		var maxStepNum = ( ( delta / unitStep ) | 0 ) + 1;

		if ( maxStepNum > this.maxStepNum ) {

			maxStepNum = this.maxStepNum;

		}

		this.updateRigidBodies();
		this.world.stepSimulation( stepTime, maxStepNum, unitStep );
		this.updateBones();

	},

	updateRigidBodies: function () {

		for ( var i = 0; i < this.bodies.length; i++ ) {

			this.bodies[ i ].updateFromBone();

		}

	},

	updateBones: function () {

		for ( var i = 0; i < this.bodies.length; i++ ) {

			this.bodies[ i ].updateBone();

		}

	},

	reset: function () {

		for ( var i = 0; i < this.bodies.length; i++ ) {

			this.bodies[ i ].reset();

		}

	},

	warmup: function ( cycles ) {

		for ( var i = 0; i < cycles; i++ ) {

			this.update( 1 );

		}

	}

};

/**
 * This helper class responsibilies are
 *
 * 1. manage Ammo.js and Three.js object resources and
 *    improve the performance and the memory consumption by
 *    reusing objects.
 *
 * 2. provide simple Ammo object operations.
 */
THREE.MMDPhysics.PhysicsHelper = function () {

	// for Three.js
	this.threeVector3s = [];
	this.threeMatrix4s = [];
	this.threeQuaternions = [];

	// for Ammo.js
	this.transforms = [];
	this.quaternions = [];
	this.vector3s = [];

};

THREE.MMDPhysics.PhysicsHelper.prototype = {

	allocThreeVector3: function () {

		return ( this.threeVector3s.length > 0 ) ? this.threeVector3s.pop() : new THREE.Vector3();

	},

	freeThreeVector3: function ( v ) {

		this.threeVector3s.push( v );

	},

	allocThreeMatrix4: function () {

		return ( this.threeMatrix4s.length > 0 ) ? this.threeMatrix4s.pop() : new THREE.Matrix4();

	},

	freeThreeMatrix4: function ( m ) {

		this.threeMatrix4s.push( m );

	},

	allocThreeQuaternion: function () {

		return ( this.threeQuaternions.length > 0 ) ? this.threeQuaternions.pop() : new THREE.Quaternion();

	},

	freeThreeQuaternion: function ( q ) {

		this.threeQuaternions.push( q );

	},

	allocTransform: function () {

		return ( this.transforms.length > 0 ) ? this.transforms.pop() : new Ammo.btTransform();

	},

	freeTransform: function ( t ) {

		this.transforms.push( t );

	},

	allocQuaternion: function () {

		return ( this.quaternions.length > 0 ) ? this.quaternions.pop() : new Ammo.btQuaternion();

	},

	freeQuaternion: function ( q ) {

		this.quaternions.push( q );

	},

	allocVector3: function () {

		return ( this.vector3s.length > 0 ) ? this.vector3s.pop() : new Ammo.btVector3();

	},

	freeVector3: function ( v ) {

		this.vector3s.push( v );

	},

	setIdentity: function ( t ) {

		t.setIdentity();

	},

	getBasis: function ( t ) {

		var q = this.allocQuaternion();
		t.getBasis().getRotation( q );
		return q;

	},

	getBasisAsMatrix3: function ( t ) {

		var q = this.getBasis( t );
		var m = this.quaternionToMatrix3( q );
		this.freeQuaternion( q );
		return m;

	},

	getOrigin: function( t ) {

		return t.getOrigin();

	},

	setOrigin: function( t, v ) {

		t.getOrigin().setValue( v.x(), v.y(), v.z() );

	},

	copyOrigin: function( t1, t2 ) {

		var o = t2.getOrigin();
		this.setOrigin( t1, o );

	},

	setBasis: function( t, q ) {

		t.setRotation( q );

	},

	setBasisFromMatrix3: function( t, m ) {

		var q = this.matrix3ToQuaternion( m );
		this.setBasis( t, q );
		this.freeQuaternion( q );

	},

	setOriginFromArray3: function ( t, a ) {

		t.getOrigin().setValue( a[ 0 ], a[ 1 ], a[ 2 ] );

	},

	setBasisFromArray3: function ( t, a ) {

		t.getBasis().setEulerZYX( a[ 0 ], a[ 1 ], a[ 2 ] );

	},

	setBasisFromArray4: function ( t, a ) {

		var q = this.array4ToQuaternion( a );
		this.setBasis( t, q );
		this.freeQuaternion( q );

	},

	array4ToQuaternion: function( a ) {

		var q = this.allocQuaternion();
		q.setX( a[ 0 ] );
		q.setY( a[ 1 ] );
		q.setZ( a[ 2 ] );
		q.setW( a[ 3 ] );
		return q;

	},

	multiplyTransforms: function ( t1, t2 ) {

		var t = this.allocTransform();
		this.setIdentity( t );

		var m1 = this.getBasisAsMatrix3( t1 );
		var m2 = this.getBasisAsMatrix3( t2 );

		var o1 = this.getOrigin( t1 );
		var o2 = this.getOrigin( t2 );

		var v1 = this.multiplyMatrix3ByVector3( m1, o2 );
		var v2 = this.addVector3( v1, o1 );
		this.setOrigin( t, v2 );

		var m3 = this.multiplyMatrices3( m1, m2 );
		this.setBasisFromMatrix3( t, m3 );

		this.freeVector3( v1 );
		this.freeVector3( v2 );

		return t;

	},

	inverseTransform: function ( t ) {

		var t2 = this.allocTransform();

		var m1 = this.getBasisAsMatrix3( t );
		var o = this.getOrigin( t );

		var m2 = this.transposeMatrix3( m1 );
		var v1 = this.negativeVector3( o );
		var v2 = this.multiplyMatrix3ByVector3( m2, v1 );

		this.setOrigin( t2, v2 );
		this.setBasisFromMatrix3( t2, m2 );

		this.freeVector3( v1 );
		this.freeVector3( v2 );

		return t2;

	},

	multiplyMatrices3: function ( m1, m2 ) {

		var m3 = [];

		var v10 = this.rowOfMatrix3( m1, 0 );
		var v11 = this.rowOfMatrix3( m1, 1 );
		var v12 = this.rowOfMatrix3( m1, 2 );

		var v20 = this.columnOfMatrix3( m2, 0 );
		var v21 = this.columnOfMatrix3( m2, 1 );
		var v22 = this.columnOfMatrix3( m2, 2 );

		m3[ 0 ] = this.dotVectors3( v10, v20 );
		m3[ 1 ] = this.dotVectors3( v10, v21 );
		m3[ 2 ] = this.dotVectors3( v10, v22 );
		m3[ 3 ] = this.dotVectors3( v11, v20 );
		m3[ 4 ] = this.dotVectors3( v11, v21 );
		m3[ 5 ] = this.dotVectors3( v11, v22 );
		m3[ 6 ] = this.dotVectors3( v12, v20 );
		m3[ 7 ] = this.dotVectors3( v12, v21 );
		m3[ 8 ] = this.dotVectors3( v12, v22 );

		this.freeVector3( v10 );
		this.freeVector3( v11 );
		this.freeVector3( v12 );
		this.freeVector3( v20 );
		this.freeVector3( v21 );
		this.freeVector3( v22 );

		return m3;

	},

	addVector3: function( v1, v2 ) {

		var v = this.allocVector3();
		v.setValue( v1.x() + v2.x(), v1.y() + v2.y(), v1.z() + v2.z() );
		return v;

	},

	dotVectors3: function( v1, v2 ) {

		return v1.x() * v2.x() + v1.y() * v2.y() + v1.z() * v2.z();

	},

	rowOfMatrix3: function( m, i ) {

		var v = this.allocVector3();
		v.setValue( m[ i * 3 + 0 ], m[ i * 3 + 1 ], m[ i * 3 + 2 ] );
		return v;

	},

	columnOfMatrix3: function( m, i ) {

		var v = this.allocVector3();
		v.setValue( m[ i + 0 ], m[ i + 3 ], m[ i + 6 ] );
		return v;

	},

	negativeVector3: function( v ) {

		var v2 = this.allocVector3();
		v2.setValue( -v.x(), -v.y(), -v.z() );
		return v2;

	},

	multiplyMatrix3ByVector3: function ( m, v ) {

		var v4 = this.allocVector3();

		var v0 = this.rowOfMatrix3( m, 0 );
		var v1 = this.rowOfMatrix3( m, 1 );
		var v2 = this.rowOfMatrix3( m, 2 );
		var x = this.dotVectors3( v0, v );
		var y = this.dotVectors3( v1, v );
		var z = this.dotVectors3( v2, v );

		v4.setValue( x, y, z );

		this.freeVector3( v0 );
		this.freeVector3( v1 );
		this.freeVector3( v2 );

		return v4;

	},

	transposeMatrix3: function( m ) {

		var m2 = [];
		m2[ 0 ] = m[ 0 ];
		m2[ 1 ] = m[ 3 ];
		m2[ 2 ] = m[ 6 ];
		m2[ 3 ] = m[ 1 ];
		m2[ 4 ] = m[ 4 ];
		m2[ 5 ] = m[ 7 ];
		m2[ 6 ] = m[ 2 ];
		m2[ 7 ] = m[ 5 ];
		m2[ 8 ] = m[ 8 ];
		return m2;

	},

	quaternionToMatrix3: function ( q ) {

		var m = [];

		var x = q.x();
		var y = q.y();
		var z = q.z();
		var w = q.w();

		var xx = x * x;
		var yy = y * y;
		var zz = z * z;

		var xy = x * y;
		var yz = y * z;
		var zx = z * x;

		var xw = x * w;
		var yw = y * w;
		var zw = z * w;

		m[ 0 ] = 1 - 2 * ( yy + zz );
		m[ 1 ] = 2 * ( xy - zw );
		m[ 2 ] = 2 * ( zx + yw );
		m[ 3 ] = 2 * ( xy + zw );
		m[ 4 ] = 1 - 2 * ( zz + xx );
		m[ 5 ] = 2 * ( yz - xw );
		m[ 6 ] = 2 * ( zx - yw );
		m[ 7 ] = 2 * ( yz + xw );
		m[ 8 ] = 1 - 2 * ( xx + yy );

		return m;

	},

	matrix3ToQuaternion: function( m ) {

		var t = m[ 0 ] + m[ 4 ] + m[ 8 ];
		var s, x, y, z, w;

		if( t > 0 ) {

			s = Math.sqrt( t + 1.0 ) * 2;
			w = 0.25 * s;
			x = ( m[ 7 ] - m[ 5 ] ) / s;
			y = ( m[ 2 ] - m[ 6 ] ) / s; 
			z = ( m[ 3 ] - m[ 1 ] ) / s; 

		} else if( ( m[ 0 ] > m[ 4 ] ) && ( m[ 0 ] > m[ 8 ] ) ) {

			s = Math.sqrt( 1.0 + m[ 0 ] - m[ 4 ] - m[ 8 ] ) * 2;
			w = ( m[ 7 ] - m[ 5 ] ) / s;
			x = 0.25 * s;
			y = ( m[ 1 ] + m[ 3 ] ) / s;
			z = ( m[ 2 ] + m[ 6 ] ) / s;

		} else if( m[ 4 ] > m[ 8 ] ) {

			s = Math.sqrt( 1.0 + m[ 4 ] - m[ 0 ] - m[ 8 ] ) * 2;
			w = ( m[ 2 ] - m[ 6 ] ) / s;
			x = ( m[ 1 ] + m[ 3 ] ) / s;
			y = 0.25 * s;
			z = ( m[ 5 ] + m[ 7 ] ) / s;

		} else {

			s = Math.sqrt( 1.0 + m[ 8 ] - m[ 0 ] - m[ 4 ] ) * 2;
			w = ( m[ 3 ] - m[ 1 ] ) / s;
			x = ( m[ 2 ] + m[ 6 ] ) / s;
			y = ( m[ 5 ] + m[ 7 ] ) / s;
			z = 0.25 * s;

		}

		var q = this.allocQuaternion();
		q.setX( x );
		q.setY( y );
		q.setZ( z );
		q.setW( w );
		return q;

	},

};

THREE.MMDPhysics.RigidBody = function ( mesh, world, params, helper ) {

	this.mesh  = mesh;
	this.world = world;
	this.params = params;
	this.helper = helper;

	this.body = null;
	this.bone = null;
	this.boneOffsetForm = null;
	this.boneOffsetFormInverse = null;

	this.init();

};

THREE.MMDPhysics.RigidBody.prototype = {

	constructor: THREE.MMDPhysics.RigidBody,

	init: function () {

		function generateShape ( p ) {

			switch( p.shapeType ) {

				case 0:
					return new Ammo.btSphereShape( p.width );

				case 1:
					return new Ammo.btBoxShape( new Ammo.btVector3( p.width, p.height, p.depth ) );

				case 2:
					return new Ammo.btCapsuleShape( p.width, p.height );

				default:
					throw 'unknown shape type ' + p.shapeType;

			}

		};

		var helper = this.helper;
		var params = this.params;
		var bones = this.mesh.skeleton.bones;
		var bone = ( params.boneIndex === -1 ) ? new THREE.Bone() : bones[ params.boneIndex ];

		var shape = generateShape( params );
		var weight = ( params.type === 0 ) ? 0 : params.weight;
		var localInertia = helper.allocVector3();
		localInertia.setValue( 0, 0, 0 );

		if( weight !== 0 ) {

			shape.calculateLocalInertia( weight, localInertia );

		}

		var boneOffsetForm = helper.allocTransform();
		helper.setIdentity( boneOffsetForm );
		helper.setOriginFromArray3( boneOffsetForm, params.position );
		helper.setBasisFromArray3( boneOffsetForm, params.rotation );

		var boneForm = helper.allocTransform();
		helper.setIdentity( boneForm );
		helper.setOriginFromArray3( boneForm, bone.getWorldPosition().toArray() );

		var form = helper.multiplyTransforms( boneForm, boneOffsetForm );
		var state = new Ammo.btDefaultMotionState( form );

		var info = new Ammo.btRigidBodyConstructionInfo( weight, state, shape, localInertia );
		info.set_m_friction( params.friction );
		info.set_m_restitution( params.restriction );

		var body = new Ammo.btRigidBody( info );

		if ( params.type === 0 ) {

			body.setCollisionFlags( body.getCollisionFlags() | 2 );
			body.setActivationState( 4 );

		}

		body.setDamping( params.positionDamping, params.rotationDamping );
		body.setSleepingThresholds( 0, 0 );

		this.world.addRigidBody( body, 1 << params.groupIndex, params.groupTarget );

		this.body = body;
		this.bone = bone;
		this.boneOffsetForm = boneOffsetForm;
		this.boneOffsetFormInverse = helper.inverseTransform( boneOffsetForm );

		helper.freeVector3( localInertia );
		helper.freeTransform( form );
		helper.freeTransform( boneForm );

	},

	reset: function () {

		this.setTransformFromBone();

	},

	updateFromBone: function () {

		if ( this.params.boneIndex === -1 ) {

			return;

		}

		if ( this.params.type === 0 ) {

			this.setTransformFromBone();

		}

		if ( this.params.type === 2 ) {

			this.setPositionFromBone();

		}

	},

	updateBone: function () {

		if ( this.params.type === 0 || this.params.boneIndex === -1 ) {

			return;

		}

		this.updateBoneRotation();

		if ( this.params.type === 1 ) {

			this.updateBonePosition();

		}

		this.bone.updateMatrixWorld( true );

	},

	getBoneTransform: function () {

		var helper = this.helper;
		var p = this.bone.getWorldPosition();
		var q = this.bone.getWorldQuaternion();

		var tr = helper.allocTransform();
		helper.setOriginFromArray3( tr, p.toArray() );
		helper.setBasisFromArray4( tr, q.toArray() );

		var form = helper.multiplyTransforms( tr, this.boneOffsetForm );

		helper.freeTransform( tr );

		return form;

	},

	getWorldTransformForBone: function () {

		var helper = this.helper;

		var tr = helper.allocTransform();
		this.body.getMotionState().getWorldTransform( tr );
		var tr2 = helper.multiplyTransforms( tr, this.boneOffsetFormInverse );

		helper.freeTransform( tr );

		return tr2;

	},

	setTransformFromBone: function () {

		var helper = this.helper;
		var form = this.getBoneTransform();

		// TODO: check the most appropriate way to set
		//this.body.setWorldTransform( form );
		this.body.setCenterOfMassTransform( form );
		this.body.getMotionState().setWorldTransform( form );

		helper.freeTransform( form );

	},

	setPositionFromBone: function () {

		var helper = this.helper;
		var form = this.getBoneTransform();

		var tr = helper.allocTransform();
		this.body.getMotionState().getWorldTransform( tr );
		helper.copyOrigin( tr, form );

		// TODO: check the most appropriate way to set
		//this.body.setWorldTransform( tr );
		this.body.setCenterOfMassTransform( tr );
		this.body.getMotionState().setWorldTransform( tr );

		helper.freeTransform( tr );
		helper.freeTransform( form );

	},

	updateBoneRotation: function () {

		this.bone.updateMatrixWorld( true );

		var helper = this.helper;

		var tr = this.getWorldTransformForBone();
		var q = helper.getBasis( tr );

		var thQ = helper.allocThreeQuaternion();
		var thQ2 = helper.allocThreeQuaternion();
		var thQ3 = helper.allocThreeQuaternion();

		thQ.set( q.x(), q.y(), q.z(), q.w() );
		thQ2.setFromRotationMatrix( this.bone.matrixWorld );
		thQ2.conjugate()
		thQ2.multiply( thQ );

		//this.bone.quaternion.multiply( thQ2 );

		thQ3.setFromRotationMatrix( this.bone.matrix );
		this.bone.quaternion.copy( thQ2.multiply( thQ3 ) );

		helper.freeThreeQuaternion( thQ );
		helper.freeThreeQuaternion( thQ2 );
		helper.freeThreeQuaternion( thQ3 );

		helper.freeQuaternion( q );
		helper.freeTransform( tr );

	},

	updateBonePosition: function () {

		var helper = this.helper;

		var tr = this.getWorldTransformForBone();

		var thV = helper.allocThreeVector3();

		var o = helper.getOrigin( tr );
		thV.set( o.x(), o.y(), o.z() );

		var v = this.bone.worldToLocal( thV );
		this.bone.position.add( v );

		helper.freeThreeVector3( thV );

		helper.freeTransform( tr );

	}

};

THREE.MMDPhysics.Constraint = function ( mesh, world, bodyA, bodyB, params, helper ) {

	this.mesh  = mesh;
	this.world = world;
	this.bodyA = bodyA;
	this.bodyB = bodyB;
	this.params = params;
	this.helper = helper;

	this.constraint = null;

	this.init();

};

THREE.MMDPhysics.Constraint.prototype = {

	constructor: THREE.MMDPhysics.Constraint,

	init: function () {

		var helper = this.helper;
		var params = this.params;
		var bodyA = this.bodyA;
		var bodyB = this.bodyB;

		var form = helper.allocTransform();
		helper.setIdentity( form );
		helper.setOriginFromArray3( form, params.position );
		helper.setBasisFromArray3( form, params.rotation );

		var formA = helper.allocTransform();
		var formB = helper.allocTransform();

		bodyA.body.getMotionState().getWorldTransform( formA );
		bodyB.body.getMotionState().getWorldTransform( formB );

		var formInverseA = helper.inverseTransform( formA );
		var formInverseB = helper.inverseTransform( formB );

		var formA2 = helper.multiplyTransforms( formInverseA, form );
		var formB2 = helper.multiplyTransforms( formInverseB, form );

		var constraint = new Ammo.btGeneric6DofSpringConstraint( bodyA.body, bodyB.body, formA2, formB2, true );

		var lll = helper.allocVector3();
		var lul = helper.allocVector3();
		var all = helper.allocVector3();
		var aul = helper.allocVector3();

		lll.setValue( params.translationLimitation1[ 0 ],
		              params.translationLimitation1[ 1 ],
		              params.translationLimitation1[ 2 ] );
		lul.setValue( params.translationLimitation2[ 0 ],
		              params.translationLimitation2[ 1 ],
		              params.translationLimitation2[ 2 ] );
		all.setValue( params.rotationLimitation1[ 0 ],
		              params.rotationLimitation1[ 1 ],
		              params.rotationLimitation1[ 2 ] );
		aul.setValue( params.rotationLimitation2[ 0 ],
		              params.rotationLimitation2[ 1 ],
		              params.rotationLimitation2[ 2 ] );

		constraint.setLinearLowerLimit( lll );
		constraint.setLinearUpperLimit( lul );
		constraint.setAngularLowerLimit( all );
		constraint.setAngularUpperLimit( aul );

		for ( var i = 0; i < 3; i++ ) {

			if( params.springPosition[ i ] !== 0 ) {

				constraint.enableSpring( i, true );
				constraint.setStiffness( i, params.springPosition[ i ] );

			}

		}

		for ( var i = 0; i < 3; i++ ) {

			if( params.springRotation[ i ] !== 0 ) {

				constraint.enableSpring( i + 3, true );
				constraint.setStiffness( i + 3, params.springRotation[ i ] );

			}

		}

		this.world.addConstraint( constraint, true );
		this.constraint = constraint;

		helper.freeTransform( form );
		helper.freeTransform( formA );
		helper.freeTransform( formB );
		helper.freeTransform( formInverseA );
		helper.freeTransform( formInverseB );
		helper.freeTransform( formA2 );
		helper.freeTransform( formB2 );
		helper.freeVector3( lll );
		helper.freeVector3( lul );
		helper.freeVector3( all );
		helper.freeVector3( aul );

	}

};
