/**
 * 	SEA3D - Rigid Body
 * 	@author Sunag / http://www.sunag.com.br/
 */

import { SEA3DSDK } from "../SEA3DSDK.js";

//
//	Sphere
//

SEA3DSDK.Sphere = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.radius = data.readFloat();

};

SEA3DSDK.Sphere.prototype.type = "sph";

//
//	Box
//

SEA3DSDK.Box = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.width = data.readFloat();
	this.height = data.readFloat();
	this.depth = data.readFloat();

};

SEA3DSDK.Box.prototype.type = "box";

//
//	Cone
//

SEA3DSDK.Cone = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.radius = data.readFloat();
	this.height = data.readFloat();

};

SEA3DSDK.Cone.prototype.type = "cone";

//
//	Capsule
//

SEA3DSDK.Capsule = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.radius = data.readFloat();
	this.height = data.readFloat();

};

SEA3DSDK.Capsule.prototype.type = "cap";

//
//	Cylinder
//

SEA3DSDK.Cylinder = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.radius = data.readFloat();
	this.height = data.readFloat();

};

SEA3DSDK.Cylinder.prototype.type = "cyl";

//
//	Convex Geometry
//

SEA3DSDK.ConvexGeometry = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.geometry = sea3d.getObject( data.readUInt() );
	this.subGeometryIndex = data.readUByte();

};

SEA3DSDK.ConvexGeometry.prototype.type = "gs";

//
//	Triangle Geometry
//

SEA3DSDK.TriangleGeometry = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.geometry = sea3d.getObject( data.readUInt() );
	this.subGeometryIndex = data.readUByte();

};

SEA3DSDK.TriangleGeometry.prototype.type = "sgs";

//
//	Compound
//

SEA3DSDK.Compound = function ( name, data, sea3d ) {

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

SEA3DSDK.Compound.prototype.type = "cmps";

//
//	Physics
//

SEA3DSDK.Physics = function ( name, data, sea3d ) {

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

SEA3DSDK.Physics.prototype.readTag = function ( kind, data, size ) {

};

//
//	Rigidy Body Base
//

SEA3DSDK.RigidBodyBase = function ( name, data, sea3d ) {

	SEA3DSDK.Physics.call( this, name, data, sea3d );

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

SEA3DSDK.RigidBodyBase.prototype = Object.create( SEA3DSDK.Physics.prototype );
SEA3DSDK.RigidBodyBase.prototype.constructor = SEA3DSDK.RigidBodyBase;

//
//	Rigidy Body
//

SEA3DSDK.RigidBody = function ( name, data, sea3d ) {

	SEA3DSDK.RigidBodyBase.call( this, name, data, sea3d );

	data.readTags( this.readTag.bind( this ) );

};

SEA3DSDK.RigidBody.prototype = Object.create( SEA3DSDK.RigidBodyBase.prototype );
SEA3DSDK.RigidBody.prototype.constructor = SEA3DSDK.RigidBody;

SEA3DSDK.RigidBody.prototype.type = "rb";

//
//	Car Controller
//

SEA3DSDK.CarController = function ( name, data, sea3d ) {

	SEA3DSDK.RigidBodyBase.call( this, name, data, sea3d );

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

		this.wheel[ i ] = new SEA3DSDK.CarController.Wheel( data, sea3d );

	}

	data.readTags( this.readTag.bind( this ) );

};

SEA3DSDK.CarController.Wheel = function ( data, sea3d ) {

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

SEA3DSDK.CarController.prototype = Object.create( SEA3DSDK.RigidBodyBase.prototype );
SEA3DSDK.CarController.prototype.constructor = SEA3DSDK.CarController;

SEA3DSDK.CarController.prototype.type = "carc";

//
//	Constraints
//

SEA3DSDK.Constraints = function ( name, data, sea3d ) {

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

SEA3DSDK.P2PConstraint = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	SEA3DSDK.Constraints.call( this, name, data, sea3d );

};

SEA3DSDK.P2PConstraint.prototype = Object.create( SEA3DSDK.Constraints.prototype );
SEA3DSDK.P2PConstraint.prototype.constructor = SEA3DSDK.P2PConstraint;

SEA3DSDK.P2PConstraint.prototype.type = "p2pc";

//
//	Hinge Constraint
//

SEA3DSDK.HingeConstraint = function ( name, data, sea3d ) {

	SEA3DSDK.Constraints.call( this, name, data, sea3d );

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

SEA3DSDK.HingeConstraint.prototype = Object.create( SEA3DSDK.Constraints.prototype );
SEA3DSDK.HingeConstraint.prototype.constructor = SEA3DSDK.HingeConstraint;

SEA3DSDK.HingeConstraint.prototype.type = "hnec";

//
//	Cone Twist Constraint
//

SEA3DSDK.ConeTwistConstraint = function ( name, data, sea3d ) {

	SEA3DSDK.Constraints.call( this, name, data, sea3d );

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

SEA3DSDK.ConeTwistConstraint.prototype = Object.create( SEA3DSDK.Constraints.prototype );
SEA3DSDK.ConeTwistConstraint.prototype.constructor = SEA3DSDK.ConeTwistConstraint;

SEA3DSDK.ConeTwistConstraint.prototype.type = "ctwc";

//
//	Extension
//

SEA3DSDK.File.setExtension( function () {

	// PHYSICS
	this.addClass( SEA3DSDK.Sphere );
	this.addClass( SEA3DSDK.Box );
	this.addClass( SEA3DSDK.Cone );
	this.addClass( SEA3DSDK.Capsule );
	this.addClass( SEA3DSDK.Cylinder );
	this.addClass( SEA3DSDK.ConvexGeometry );
	this.addClass( SEA3DSDK.TriangleGeometry );
	this.addClass( SEA3DSDK.Compound );
	this.addClass( SEA3DSDK.RigidBody );
	this.addClass( SEA3DSDK.P2PConstraint );
	this.addClass( SEA3DSDK.HingeConstraint );
	this.addClass( SEA3DSDK.ConeTwistConstraint );
	this.addClass( SEA3DSDK.CarController );

} );
