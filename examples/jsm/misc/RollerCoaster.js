import {
	BufferAttribute,
	BufferGeometry,
	Raycaster,
	SRGBColorSpace,
	colorSetRGB,
	quatCopy,
	quatCreate,
	quatPreMultiply,
	quatSetFromAxisAngle,
	vec3Add,
	vec3ApplyQuaternion,
	vec3Copy,
	vec3Create,
	vec3CrossVectors,
	vec3Normalize,
	vec3Set,
	vec3SubVectors
} from 'three';

/**
 * A procedural roller coaster geometry.
 *
 * @augments BufferGeometry
 * @three_import import { RollerCoasterGeometry } from 'three/addons/misc/RollerCoaster.js';
 */
class RollerCoasterGeometry extends BufferGeometry {

	/**
	 * Constructs a new geometry.
	 *
	 * @param {Curve} curve - The curve to generate the geometry along.
 	 * @param {number} divisions - The number of divisions which defines the detail of the geometry.
	 */
	constructor( curve, divisions ) {

		super();

		const vertices = [];
		const normals = [];
		const colors = [];

		const color1 = [ 1, 1, 1 ];
		const color2 = [ 1, 1, 0 ];

		const up = vec3Set( vec3Create(), 0, 1, 0 );
		const forward = vec3Create();
		const right = vec3Create();

		const quaternion = quatCreate();
		const prevQuaternion = quatCreate();
		quatSetFromAxisAngle( up, Math.PI / 2, prevQuaternion );

		const point = vec3Create();
		const prevPoint = vec3Create();
		curve.getPointAt( 0, prevPoint );

		// shapes

		const step = [
			vec3Set( vec3Create(), - 0.225, 0, 0 ),
			vec3Set( vec3Create(), 0, - 0.050, 0 ),
			vec3Set( vec3Create(), 0, - 0.175, 0 ),

			vec3Set( vec3Create(), 0, - 0.050, 0 ),
			vec3Set( vec3Create(), 0.225, 0, 0 ),
			vec3Set( vec3Create(), 0, - 0.175, 0 )
		];

		const PI2 = Math.PI * 2;

		let sides = 5;
		const tube1 = [];

		for ( let i = 0; i < sides; i ++ ) {

			const angle = ( i / sides ) * PI2;
			tube1.push( vec3Set( vec3Create(), Math.sin( angle ) * 0.06, Math.cos( angle ) * 0.06, 0 ) );

		}

		sides = 6;
		const tube2 = [];

		for ( let i = 0; i < sides; i ++ ) {

			const angle = ( i / sides ) * PI2;
			tube2.push( vec3Set( vec3Create(), Math.sin( angle ) * 0.025, Math.cos( angle ) * 0.025, 0 ) );

		}

		const vector = vec3Create();
		const normal = vec3Create();

		function drawShape( shape, color ) {

			vec3ApplyQuaternion( vec3Set( normal, 0, 0, - 1 ), quaternion, normal );

			for ( let j = 0; j < shape.length; j ++ ) {

				vec3Copy( shape[ j ], vector );
				vec3ApplyQuaternion( vector, quaternion, vector );
				vec3Add( vector, point, vector );

				vertices.push( vector.x, vector.y, vector.z );
				normals.push( normal.x, normal.y, normal.z );
				colors.push( color[ 0 ], color[ 1 ], color[ 2 ] );

			}

			vec3ApplyQuaternion( vec3Set( normal, 0, 0, 1 ), quaternion, normal );

			for ( let j = shape.length - 1; j >= 0; j -- ) {

				vec3Copy( shape[ j ], vector );
				vec3ApplyQuaternion( vector, quaternion, vector );
				vec3Add( vector, point, vector );

				vertices.push( vector.x, vector.y, vector.z );
				normals.push( normal.x, normal.y, normal.z );
				colors.push( color[ 0 ], color[ 1 ], color[ 2 ] );

			}

		}

		const vector1 = vec3Create();
		const vector2 = vec3Create();
		const vector3 = vec3Create();
		const vector4 = vec3Create();

		const normal1 = vec3Create();
		const normal2 = vec3Create();
		const normal3 = vec3Create();
		const normal4 = vec3Create();

		function extrudeShape( shape, offset, color ) {

			for ( let j = 0, jl = shape.length; j < jl; j ++ ) {

				const point1 = shape[ j ];
				const point2 = shape[ ( j + 1 ) % jl ];

				vec3Add( vec3Copy( point1, vector1 ), offset, vector1 );
				vec3ApplyQuaternion( vector1, quaternion, vector1 );
				vec3Add( vector1, point, vector1 );

				vec3Add( vec3Copy( point2, vector2 ), offset, vector2 );
				vec3ApplyQuaternion( vector2, quaternion, vector2 );
				vec3Add( vector2, point, vector2 );

				vec3Add( vec3Copy( point2, vector3 ), offset, vector3 );
				vec3ApplyQuaternion( vector3, prevQuaternion, vector3 );
				vec3Add( vector3, prevPoint, vector3 );

				vec3Add( vec3Copy( point1, vector4 ), offset, vector4 );
				vec3ApplyQuaternion( vector4, prevQuaternion, vector4 );
				vec3Add( vector4, prevPoint, vector4 );

				vertices.push( vector1.x, vector1.y, vector1.z );
				vertices.push( vector2.x, vector2.y, vector2.z );
				vertices.push( vector4.x, vector4.y, vector4.z );

				vertices.push( vector2.x, vector2.y, vector2.z );
				vertices.push( vector3.x, vector3.y, vector3.z );
				vertices.push( vector4.x, vector4.y, vector4.z );

				//

				vec3Normalize( vec3ApplyQuaternion( vec3Copy( point1, normal1 ), quaternion, normal1 ), normal1 );
				vec3Normalize( vec3ApplyQuaternion( vec3Copy( point2, normal2 ), quaternion, normal2 ), normal2 );
				vec3Normalize( vec3ApplyQuaternion( vec3Copy( point2, normal3 ), prevQuaternion, normal3 ), normal3 );
				vec3Normalize( vec3ApplyQuaternion( vec3Copy( point1, normal4 ), prevQuaternion, normal4 ), normal4 );

				normals.push( normal1.x, normal1.y, normal1.z );
				normals.push( normal2.x, normal2.y, normal2.z );
				normals.push( normal4.x, normal4.y, normal4.z );

				normals.push( normal2.x, normal2.y, normal2.z );
				normals.push( normal3.x, normal3.y, normal3.z );
				normals.push( normal4.x, normal4.y, normal4.z );

				colors.push( color[ 0 ], color[ 1 ], color[ 2 ] );
				colors.push( color[ 0 ], color[ 1 ], color[ 2 ] );
				colors.push( color[ 0 ], color[ 1 ], color[ 2 ] );

				colors.push( color[ 0 ], color[ 1 ], color[ 2 ] );
				colors.push( color[ 0 ], color[ 1 ], color[ 2 ] );
				colors.push( color[ 0 ], color[ 1 ], color[ 2 ] );

			}

		}

		const offset = vec3Create();

		const sample1 = vec3Create();
		const sample2 = vec3Create();
		const rollQuaternion = quatCreate();

		for ( let i = 1; i <= divisions; i ++ ) {

			curve.getPointAt( i / divisions, point );

			vec3Set( up, 0, 1, 0 );

			vec3Normalize( vec3SubVectors( point, prevPoint, forward ), forward );
			vec3Normalize( vec3CrossVectors( up, forward, right ), right );
			vec3CrossVectors( forward, right, up );

			const angle = Math.atan2( forward.x, forward.z );

			quatSetFromAxisAngle( up, angle, quaternion );

			// banking

			const bankDelta = 0.01;
			const t = i / divisions;

			curve.getTangentAt( ( ( t - bankDelta ) % 1 + 1 ) % 1, sample1 );
			curve.getTangentAt( ( t + bankDelta ) % 1, sample2 );

			let headingChange = Math.atan2( sample2.x, sample2.z ) - Math.atan2( sample1.x, sample1.z );
			if ( headingChange > Math.PI ) headingChange -= Math.PI * 2;
			if ( headingChange < - Math.PI ) headingChange += Math.PI * 2;

			quatSetFromAxisAngle( forward, - Math.atan( headingChange * 8 ) * 0.5, rollQuaternion );
			quatPreMultiply( quaternion, rollQuaternion, quaternion );

			if ( i % 2 === 0 ) {

				drawShape( step, color2 );

			}

			extrudeShape( tube1, vec3Set( offset, 0, - 0.125, 0 ), color2 );
			extrudeShape( tube2, vec3Set( offset, 0.2, 0, 0 ), color1 );
			extrudeShape( tube2, vec3Set( offset, - 0.2, 0, 0 ), color1 );

			vec3Copy( point, prevPoint );
			quatCopy( quaternion, prevQuaternion );

		}

		// console.log( vertices.length );

		this.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );
		this.setAttribute( 'normal', new BufferAttribute( new Float32Array( normals ), 3 ) );
		this.setAttribute( 'color', new BufferAttribute( new Float32Array( colors ), 3 ) );

	}

}

/**
 * A procedural roller coaster lifters geometry.
 *
 * @augments BufferGeometry
 * @three_import import { RollerCoasterLiftersGeometry } from 'three/addons/misc/RollerCoaster.js';
 */
class RollerCoasterLiftersGeometry extends BufferGeometry {

	/**
	 * Constructs a new geometry.
	 *
	 * @param {Curve} curve - The curve to generate the geometry along.
 	 * @param {number} divisions - The number of divisions which defines the detail of the geometry.
	 */
	constructor( curve, divisions ) {

		super();

		const vertices = [];
		const normals = [];

		const quaternion = quatCreate();

		const up = vec3Set( vec3Create(), 0, 1, 0 );

		const point = vec3Create();
		const tangent = vec3Create();

		// shapes

		const tube1 = [
			vec3Set( vec3Create(), 0, 0.05, - 0.05 ),
			vec3Set( vec3Create(), 0, 0.05, 0.05 ),
			vec3Set( vec3Create(), 0, - 0.05, 0 )
		];

		const tube2 = [
			vec3Set( vec3Create(), - 0.05, 0, 0.05 ),
			vec3Set( vec3Create(), - 0.05, 0, - 0.05 ),
			vec3Set( vec3Create(), 0.05, 0, 0 )
		];

		const tube3 = [
			vec3Set( vec3Create(), 0.05, 0, - 0.05 ),
			vec3Set( vec3Create(), 0.05, 0, 0.05 ),
			vec3Set( vec3Create(), - 0.05, 0, 0 )
		];

		const vector1 = vec3Create();
		const vector2 = vec3Create();
		const vector3 = vec3Create();
		const vector4 = vec3Create();

		const normal1 = vec3Create();
		const normal2 = vec3Create();
		const normal3 = vec3Create();
		const normal4 = vec3Create();

		function extrudeShape( shape, fromPoint, toPoint ) {

			for ( let j = 0, jl = shape.length; j < jl; j ++ ) {

				const point1 = shape[ j ];
				const point2 = shape[ ( j + 1 ) % jl ];

				vec3Add( vec3ApplyQuaternion( vec3Copy( point1, vector1 ), quaternion, vector1 ), fromPoint, vector1 );
				vec3Add( vec3ApplyQuaternion( vec3Copy( point2, vector2 ), quaternion, vector2 ), fromPoint, vector2 );
				vec3Add( vec3ApplyQuaternion( vec3Copy( point2, vector3 ), quaternion, vector3 ), toPoint, vector3 );
				vec3Add( vec3ApplyQuaternion( vec3Copy( point1, vector4 ), quaternion, vector4 ), toPoint, vector4 );

				vertices.push( vector1.x, vector1.y, vector1.z );
				vertices.push( vector2.x, vector2.y, vector2.z );
				vertices.push( vector4.x, vector4.y, vector4.z );

				vertices.push( vector2.x, vector2.y, vector2.z );
				vertices.push( vector3.x, vector3.y, vector3.z );
				vertices.push( vector4.x, vector4.y, vector4.z );

				//

				vec3Normalize( vec3ApplyQuaternion( vec3Copy( point1, normal1 ), quaternion, normal1 ), normal1 );
				vec3Normalize( vec3ApplyQuaternion( vec3Copy( point2, normal2 ), quaternion, normal2 ), normal2 );
				vec3Normalize( vec3ApplyQuaternion( vec3Copy( point2, normal3 ), quaternion, normal3 ), normal3 );
				vec3Normalize( vec3ApplyQuaternion( vec3Copy( point1, normal4 ), quaternion, normal4 ), normal4 );

				normals.push( normal1.x, normal1.y, normal1.z );
				normals.push( normal2.x, normal2.y, normal2.z );
				normals.push( normal4.x, normal4.y, normal4.z );

				normals.push( normal2.x, normal2.y, normal2.z );
				normals.push( normal3.x, normal3.y, normal3.z );
				normals.push( normal4.x, normal4.y, normal4.z );

			}

		}

		const fromPoint = vec3Create();
		const toPoint = vec3Create();

		const sample1 = vec3Create();
		const sample2 = vec3Create();
		const bankedQuaternion = quatCreate();
		const rollQuaternion = quatCreate();

		for ( let i = 1; i <= divisions; i ++ ) {

			curve.getPointAt( i / divisions, point );
			curve.getTangentAt( i / divisions, tangent );

			const angle = Math.atan2( tangent.x, tangent.z );

			quatSetFromAxisAngle( up, angle, quaternion );

			// banking

			const bankDelta = 0.01;
			const t = i / divisions;

			curve.getTangentAt( ( ( t - bankDelta ) % 1 + 1 ) % 1, sample1 );
			curve.getTangentAt( ( t + bankDelta ) % 1, sample2 );

			let headingChange = Math.atan2( sample2.x, sample2.z ) - Math.atan2( sample1.x, sample1.z );
			if ( headingChange > Math.PI ) headingChange -= Math.PI * 2;
			if ( headingChange < - Math.PI ) headingChange += Math.PI * 2;

			quatCopy( quaternion, bankedQuaternion );
			quatSetFromAxisAngle( tangent, - Math.atan( headingChange * 8 ) * 0.5, rollQuaternion );
			quatPreMultiply( bankedQuaternion, rollQuaternion, bankedQuaternion );

			//

			if ( point.y > 10 ) {

				vec3Add( vec3ApplyQuaternion( vec3Set( fromPoint, - 0.75, - 0.35, 0 ), quaternion, fromPoint ), point, fromPoint );
				vec3Add( vec3ApplyQuaternion( vec3Set( toPoint, 0.75, - 0.35, 0 ), quaternion, toPoint ), point, toPoint );

				extrudeShape( tube1, fromPoint, toPoint );

				vec3Add( vec3ApplyQuaternion( vec3Set( fromPoint, - 0.7, - 0.3, 0 ), quaternion, fromPoint ), point, fromPoint );
				vec3Add( vec3ApplyQuaternion( vec3Set( toPoint, - 0.7, - point.y, 0 ), quaternion, toPoint ), point, toPoint );

				extrudeShape( tube2, fromPoint, toPoint );

				vec3Add( vec3ApplyQuaternion( vec3Set( fromPoint, 0.7, - 0.3, 0 ), quaternion, fromPoint ), point, fromPoint );
				vec3Add( vec3ApplyQuaternion( vec3Set( toPoint, 0.7, - point.y, 0 ), quaternion, toPoint ), point, toPoint );

				extrudeShape( tube3, fromPoint, toPoint );

			} else {

				vec3Add( vec3ApplyQuaternion( vec3Set( fromPoint, 0, - 0.2, 0 ), bankedQuaternion, fromPoint ), point, fromPoint );

				vec3Copy( fromPoint, toPoint );
				toPoint.y = 0;

				extrudeShape( tube3, fromPoint, toPoint );

			}

		}

		this.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );
		this.setAttribute( 'normal', new BufferAttribute( new Float32Array( normals ), 3 ) );

	}

}

/**
 * A procedural roller coaster shadow geometry.
 *
 * @augments BufferGeometry
 * @three_import import { RollerCoasterShadowGeometry } from 'three/addons/misc/RollerCoaster.js';
 */
class RollerCoasterShadowGeometry extends BufferGeometry {

	/**
	 * Constructs a new geometry.
	 *
	 * @param {Curve} curve - The curve to generate the geometry along.
 	 * @param {number} divisions - The number of divisions which defines the detail of the geometry.
	 */
	constructor( curve, divisions ) {

		super();

		const vertices = [];

		const up = vec3Set( vec3Create(), 0, 1, 0 );
		const forward = vec3Create();

		const quaternion = quatCreate();
		const prevQuaternion = quatCreate();
		quatSetFromAxisAngle( up, Math.PI / 2, prevQuaternion );

		const point = vec3Create();

		const prevPoint = vec3Create();
		curve.getPointAt( 0, prevPoint );
		prevPoint.y = 0;

		const vector1 = vec3Create();
		const vector2 = vec3Create();
		const vector3 = vec3Create();
		const vector4 = vec3Create();

		for ( let i = 1; i <= divisions; i ++ ) {

			curve.getPointAt( i / divisions, point );
			point.y = 0;

			vec3SubVectors( point, prevPoint, forward );

			const angle = Math.atan2( forward.x, forward.z );

			quatSetFromAxisAngle( up, angle, quaternion );

			vec3Add( vec3ApplyQuaternion( vec3Set( vector1, - 0.3, 0, 0 ), quaternion, vector1 ), point, vector1 );
			vec3Add( vec3ApplyQuaternion( vec3Set( vector2, 0.3, 0, 0 ), quaternion, vector2 ), point, vector2 );
			vec3Add( vec3ApplyQuaternion( vec3Set( vector3, 0.3, 0, 0 ), prevQuaternion, vector3 ), prevPoint, vector3 );
			vec3Add( vec3ApplyQuaternion( vec3Set( vector4, - 0.3, 0, 0 ), prevQuaternion, vector4 ), prevPoint, vector4 );

			vertices.push( vector1.x, vector1.y, vector1.z );
			vertices.push( vector2.x, vector2.y, vector2.z );
			vertices.push( vector4.x, vector4.y, vector4.z );

			vertices.push( vector2.x, vector2.y, vector2.z );
			vertices.push( vector3.x, vector3.y, vector3.z );
			vertices.push( vector4.x, vector4.y, vector4.z );

			vec3Copy( point, prevPoint );
			quatCopy( quaternion, prevQuaternion );

		}

		this.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );

	}

}

/**
 * A procedural sky geometry.
 *
 * @augments BufferGeometry
 * @three_import import { SkyGeometry } from 'three/addons/misc/RollerCoaster.js';
 */
class SkyGeometry extends BufferGeometry {

	/**
	 * Constructs a new geometry.
	 */
	constructor() {

		super();

		const vertices = [];

		for ( let i = 0; i < 100; i ++ ) {

			const x = Math.random() * 800 - 400;
			const y = Math.random() * 50 + 50;
			const z = Math.random() * 800 - 400;

			const size = Math.random() * 40 + 20;

			vertices.push( x - size, y, z - size );
			vertices.push( x + size, y, z - size );
			vertices.push( x - size, y, z + size );

			vertices.push( x + size, y, z - size );
			vertices.push( x + size, y, z + size );
			vertices.push( x - size, y, z + size );

		}


		this.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );

	}

}

/**
 * A procedural trees geometry.
 *
 * @augments BufferGeometry
 * @three_import import { TreesGeometry } from 'three/addons/misc/RollerCoaster.js';
 */
class TreesGeometry extends BufferGeometry {

	/**
	 * Constructs a new geometry.
	 *
	 * @param {Mesh} landscape - A mesh representing the landscape. Trees will be positioned
	 * randomly on the landscape's surface.
	 */
	constructor( landscape ) {

		super();

		const vertices = [];
		const colors = [];

		const raycaster = new Raycaster();
		vec3Set( raycaster.ray.direction, 0, - 1, 0 );

		const _color = { r: 0, g: 0, b: 0 };

		for ( let i = 0; i < 2000; i ++ ) {

			const x = Math.random() * 500 - 250;
			const z = Math.random() * 500 - 250;

			vec3Set( raycaster.ray.origin, x, 50, z );

			const intersections = raycaster.intersectObject( landscape );

			if ( intersections.length === 0 ) continue;

			const y = intersections[ 0 ].point.y;

			const height = Math.random() * 5 + 0.5;

			let angle = Math.random() * Math.PI * 2;

			vertices.push( x + Math.sin( angle ), y, z + Math.cos( angle ) );
			vertices.push( x, y + height, z );
			vertices.push( x + Math.sin( angle + Math.PI ), y, z + Math.cos( angle + Math.PI ) );

			angle += Math.PI / 2;

			vertices.push( x + Math.sin( angle ), y, z + Math.cos( angle ) );
			vertices.push( x, y + height, z );
			vertices.push( x + Math.sin( angle + Math.PI ), y, z + Math.cos( angle + Math.PI ) );

			const random = Math.random() * 0.1;

			for ( let j = 0; j < 6; j ++ ) {

				colorSetRGB( 0.2 + random, 0.4 + random, 0, SRGBColorSpace, _color );

				colors.push( _color.r, _color.g, _color.b );

			}

		}

		this.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );
		this.setAttribute( 'color', new BufferAttribute( new Float32Array( colors ), 3 ) );

	}

}

export { RollerCoasterGeometry, RollerCoasterLiftersGeometry, RollerCoasterShadowGeometry, SkyGeometry, TreesGeometry };
