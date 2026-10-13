import {
	BoxGeometry,
	BufferGeometry,
	CircleGeometry,
	Color,
	Float32BufferAttribute,
	Group,
	InstancedBufferAttribute,
	InterpolationSamplingMode,
	InterpolationSamplingType,
	LatheGeometry,
	Vector2,
	Vector3
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { atan, attribute, color, float, mix, normalGeometry, positionGeometry, select, smoothstep, uniform, uniformArray, uv, varying, vec2 } from 'three/tsl';

import { mergeGeometries } from '../../utils/BufferGeometryUtils.js';
import { LoftGeometry } from '../../geometries/LoftGeometry.js';
import { createInstances, updateInstances } from './InstancedMeshGenerator.js';
import { part } from './CityGeneratorUtils.js';

/**
 * A low-poly car fleet with lofted bodies, circular wheel arches, curved
 * windscreens and recessed alloy wheels. Separate cabin panels define the
 * windows and their frames. Two body types ( sedan and SUV ) are mixed
 * deterministically across the fleet, and the taxi colour gets its own sedan with
 * a roof sign, so a parked row reads as different vehicles rather than one mould.
 *
 * Each geometry is built once per type and shared; cars are grouped by body
 * type with per-instance paint, so each group is a single instanced draw that
 * assigns paint, glass, tyres and lamps using a baked `partId`, panel UVs and
 * canonical-space masks.
 *
 * The canonical model stands with its wheels on `y = 0`, centred in X / Z, facing
 * `+Z`, so a placement whose local `+Z` faces the road parks it nose-out.
 *
 * ```js
 * const cars = new CarGenerator();
 * scene.add( cars.build( placements ) ); // placements: { matrix: Matrix4, color }[]
 * ```
 */
class CarGenerator {

	constructor( parameters = {} ) {

		this.parameters = Object.assign( {}, CarGenerator.defaults, parameters );

		this.geometries = new Map(); // one shared shell per body type
		this.materials = new Map(); // one material per body type
		this.mesh = null;

	}

	build( cars ) {

		if ( this.mesh && this.mesh.children.some( ( mesh ) => mesh.instanceMatrix.count < cars.length ) ) this.dispose();

		// bucket the fleet by body type for one instanced draw per shell.
		// the taxi colour always gets the signed sedan;
		// the rest split deterministically between sedan and SUV
		const buckets = new Map();

		for ( let i = 0; i < cars.length; i ++ ) {

			const car = cars[ i ];
			const type = car.color === CarGenerator.taxiColor ? 'taxi' : ( ( ( i * 2654435761 ) >>> 0 ) % 100 < 42 ? 'suv' : 'sedan' );
			if ( ! buckets.has( type ) ) buckets.set( type, [] );
			buckets.get( type ).push( car );

		}

		if ( this.mesh === null ) {

			this.mesh = new Group();
			this.mesh.name = 'Cars';

		}

		const group = this.mesh;
		for ( const mesh of group.children ) updateInstances( mesh, [] );
		const paint = new Color();

		for ( const [ type, instances ] of buckets ) {

			let geometry = this.geometries.get( type );
			if ( geometry === undefined ) {

				geometry = buildCarGeometry( BODY_SPECS[ type ] );
				this.geometries.set( type, geometry );

			}

			let material = this.materials.get( type );
			if ( material === undefined ) {

				material = createCarMaterial( BODY_SPECS[ type ] );
				this.materials.set( type, material );

			}

			let mesh = group.children.find( ( child ) => child.geometry === geometry );

			if ( mesh === undefined ) {

				mesh = createInstances( geometry, material, cars.length, 'Car' );
				geometry.setAttribute( 'paintColor', new InstancedBufferAttribute( new Float32Array( mesh.instanceMatrix.count * 3 ), 3 ) );
				group.add( mesh );

			}

			const colors = geometry.getAttribute( 'paintColor' );

			for ( let i = 0; i < instances.length; i ++ ) {

				paint.set( instances[ i ].color ).toArray( colors.array, i * 3 );

			}

			colors.needsUpdate = true;
			updateInstances( mesh, instances.map( ( car ) => car.matrix ) );

		}

		return group;

	}

	dispose() {

		for ( const geometry of this.geometries.values() ) geometry.dispose();
		this.geometries.clear();

		if ( this.mesh ) this.mesh.traverse( ( object ) => object.dispose() );

		for ( const material of this.materials.values() ) material.dispose();
		this.materials.clear();

		this.mesh = null;

	}

}

CarGenerator.defaults = {};

// the paint colour that gets the roof-signed taxi shell
CarGenerator.taxiColor = 0xf5c518;

const BODY = 0, WINDOW = 1, TYRE = 2, ALLOY = 3, TRIM = 4, MIRROR = 5, SIGN = 6, FRONT = 7, REAR = 8;

// Body sections are [ z, half-width, shoulder height, deck height ]. The cabin
// has separate base and roof corners, so changing its shape also moves its panes.
const BODY_SPECS = {

	sedan: {
		body: [
			[ 2.25, 0.79, 0.67, 0.79 ],
			[ 2.11, 0.89, 0.78, 0.91 ],
			[ 1.38, 0.94, 0.87, 1.00 ],
			[ 0.75, 0.92, 0.89, 1.025 ],
			[ - 0.45, 0.92, 0.91, 1.04 ],
			[ - 1.38, 0.94, 0.88, 1.06 ],
			[ - 2.10, 0.89, 0.77, 0.97 ],
			[ - 2.25, 0.81, 0.70, 0.85 ]
		],
		front: { base: [ 0.82, 0.99, 0.78 ], roof: [ 0.69, 1.45, 0.12 ] },
		rear: { base: [ 0.83, 1.02, - 1.15 ], roof: [ 0.71, 1.47, - 0.72 ] },
		wheelRadius: 0.35, wheelZ: 1.38, wheelX: 0.83,
		pillars: [ - 0.30 ], lamps: [ 0.71, 0.76 ],
		sign: false, rails: false
	},

	suv: {
		body: [
			[ 2.30, 0.84, 0.84, 0.99 ],
			[ 2.15, 0.94, 0.94, 1.10 ],
			[ 1.40, 0.98, 1.02, 1.17 ],
			[ 0.76, 0.96, 1.04, 1.19 ],
			[ - 0.45, 0.96, 1.05, 1.20 ],
			[ - 1.40, 0.98, 1.03, 1.21 ],
			[ - 2.16, 0.94, 0.94, 1.16 ],
			[ - 2.30, 0.84, 0.86, 1.03 ]
		],
		front: { base: [ 0.86, 1.15, 0.78 ], roof: [ 0.76, 1.73, 0.18 ] },
		rear: { base: [ 0.87, 1.15, - 2.12 ], roof: [ 0.77, 1.75, - 1.66 ] },
		wheelRadius: 0.39, wheelZ: 1.40, wheelX: 0.87,
		pillars: [ - 0.30, - 1.16 ], lamps: [ 0.91, 0.94 ],
		sign: false, rails: true
	}

};

BODY_SPECS.taxi = Object.assign( {}, BODY_SPECS.sedan, { sign: true } );

function buildBody( spec ) {

	const profile = spec.body;
	const radius = spec.wheelRadius + 0.055;
	const stations = new Set( profile.map( section => section[ 0 ] ) );

	// Sample the arches around the axle, then interpolate the body profile at
	// those stations. Wheel size and placement no longer need hand-shaped cuts.
	for ( const axle of [ - spec.wheelZ, spec.wheelZ ] ) {

		for ( let i = 0; i <= 6; i ++ ) stations.add( axle + radius * Math.cos( i / 6 * Math.PI ) );

	}

	const sections = Array.from( stations ).sort( ( a, b ) => b - a ).map( z => {

		let index = 0;
		while ( index < profile.length - 2 && z < profile[ index + 1 ][ 0 ] ) index ++;

		const a = profile[ index ], b = profile[ index + 1 ];
		const t = ( z - a[ 0 ] ) / ( b[ 0 ] - a[ 0 ] );
		const w = a[ 1 ] + ( b[ 1 ] - a[ 1 ] ) * t;
		const shoulder = a[ 2 ] + ( b[ 2 ] - a[ 2 ] ) * t;
		const deck = a[ 3 ] + ( b[ 3 ] - a[ 3 ] ) * t;
		const distance = Math.abs( Math.abs( z ) - spec.wheelZ );
		const sill = distance <= radius ? spec.wheelRadius + Math.sqrt( Math.max( 0, radius * radius - distance * distance ) ) : 0.28;

		const right = [
			new Vector3( w * 0.82, sill, z ),
			new Vector3( w * 0.97, sill + ( shoulder - sill ) * 0.12, z ),
			new Vector3( w, shoulder, z ),
			new Vector3( w * 0.91, deck - 0.025, z ),
			new Vector3( w * 0.52, deck, z )
		];

		return [ ...right, ...right.slice().reverse().map( p => new Vector3( - p.x, p.y, p.z ) ) ].reverse();

	} );

	const geometry = part( new LoftGeometry( sections, { capStart: true, capEnd: true } ), BODY );
	const normals = geometry.attributes.normal;
	const ids = geometry.attributes.partId;
	for ( let i = 0; i < normals.count; i ++ ) {

		if ( normals.getZ( i ) > 0.9999 ) ids.setX( i, FRONT );
		if ( normals.getZ( i ) < - 0.9999 ) ids.setX( i, REAR );

	}

	return geometry;

}

// Independent panel vertices preserve the crease at each pillar and roof edge.
// Their UVs also give the material an exact outline for the window seals.
function panel( corners, id, curved = false ) {

	const geometry = new BufferGeometry();
	const columns = curved ? 4 : 1, rows = curved ? 2 : 1;
	const positions = [], uvs = [], indices = [];
	const normal = corners[ 1 ].clone().sub( corners[ 0 ] ).cross( corners[ 3 ].clone().sub( corners[ 0 ] ) ).normalize();

	for ( let y = 0; y <= rows; y ++ ) {

		const v = y / rows;
		for ( let x = 0; x <= columns; x ++ ) {

			const u = x / columns;
			const p = corners[ 0 ].clone().lerp( corners[ 1 ], u ).lerp( corners[ 3 ].clone().lerp( corners[ 2 ], u ), v );
			if ( curved ) {

				const arch = 4 * u * ( 1 - u );
				p.y += arch * v * 0.035;
				p.addScaledVector( normal, arch * 4 * v * ( 1 - v ) * 0.025 );

			}

			p.toArray( positions, positions.length );
			uvs.push( u, v );

			if ( x < columns && y < rows ) {

				const a = y * ( columns + 1 ) + x, b = a + 1, d = a + columns + 1, c = d + 1;
				indices.push( a, b, d, b, c, d );

			}

		}

	}

	geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
	geometry.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );
	geometry.setIndex( indices );
	geometry.computeVertexNormals();
	return part( geometry, id );

}

function buildCarGeometry( spec ) {

	const parts = [ buildBody( spec ) ];
	const corner = ( point, side ) => new Vector3( point[ 0 ] * side, point[ 1 ], point[ 2 ] );
	const fl = corner( spec.front.base, - 1 ), fr = corner( spec.front.base, 1 );
	const rl = corner( spec.rear.base, - 1 ), rr = corner( spec.rear.base, 1 );
	const tfl = corner( spec.front.roof, - 1 ), tfr = corner( spec.front.roof, 1 );
	const trl = corner( spec.rear.roof, - 1 ), trr = corner( spec.rear.roof, 1 );

	parts.push(
		panel( [ fl, fr, tfr, tfl ], WINDOW, true ),
		panel( [ rr, rl, trl, trr ], WINDOW, true ),
		panel( [ fr, rr, trr, tfr ], WINDOW ),
		panel( [ rl, fl, tfl, trl ], WINDOW )
	);

	const roof = [ spec.front.roof, spec.rear.roof ].map( ( [ width, y, z ] ) => Array.from( { length: 5 }, ( _, i ) => {

		const u = i / 4;
		return new Vector3( ( u * 2 - 1 ) * width, y + 4 * u * ( 1 - u ) * 0.035, z );

	} ) );
	parts.push( part( new LoftGeometry( roof, { closed: false } ), BODY ) );

	const r = spec.wheelRadius;
	const rim = r * 0.64;
	const width = r * 0.68;
	const wheelProfile = [
		new Vector2( r * 0.93, - width * 0.44 ),
		new Vector2( r, - width * 0.12 ),
		new Vector2( r * 0.98, width * 0.27 ),
		new Vector2( rim + 0.014, width * 0.44 )
	];

	for ( const side of [ - 1, 1 ] ) {

		for ( const z of [ - spec.wheelZ, spec.wheelZ ] ) {

			const x = side * spec.wheelX;
			const tyre = new LatheGeometry( wheelProfile, 24 ).rotateZ( - side * Math.PI / 2 ).translate( x, r, z );
			const lip = new LatheGeometry( [ new Vector2( rim + 0.014, width * 0.44 ), new Vector2( rim, width * 0.29 ) ], 24 ).rotateZ( - side * Math.PI / 2 ).translate( x, r, z );
			const hub = new CircleGeometry( rim, 24 );
			hub.attributes.position.setZ( 0, - 0.015 );
			hub.computeVertexNormals();
			hub.rotateY( side * Math.PI / 2 ).translate( x + side * width * 0.29, r, z );
			const well = new CircleGeometry( r + 0.06, 8, 0, Math.PI ).rotateY( side * Math.PI / 2 ).translate( x - side * ( width * 0.5 + 0.02 ), r, z );

			parts.push( part( tyre, TYRE ), part( lip, ALLOY ), part( hub, ALLOY ), part( well, TRIM ) );

		}

		const mirror = new BoxGeometry( 0.16, 0.1, 0.2 ).rotateY( side * 0.2 ).translate( side * ( spec.body[ 2 ][ 1 ] + 0.06 ), spec.front.base[ 1 ] + 0.05, spec.front.base[ 2 ] - 0.16 );
		parts.push( part( mirror, MIRROR ) );

		if ( spec.rails ) {

			const sections = [ 0.06, 0.13, 0.87, 0.94 ].map( ( t, i ) => {

				const z = tfr.z + ( trr.z - tfr.z ) * t;
				const roofWidth = tfr.x + ( trr.x - tfr.x ) * t;
				const y = tfr.y + ( trr.y - tfr.y ) * t + ( 1 - ( 0.63 / roofWidth ) ** 2 ) * 0.035 + ( i === 0 || i === 3 ? 0.005 : 0.05 );
				const x = side * 0.63;
				return [ new Vector3( x - 0.022, y - 0.018, z ), new Vector3( x + 0.022, y - 0.018, z ), new Vector3( x + 0.022, y + 0.018, z ), new Vector3( x - 0.022, y + 0.018, z ) ].reverse();

			} );
			parts.push( part( new LoftGeometry( sections, { capStart: true, capEnd: true } ), TRIM ) );

		}

	}

	if ( spec.sign ) {

		const roofY = ( tfr.y + trr.y ) / 2 + 0.04;
		const section = ( w, d, y ) => [ new Vector3( w, y, d ), new Vector3( - w, y, d ), new Vector3( - w, y, - d ), new Vector3( w, y, - d ) ];
		const sign = new LoftGeometry( [ section( 0.16, 0.065, roofY + 0.1 ), section( 0.20, 0.095, roofY ) ], { capStart: true, capEnd: true } ).translate( 0, 0, - 0.2 );
		parts.push( part( sign, SIGN ) );

	}

	return mergeGeometries( parts );

}

function roundedRect( point, halfSize, radius ) {

	const q = point.abs().sub( halfSize ).add( radius );
	const distance = q.max( 0 ).length().add( q.x.max( q.y ).min( 0 ) ).sub( radius );
	const edge = distance.fwidth().max( 0.001 );
	return smoothstep( edge, edge.negate(), distance );

}

function createCarMaterial( spec ) {

	// Dimensions are uniforms, keeping one shader pipeline across body types.
	const paint = attribute( 'paintColor', 'vec3' );
	const axle = uniform( spec.wheelZ );
	const radius = uniform( spec.wheelRadius );
	const lamps = uniform( new Vector2( ...spec.lamps ) );
	const belt = uniform( spec.front.base[ 1 ] );
	const doorEnd = spec.rails ? spec.pillars[ 1 ] - 0.08 : spec.rear.base[ 2 ] + 0.1;
	const seams = uniform( new Vector3( spec.front.base[ 2 ] - 0.04, spec.pillars[ 0 ], doorEnd ) );
	const handles = uniform( new Vector2( spec.pillars[ 0 ] + 0.17, doorEnd + 0.17 ) );
	const pillars = uniformArray( [ spec.pillars[ 0 ], spec.pillars[ 1 ] ?? 9 ] );

	const partId = varying( attribute( 'partId', 'float' ) ).setInterpolation( InterpolationSamplingType.FLAT, InterpolationSamplingMode.EITHER );
	const isWindow = partId.equal( WINDOW );
	const isTyre = partId.equal( TYRE );
	const isAlloy = partId.equal( ALLOY );
	const isTrim = partId.equal( TRIM );
	const isMirror = partId.equal( MIRROR );
	const isSign = partId.equal( SIGN );
	const p = positionGeometry;
	const side = normalGeometry.x.abs().greaterThan( 0.5 );

	// Rounded panes and their rubber seals follow the panel UVs. Only the side
	// panes receive pillars, leaving both windscreens uninterrupted.
	const paneUV = uv().sub( 0.5 );
	let glass = roundedRect( paneUV, vec2( 0.455, 0.405 ), 0.035 );
	let seal = roundedRect( paneUV, vec2( 0.47, 0.43 ), 0.045 );
	for ( let i = 0; i < 2; i ++ ) {

		const distance = p.z.sub( pillars.element( i ) ).abs();
		glass = glass.mul( select( side, smoothstep( 0.043, 0.053, distance ), 1 ) );
		seal = seal.mul( select( side, smoothstep( 0.026, 0.035, distance ), 1 ) );

	}

	const windowColor = mix( mix( paint, color( 0x13191c ), seal ), color( 0x1d2b35 ), glass );
	const mirrorGlass = isMirror.and( normalGeometry.z.lessThan( - 0.5 ) );
	const glazing = select( isWindow, glass, select( mirrorGlass, 1, 0 ) );

	const wheel = vec2( p.z.abs().sub( axle ), p.y.sub( radius ) );
	const wheelDistance = wheel.length();
	const flank = smoothstep( 0.65, 0.85, p.x.abs() );
	const archShade = smoothstep( radius.add( 0.025 ), radius.add( 0.095 ), wheelDistance );
	const shading = mix( float( 1 ), archShade.mul( 0.28 ).add( 0.72 ), flank ).mul( smoothstep( 0.25, 0.65, p.y ).mul( 0.3 ).add( 0.7 ) );

	let seam = float( 0 );
	for ( const z of [ seams.x, seams.y, seams.z ] ) seam = seam.max( smoothstep( 0.012, 0.004, p.z.sub( z ).abs() ) );
	for ( const z of [ handles.x, handles.y ] ) seam = seam.max( roundedRect( vec2( p.z.sub( z ), p.y.sub( belt.sub( 0.10 ) ) ), vec2( 0.06, 0.011 ), 0.006 ) );
	seam = seam.mul( flank ).mul( smoothstep( 0.36, 0.43, p.y ) ).mul( smoothstep( belt, belt.sub( 0.025 ), p.y ) );
	let bodyColor = paint.mul( shading ).mul( seam.mul( 0.5 ).oneMinus() );

	// Lamps, grille, number plates and bumper inlets are inset into the fascia.
	// The front and rear caps supply their silhouettes without floating boxes.
	const front = partId.equal( FRONT );
	const rear = partId.equal( REAR );
	const end = front.or( rear );
	const lampY = select( front, lamps.x, lamps.y );
	const light = roundedRect( vec2( p.x.abs().sub( 0.61 ), p.y.sub( lampY ) ), vec2( 0.19, 0.055 ), 0.018 ).mul( select( end, 1, 0 ) );
	const grille = roundedRect( vec2( p.x, p.y.sub( lamps.x.sub( 0.025 ) ) ), vec2( 0.30, 0.075 ), 0.025 ).mul( select( front, 1, 0 ) );
	const intake = roundedRect( vec2( p.x, p.y.sub( lampY.sub( 0.29 ) ) ), vec2( 0.66, 0.045 ), 0.03 ).mul( select( end, 1, 0 ) );
	const plateY = select( front, lamps.x.sub( 0.20 ), lamps.y.sub( 0.17 ) );
	const plate = roundedRect( vec2( p.x, p.y.sub( plateY ) ), vec2( 0.155, 0.055 ), 0.008 ).mul( select( end, 1, 0 ) );
	const slats = p.y.mul( 65 ).fract().step( 0.5 ).mul( 0.35 ).add( 0.65 );
	bodyColor = mix( bodyColor, color( 0x161a1c ).mul( slats ), grille.max( intake ) );
	bodyColor = mix( bodyColor, color( 0xd8d9d3 ), plate );
	bodyColor = mix( bodyColor, select( front, color( 0xd1e4eb ), color( 0x7b1015 ) ), light );

	const spokeAngle = atan( wheel.y, wheel.x ).mul( 5 / ( Math.PI * 2 ) );
	const spokes = smoothstep( 0.62, 0.42, spokeAngle.fract().sub( 0.5 ).abs().mul( 2 ) );
	const rim = smoothstep( radius.mul( 0.53 ), radius.mul( 0.59 ), wheelDistance );
	const hub = smoothstep( 0.06, 0.035, wheelDistance );
	const alloy = mix( color( 0x171b20 ), color( 0xafb6ba ), spokes.max( rim ).max( hub ) );
	const tyre = color( 0x18191b ).mul( smoothstep( radius.mul( 0.85 ), radius.mul( 0.94 ), wheelDistance ).mul( 0.2 ).add( 0.8 ) );

	const material = new MeshStandardNodeMaterial();
	material.colorNode = select( isTyre, tyre,
		select( isAlloy, alloy,
			select( isTrim, color( 0x202326 ),
				select( isSign, color( 0xffd66a ),
					select( isWindow, windowColor,
						select( mirrorGlass, color( 0x70808a ), bodyColor ) ) ) ) ) );
	material.roughnessNode = select( isTyre.or( isTrim ), float( 0.85 ), mix( float( 0.32 ), float( 0.055 ), glazing ) );
	material.metalnessNode = select( isAlloy, float( 0.8 ), select( isTyre.or( isTrim ).or( isSign ), float( 0 ), mix( float( 0.25 ), float( 0.85 ), glazing ) ) );
	material.emissiveNode = select( front, color( 0xd9efff ).mul( 4 ), color( 0xf00008 ).mul( 1.5 ) ).mul( light ).add( select( isSign, color( 0xffd77b ).mul( 2 ), color( 0x000000 ) ) );

	return material;

}

export { CarGenerator };
