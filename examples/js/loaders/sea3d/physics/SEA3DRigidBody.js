/**
 * 	SEA3D - Rigid Body
 * 	@author Sunag / http://www.sunag.com.br/
 */

'use strict';

//
//	Sphere
//

SEA3D.Sphere = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.radius = data.readFloat();

};

SEA3D.Sphere.prototype.type = "sph";

//
//	Box
//

SEA3D.Box = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.width = data.readFloat();
	this.height = data.readFloat();
	this.depth = data.readFloat();

};

SEA3D.Box.prototype.type = "box";

//
//	Cone
//

SEA3D.Cone = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.radius = data.readFloat();
	this.height = data.readFloat();

};

SEA3D.Cone.prototype.type = "cone";

//
//	Capsule
//

SEA3D.Capsule = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.radius = data.readFloat();
	this.height = data.readFloat();

};

SEA3D.Capsule.prototype.type = "cap";

//
//	Cylinder
//

SEA3D.Cylinder = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.radius = data.readFloat();
	this.height = data.readFloat();

};

SEA3D.Cylinder.prototype.type = "cyl";

//
//	Convex Geometry
//

SEA3D.ConvexGeometry = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.geometry = sea3d.getObject( data.readUInt() );
	this.subGeometryIndex = data.readUByte();

};

SEA3D.ConvexGeometry.prototype.type = "gs";

//
//	Triangle Geometry
//

SEA3D.TriangleGeometry = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.geometry = sea3d.getObject( data.readUInt() );
	this.subGeometryIndex = data.readUByte();

};

SEA3D.TriangleGeometry.prototype.type = "sgs";

//
//	Compound
//

SEA3D.Compound = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.compounds = [];

	var count = data.readUByte();

	for ( var i = 0; i < count; i ++ ) {

		this.compounds.push( {
			shape: sea3d.getObject( data.readUInt() ),
			transform: data.readMatrix()
		} );

	}

};

SEA3D.Compound.prototype.type = "cmps";

//
//	Physics
//

SEA3D.Physics = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.attrib = data.readUShort();

	this.shape = sea3d.getObject( data.readUInt() );

	if ( this.attrib & 1 ) this.target = sea3d.getObject( data.readUInt() );
	else this.transform = data.readMatrix();

	if ( this.attrib & 2 ) this.offset = data.readMatrix();

	if ( this.attrib & 4 ) this.scripts = data.readScriptList( sea3d );

	if ( this.attrib & 16 ) this.attributes = sea3d.getObject( data.readUInt() );

};

SEA3D.Physics.prototype.readTag = function ( kind, data, size ) {

};

//
//	Rigidy Body Base
//

SEA3D.RigidBodyBase = function ( name, data, sea3d ) {

	SEA3D.Physics.call( this, name, data, sea3d );

	if ( this.attrib & 32 ) {

		this.linearDamping = data.readFloat();
		this.angularDamping = data.readFloat();

	} else {

		this.linearDamping = 0;
		this.angularDamping = 0;

	}

	this.mass = data.readFloat();
	this.friction = data.readFloat();
	this.restitution = data.readFloat();

};

SEA3D.RigidBodyBase.prototype = Object.create( SEA3D.Physics.prototype );
SEA3D.RigidBodyBase.prototype.constructor = SEA3D.RigidBodyBase;

//
//	Rigidy Body
//

SEA3D.RigidBody = function ( name, data, sea3d ) {

	SEA3D.RigidBodyBase.call( this, name, data, sea3d );

	data.readTags( this.readTag.bind( this ) );

};

SEA3D.RigidBody.prototype = Object.create( SEA3D.RigidBodyBase.prototype );
SEA3D.RigidBody.prototype.constructor = SEA3D.RigidBody;

SEA3D.RigidBody.prototype.type = "rb";

//
//	Car Controller
//

SEA3D.CarController = function ( name, data, sea3d ) {

	SEA3D.RigidBodyBase.call( this, name, data, sea3d );

	this.suspensionStiffness = data.readFloat();
	this.suspensionCompression = data.readFloat();
	this.suspensionDamping = data.readFloat();
	this.maxSuspensionTravelCm = data.readFloat();
	this.frictionSlip = data.readFloat();
	this.maxSuspensionForce = data.readFloat();

	this.dampingCompression = data.readFloat();
	this.dampingRelaxation = data.readFloat();

	var count = data.readUByte();

	this.wheel = [];

	for ( var i = 0; i < count; i ++ ) {

		this.wheel[ i ] = new SEA3D.CarController.Wheel( data, sea3d );

	}

	data.readTags( this.readTag.bind( this ) );

};

SEA3D.CarController.Wheel = function ( data, sea3d ) {

	this.data = data;
	this.sea3d = sea3d;

	this.attrib = data.readUShort();

	this.isFront = ( this.attrib & 1 ) != 0;

	if ( this.attrib & 2 ) {

		this.target = sea3d.getObject( data.readUInt() );

	}

	if ( this.attrib & 4 ) {

		this.offset = data.readMatrix();

	}

	this.pos = data.readVector3();
	this.dir = data.readVector3();
	this.axle = data.readVector3();

	this.radius = data.readFloat();
	this.suspensionRestLength = data.readFloat();

};

SEA3D.CarController.prototype = Object.create( SEA3D.RigidBodyBase.prototype );
SEA3D.CarController.prototype.constructor = SEA3D.CarController;

SEA3D.CarController.prototype.type = "carc";

//
//	Constraints
//

SEA3D.Constraints = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.attrib = data.readUShort();

	this.disableCollisionsBetweenBodies = this.attrib & 1 != 0;

	this.targetA = sea3d.getObject( data.readUInt() );
	this.pointA = data.readVector3();

	if ( this.attrib & 2 ) {

		this.targetB = sea3d.getObject( data.readUInt() );
		this.pointB = data.readVector3();

	}

};

//
//	P2P Constraint
//

SEA3D.P2PConstraint = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	SEA3D.Constraints.call( this, name, data, sea3d );

};

SEA3D.P2PConstraint.prototype = Object.create( SEA3D.Constraints.prototype );
SEA3D.P2PConstraint.prototype.constructor = SEA3D.P2PConstraint;

SEA3D.P2PConstraint.prototype.type = "p2pc";

//
//	Hinge Constraint
//

SEA3D.HingeConstraint = function ( name, data, sea3d ) {

	SEA3D.Constraints.call( this, name, data, sea3d );

	this.axisA = data.readVector3();

	if ( this.attrib & 1 ) {

		this.axisB = data.readVector3();

	}

	if ( this.attrib & 4 ) {

		this.limit = {
			low: data.readFloat(),
			high: data.readFloat(),
			softness: data.readFloat(),
			biasFactor: data.readFloat(),
			relaxationFactor: data.readFloat()
		};

	}

	if ( this.attrib & 8 ) {

		this.angularMotor = {
			velocity: data.readFloat(),
			impulse: data.readFloat()
		};

	}

};

SEA3D.HingeConstraint.prototype = Object.create( SEA3D.Constraints.prototype );
SEA3D.HingeConstraint.prototype.constructor = SEA3D.HingeConstraint;

SEA3D.HingeConstraint.prototype.type = "hnec";

//
//	Cone Twist Constraint
//

SEA3D.ConeTwistConstraint = function ( name, data, sea3d ) {

	SEA3D.Constraints.call( this, name, data, sea3d );

	this.axisA = data.readVector3();

	if ( this.attrib & 1 ) {

		this.axisB = data.readVector3();

	}

	if ( this.attrib & 4 ) {

		this.limit = {
			swingSpan1: data.readFloat(),
			swingSpan2: data.readFloat(),
			twistSpan: data.readFloat(),
			softness: data.readFloat(),
			biasFactor: data.readFloat(),
			relaxationFactor: data.readFloat()
		};

	}

};

SEA3D.ConeTwistConstraint.prototype = Object.create( SEA3D.Constraints.prototype );
SEA3D.ConeTwistConstraint.prototype.constructor = SEA3D.ConeTwistConstraint;

SEA3D.ConeTwistConstraint.prototype.type = "ctwc";

//
//	Extension
//

SEA3D.File.setExtension( function () {

	// PHYSICS
	this.addClass( SEA3D.Sphere );
	this.addClass( SEA3D.Box );
	this.addClass( SEA3D.Cone );
	this.addClass( SEA3D.Capsule );
	this.addClass( SEA3D.Cylinder );
	this.addClass( SEA3D.ConvexGeometry );
	this.addClass( SEA3D.TriangleGeometry );
	this.addClass( SEA3D.Compound );
	this.addClass( SEA3D.RigidBody );
	this.addClass( SEA3D.P2PConstraint );
	this.addClass( SEA3D.HingeConstraint );
	this.addClass( SEA3D.ConeTwistConstraint );
	this.addClass( SEA3D.CarController );

} );
