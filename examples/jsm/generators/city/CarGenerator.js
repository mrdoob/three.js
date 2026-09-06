import {
	BoxGeometry,
	CircleGeometry,
	Color,
	Group,
	InstancedBufferAttribute,
	InterpolationSamplingMode,
	InterpolationSamplingType,
	LatheGeometry,
	Vector2,
	Vector3
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { atan, attribute, color, float, mix, normalGeometry, positionGeometry, select, smoothstep, uniform, uniformArray, varying, vec2 } from 'three/tsl';

import { mergeGeometries } from '../../utils/BufferGeometryUtils.js';
import { LoftGeometry } from '../../geometries/LoftGeometry.js';
import { createInstances, updateInstances } from './InstancedMeshGenerator.js';
import { part } from './CityGeneratorUtils.js';

/**
 * A low-poly car fleet: smooth body shells lofted through a row of cross sections,
 * with real wheel-arch cutouts, an asymmetric hood / cabin / trunk, alloy wheels,
 * door seams and smoked glazing. Two body types ( sedan and SUV ) are mixed
 * deterministically across the fleet, and the taxi colour gets its own sedan with
 * a roof sign, so a parked row reads as different vehicles rather than one mould.
 *
 * Each geometry is built once per type and shared; cars are grouped by body
 * type with per-instance paint, so each group is a single instanced draw that
 * carves paint, glass, tyres, chrome and lamps out of a baked `partId` plus
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

const BODY = 0, WHEEL = 1, HEADLIGHT = 2, TAILLIGHT = 3, TRIM = 4, PLATE = 5, SIGN = 6, MIRROR = 7;

/*
 * Everything that shapes a body type lives in one spec: the loft stations
 * ( z, bodyHalfW, roofHalfW, yLow, yBelt, yRoof, nose to tail ) plus the
 * canonical-space constants the material masks reuse. Station yLow rises over
 * the axles, cutting real wheel arches into the shell's silhouette.
 */
const BODY_SPECS = {

	sedan: {
		stations: [
			[ 2.20, 0.79, 0.73, 0.36, 0.65, 0.77 ], // front fascia
			[ 2.08, 0.87, 0.81, 0.30, 0.73, 0.87 ], // hood lip
			[ 1.73, 0.90, 0.84, 0.30, 0.79, 0.92 ], // front wheel arch
			[ 1.61, 0.92, 0.85, 0.59, 0.80, 0.93 ],
			[ 1.34, 0.92, 0.85, 0.73, 0.82, 0.94 ],
			[ 1.07, 0.92, 0.85, 0.59, 0.84, 0.95 ],
			[ 0.95, 0.91, 0.84, 0.29, 0.85, 0.96 ],
			[ 0.78, 0.91, 0.82, 0.28, 0.86, 0.98 ], // windshield base
			[ 0.20, 0.91, 0.71, 0.28, 0.88, 1.42 ], // roof front
			[ - 0.64, 0.91, 0.72, 0.28, 0.89, 1.44 ], // roof rear
			[ - 0.96, 0.91, 0.82, 0.29, 0.89, 1.04 ], // rear window base
			[ - 1.08, 0.92, 0.85, 0.59, 0.88, 0.98 ], // rear wheel arch
			[ - 1.35, 0.92, 0.85, 0.73, 0.86, 0.96 ],
			[ - 1.62, 0.91, 0.84, 0.59, 0.84, 0.94 ],
			[ - 1.74, 0.90, 0.83, 0.30, 0.82, 0.92 ],
			[ - 2.08, 0.87, 0.81, 0.31, 0.76, 0.88 ], // trunk lip
			[ - 2.20, 0.79, 0.74, 0.37, 0.67, 0.80 ] // rear fascia
		],
		nose: 2.20, tail: - 2.20,
		wheelRadius: 0.34, wheelZ: 1.345, wheelX: 0.80, hubRadius: 0.22,
		glassY: 0.97, roofCapY: 1.38, cabin: [ - 1.02, 0.75 ], screens: [ 0.22, - 0.66 ], windowWidths: [ 0.80, 0.70 ],
		pillars: [[ - 0.29, - 0.21 ]],
		seams: [ 0.72, - 0.25, - 0.98 ], handles: [ - 0.12, - 0.85 ], handleY: 0.90,
		mirror: [ 1.02, 0.60 ], lampY: 0.66, tailLampY: 0.70, bumperY: 0.42,
		sign: false
	},

	suv: {
		stations: [
			[ 2.24, 0.82, 0.76, 0.40, 0.81, 0.94 ], // front fascia
			[ 2.12, 0.92, 0.86, 0.35, 0.89, 1.04 ], // hood lip
			[ 1.80, 0.95, 0.87, 0.35, 0.92, 1.07 ], // front wheel arch
			[ 1.67, 0.96, 0.88, 0.67, 0.94, 1.08 ],
			[ 1.37, 0.96, 0.88, 0.82, 0.95, 1.09 ],
			[ 1.07, 0.96, 0.88, 0.67, 0.97, 1.10 ],
			[ 0.94, 0.95, 0.87, 0.34, 0.98, 1.11 ],
			[ 0.78, 0.95, 0.86, 0.33, 1.00, 1.14 ], // windshield base
			[ 0.24, 0.95, 0.77, 0.33, 1.02, 1.70 ], // roof front
			[ - 0.70, 0.95, 0.78, 0.33, 1.03, 1.73 ],
			[ - 0.94, 0.95, 0.78, 0.34, 1.03, 1.73 ],
			[ - 1.07, 0.96, 0.78, 0.67, 1.03, 1.72 ], // rear wheel arch
			[ - 1.37, 0.96, 0.78, 0.82, 1.02, 1.71 ],
			[ - 1.67, 0.95, 0.77, 0.67, 1.01, 1.69 ], // roof rear
			[ - 1.80, 0.94, 0.83, 0.35, 1.00, 1.48 ], // rear window
			[ - 2.12, 0.91, 0.86, 0.36, 0.96, 1.20 ],
			[ - 2.24, 0.81, 0.77, 0.42, 0.84, 1.08 ] // tailgate
		],
		nose: 2.24, tail: - 2.24,
		wheelRadius: 0.385, wheelZ: 1.37, wheelX: 0.83, hubRadius: 0.25,
		glassY: 1.12, roofCapY: 1.66, cabin: [ - 2.05, 0.75 ], screens: [ 0.26, - 1.68 ], windowWidths: [ 0.84, 0.76 ],
		pillars: [[ - 0.28, - 0.20 ], [ - 1.06, - 0.98 ]],
		seams: [ 0.72, - 0.24, - 1.13 ], handles: [ - 0.10, - 0.98 ], handleY: 1.04,
		mirror: [ 1.17, 0.62 ], lampY: 0.82, tailLampY: 0.93, bumperY: 0.49,
		sign: false, rails: true
	}

};

// the taxi is the sedan shell plus a lit roof sign
BODY_SPECS.taxi = Object.assign( {}, BODY_SPECS.sedan, { sign: true } );

// Twelve points define the sill, shoulder crease and roof crown. The extra
// longitudinal sections are spent on the wheel arches and cabin profile.
function carSection( z, bodyHalfW, roofHalfW, yLow, yBelt, yRoof ) {

	const right = [
		new Vector3( bodyHalfW * 0.84, yLow, z ),
		new Vector3( bodyHalfW * 0.98, yLow + ( yBelt - yLow ) * 0.18, z ),
		new Vector3( bodyHalfW, yBelt, z ),
		new Vector3( bodyHalfW * 0.97, yBelt + ( yRoof - yBelt ) * 0.10, z ),
		new Vector3( roofHalfW, yRoof - ( yRoof - yBelt ) * 0.04, z ),
		new Vector3( roofHalfW * 0.55, yRoof, z )
	];

	const section = right.slice();
	for ( let i = right.length - 1; i >= 0; i -- ) {

		const p = right[ i ];
		section.push( new Vector3( - p.x, p.y, p.z ) );

	}

	// The sections run nose to tail; reverse their winding for outward normals.
	return section.reverse();

}

function buildCarGeometry( spec ) {

	const sections = spec.stations.map( s => carSection( ...s ) );
	const body = new LoftGeometry( sections, { closed: true, capStart: true, capEnd: true } );

	// each wheel is one lathed profile: tread with rounded shoulders, a bulged
	// sidewall stepping down to the rim lip, and the spoke face recessed behind
	// it. the material splits tyre from alloy by radial distance, so the whole
	// wheel needs no seams and no separate hub disc
	const r = spec.wheelRadius;
	const rim = spec.hubRadius;
	const w = r * 0.68;

	const wheelProfile = [
		new Vector2( r * 0.94, - w * 0.44 ),
		new Vector2( r, - w * 0.16 ), // tread
		new Vector2( r, w * 0.16 ),
		new Vector2( r * 0.94, w * 0.4 ), // outer shoulder
		new Vector2( rim + 0.02, w * 0.46 ), // sidewall bulge down to the rim
		new Vector2( rim, w * 0.32 ), // rim lip, stepping inward
		new Vector2( 0.02, w * 0.32 ) // recessed spoke face
	];

	const wheels = [];
	for ( const x of [ - spec.wheelX, spec.wheelX ] ) {

		const side = Math.sign( x );
		for ( const z of [ - spec.wheelZ, spec.wheelZ ] ) {

			// A dark half-disc closes the wheel well behind the tyre.
			wheels.push(
				new LatheGeometry( wheelProfile, 16 ).rotateZ( - side * Math.PI / 2 ).translate( x, r, z ),
				new CircleGeometry( r + 0.06, 8, 0, Math.PI ).rotateY( side * Math.PI / 2 ).translate( x - side * ( w * 0.5 + 0.02 ), r, z )
			);

		}

	}

	// painted bumpers wrap each end, a matte grille fills the nose between the
	// lamps, and each lamp pod is sunk into the fascia so only its face shows
	const frontBumper = new BoxGeometry( 1.56, 0.12, 0.12 ).translate( 0, spec.bumperY, spec.nose - 0.04 );
	const rearBumper = new BoxGeometry( 1.56, 0.12, 0.12 ).translate( 0, spec.bumperY, spec.tail + 0.04 );
	const grille = new BoxGeometry( 0.64, 0.13, 0.04 ).translate( 0, spec.lampY - 0.02, spec.nose + 0.01 );

	const headlights = mergeGeometries( [
		new BoxGeometry( 0.38, 0.10, 0.06 ).translate( - 0.48, spec.lampY, spec.nose ),
		new BoxGeometry( 0.38, 0.10, 0.06 ).translate( 0.48, spec.lampY, spec.nose )
	] );

	const taillights = mergeGeometries( [
		new BoxGeometry( 0.38, 0.11, 0.06 ).translate( - 0.46, spec.tailLampY, spec.tail ),
		new BoxGeometry( 0.38, 0.11, 0.06 ).translate( 0.46, spec.tailLampY, spec.tail )
	] );

	// wing mirrors at the base of the A-pillars, angled slightly into the wind
	const mirrorHalfW = Math.max( ...spec.stations.map( station => station[ 1 ] ) );
	const mirrors = mergeGeometries( [
		new BoxGeometry( 0.15, 0.10, 0.18 ).rotateY( - 0.25 ).translate( - ( mirrorHalfW + 0.06 ), spec.mirror[ 0 ], spec.mirror[ 1 ] ),
		new BoxGeometry( 0.15, 0.10, 0.18 ).rotateY( 0.25 ).translate( mirrorHalfW + 0.06, spec.mirror[ 0 ], spec.mirror[ 1 ] )
	] );

	// licence plates centred on the bumpers, proud of the face so the two
	// surfaces never share a plane
	const plates = mergeGeometries( [
		new BoxGeometry( 0.32, 0.12, 0.02 ).translate( 0, spec.bumperY + 0.02, spec.nose + 0.035 ),
		new BoxGeometry( 0.32, 0.12, 0.02 ).translate( 0, spec.bumperY + 0.02, spec.tail - 0.035 )
	] );

	const darkParts = [ ...wheels, grille ];
	const roofY = Math.max( ...spec.stations.map( station => station[ 5 ] ) );

	// low roof rails along an SUV's crown
	if ( spec.rails ) {

		darkParts.push(
			new BoxGeometry( 0.05, 0.045, 1.6 ).translate( - 0.60, roofY + 0.025, - 0.65 ),
			new BoxGeometry( 0.05, 0.045, 1.6 ).translate( 0.60, roofY + 0.025, - 0.65 )
		);

	}

	const parts = [
		part( body, BODY ),
		part( mirrors, MIRROR ),
		part( mergeGeometries( darkParts ), WHEEL ),
		part( mergeGeometries( [ frontBumper, rearBumper ] ), TRIM ),
		part( headlights, HEADLIGHT ),
		part( taillights, TAILLIGHT ),
		part( plates, PLATE )
	];

	// the taxi's lit roof sign
	if ( spec.sign ) parts.push( part( new BoxGeometry( 0.36, 0.1, 0.14 ).translate( 0, roofY + 0.055, - 0.1 ), SIGN ) );

	// The material uses canonical positions; remove UVs before merging the parts.
	for ( const geometry of parts ) geometry.deleteAttribute( 'uv' );

	return mergeGeometries( parts );

}

function createCarMaterial( spec ) {

	// every spec constant enters the shader as a uniform, so all paints and body
	// types share one compiled pipeline: the whole fleet costs a single shader
	// compile instead of one per paint/type pairing

	const paint = attribute( 'paintColor', 'vec3' );
	const glassY = uniform( spec.glassY );
	const roofCapY = uniform( spec.roofCapY );
	const cabinMin = uniform( spec.cabin[ 0 ] );
	const cabinMax = uniform( spec.cabin[ 1 ] );
	const wheelR = uniform( spec.wheelRadius );
	const wheelZ = uniform( spec.wheelZ );
	const hubRadius = uniform( spec.hubRadius );
	const nose = uniform( spec.nose );
	const screenFrontZ = uniform( spec.screens[ 0 ] );
	const screenRearZ = uniform( spec.screens[ 1 ] );
	const windowWidths = uniform( new Vector2( ...spec.windowWidths ) );
	const bumperY = uniform( spec.bumperY );
	const handleY = uniform( spec.handleY );
	const handleZ = uniform( new Vector2( ...spec.handles ) );
	const seamZ = uniform( new Vector3( ...spec.seams ) );

	// pad to a fixed pillar count so the unrolled loop is identical for all types
	const pillarBands = spec.pillars.slice();
	while ( pillarBands.length < 4 ) pillarBands.push( [ 9, 9.001 ] );
	const pillars = uniformArray( pillarBands.map( ( band ) => new Vector2( ...band ) ) ).setName( 'carPillars' );

	const partId = varying( attribute( 'partId', 'float' ) ).setInterpolation( InterpolationSamplingType.FLAT, InterpolationSamplingMode.EITHER );
	const isBody = partId.equal( BODY );
	const isMirror = partId.equal( MIRROR );
	const isWheel = partId.equal( WHEEL );
	const isTrim = partId.equal( TRIM );
	const isHeadlight = partId.equal( HEADLIGHT );
	const isTaillight = partId.equal( TAILLIGHT );
	const isPlate = partId.equal( PLATE );
	const isSign = partId.equal( SIGN );

	// all the masks below carve the shared shell in canonical model space, so
	// their constants come from the same spec that placed the loft stations

	const p = positionGeometry;

	// smoked glazing: the greenhouse above the beltline over the cabin span,
	// interrupted by painted pillar bands and a painted roof cap
	const onScreens = p.z.greaterThan( screenFrontZ ).or( p.z.lessThan( screenRearZ ) );
	const paneY = select( onScreens, glassY.sub( 0.04 ), glassY );
	const overBelt = p.y.greaterThan( paneY ).and( p.y.lessThan( roofCapY ) );
	const inCabin = p.z.greaterThan( cabinMin ).and( p.z.lessThan( cabinMax ) );
	let inPillar = null;
	for ( let i = 0; i < 4; i ++ ) {

		const band = pillars.element( i );
		const inBand = p.z.greaterThan( band.x ).and( p.z.lessThan( band.y ) );
		inPillar = inPillar === null ? inBand : inPillar.or( inBand );

	}

	const glassT = p.y.sub( glassY ).div( roofCapY.sub( glassY ) ).clamp();
	const frontEdge = mix( cabinMax, screenFrontZ, glassT ).sub( 0.045 );
	const rearEdge = mix( cabinMin, screenRearZ, glassT ).add( 0.045 );
	const sideWindow = normalGeometry.x.abs().greaterThan( 0.65 ).and( p.y.greaterThan( glassY ) ).and( p.z.lessThan( frontEdge ) ).and( p.z.greaterThan( rearEdge ) ).and( inPillar.not() );
	const screenWidth = mix( windowWidths.x, windowWidths.y, glassT ).sub( 0.045 );
	const screenWindow = onScreens.and( p.x.abs().lessThan( screenWidth ) );
	const cabinGlass = isBody.and( overBelt ).and( inCabin ).and( sideWindow.or( screenWindow ) );
	const mirrorGlass = isMirror.and( normalGeometry.z.lessThan( - 0.5 ) );
	const isGlass = cabinGlass.or( mirrorGlass );

	// tinted glass as a dark mirror: a rubber reveal frames each pane, the tint
	// deepens toward the belt where the cabin sits behind it, and metal-style
	// reflectance turns the panes into sky mirrors even under a dim environment
	const paneEdge = ( a, b ) => smoothstep( 0.05, 0.016, a ).max( smoothstep( 0.05, 0.016, b ) );
	let reveal = paneEdge( p.y.sub( paneY ), roofCapY.sub( p.y ) ).max( paneEdge( p.z.sub( cabinMin ), cabinMax.sub( p.z ) ) );
	for ( let i = 0; i < 4; i ++ ) {

		const band = pillars.element( i );
		reveal = reveal.max( smoothstep( 0.045, 0.015, p.z.sub( band.x ).abs().min( p.z.sub( band.y ).abs() ) ) );

	}

	const glassColor = color( 0x2a323b ).mul( glassT.mul( 0.55 ).add( 0.7 ) ).mul( reveal.mul( 0.7 ).oneMinus() );

	// baked contact shading: the flanks fall into shadow around each wheel arch
	// and along the rocker panel, and the underbody drops to near black
	const arch = ( z ) => smoothstep( wheelR.add( 0.02 ), wheelR.add( 0.14 ), vec2( p.z.sub( z ), p.y.sub( wheelR ) ).length() );
	const onFlank = smoothstep( 0.55, 0.8, p.x.abs() );
	const arches = arch( wheelZ ).mul( arch( wheelZ.negate() ) ).oneMinus().mul( onFlank );
	const rocker = smoothstep( 0.55, 0.36, p.y );
	const shading = arches.max( rocker.mul( 0.85 ) ).clamp( 0, 0.9 ).oneMinus();

	// door seams: thin dark cuts across the flank, with a handle dash behind
	// the leading edge of each door
	let seams = float( 0 );
	for ( const z of [ seamZ.x, seamZ.y, seamZ.z ] ) seams = seams.max( smoothstep( 0.028, 0.008, p.z.sub( z ).abs() ) );
	for ( const z of [ handleZ.x, handleZ.y ] ) seams = seams.max( smoothstep( 0.016, 0.008, p.y.sub( handleY ).abs() ).mul( smoothstep( 0.055, 0.04, p.z.sub( z ).abs() ) ).mul( 0.7 ) );
	const seamBand = smoothstep( 0.4, 0.46, p.y ).mul( smoothstep( glassY, glassY.sub( 0.05 ), p.y ) );
	const seamMask = seams.mul( onFlank ).mul( seamBand ).mul( 0.55 );

	// dark plastic valance across the lower fascias
	const valance = smoothstep( 0.56, 0.5, p.y ).mul( smoothstep( nose.sub( 0.34 ), nose.sub( 0.22 ), p.z.abs() ) );

	// window gaskets: a dark rubber line where the glazing meets the paint,
	// running the length of the cabin at the belt and the roof edge
	const cabinGate = smoothstep( cabinMin.sub( 0.04 ), cabinMin.add( 0.08 ), p.z ).mul( smoothstep( cabinMax.add( 0.04 ), cabinMax.sub( 0.08 ), p.z ) );
	const gasketLines = smoothstep( 0.022, 0.008, p.y.sub( glassY ).abs() ).max( smoothstep( 0.022, 0.008, p.y.sub( roofCapY ).abs() ) );
	const gasket = gasketLines.mul( cabinGate ).mul( 0.6 );

	const paintShaded = paint.mul( shading ).mul( seamMask.max( gasket ).oneMinus() );
	const bodyColor = mix( paintShaded, color( 0x17181a ), valance );
	const bumperStrip = smoothstep( 0.014, 0.005, p.y.sub( bumperY.add( 0.035 ) ).abs() );
	const bumperColor = mix( paint.mul( 0.65 ), color( 0xc2c6ca ), bumperStrip );

	// the wheel splits by radial distance from its axle: the recessed face
	// inside the rim lip is the alloy ( five spokes between a rim ring and a
	// centre cap, gaps falling to the brake shadow ), everything outside is
	// tyre rubber with a faint raised-lettering band on the sidewall
	const wheelPlane = vec2( p.z.abs().sub( wheelZ ), p.y.sub( wheelR ) );
	const wheelDist = wheelPlane.length();
	const spokeAngle = atan( wheelPlane.y, wheelPlane.x ).mul( 5 / ( Math.PI * 2 ) );
	const spokes = smoothstep( 0.62, 0.42, spokeAngle.fract().sub( 0.5 ).abs().mul( 2 ) );
	const rimRing = smoothstep( hubRadius.sub( 0.045 ), hubRadius.sub( 0.02 ), wheelDist );
	const hubCap = smoothstep( 0.055, 0.04, wheelDist );
	const alloy = spokes.max( rimRing ).max( hubCap );
	const alloyColor = mix( color( 0x0a0a0c ), color( 0x9ea3a8 ), alloy );

	const isAlloy = wheelDist.lessThan( hubRadius );
	const sidewall = smoothstep( 0.05, 0.015, wheelDist.sub( wheelR.mul( 0.8 ) ).abs() );
	const tireColor = color( 0x131315 ).mul( sidewall.mul( 0.5 ).add( 1 ) );

	// the grille reads as dark horizontal slats
	const slats = p.y.mul( 30 ).fract().step( 0.5 ).mul( 0.4 ).oneMinus();
	const grilleColor = color( 0x1b1c1e ).mul( slats );
	const wheelColor = select( p.z.greaterThan( nose.sub( 0.2 ) ), grilleColor, select( isAlloy, alloyColor, tireColor ) );

	const material = new MeshStandardNodeMaterial();

	material.colorNode = select( isWheel, wheelColor,
		select( isTrim, bumperColor,
			select( isHeadlight, color( 0xd8d8d2 ),
				select( isTaillight, color( 0x5a0a0a ),
					select( isPlate, color( 0xd8d4c4 ),
						select( isSign, color( 0xf2efe0 ),
							select( isGlass, glassColor, bodyColor ) ) ) ) ) ) );

	material.roughnessNode = select( isWheel, select( isAlloy, mix( float( 0.55 ), float( 0.3 ), alloy ), float( 0.85 ) ),
		select( isTrim, float( 0.32 ),
			select( isPlate.or( isSign ), float( 0.6 ),
				select( isGlass, float( 0.06 ), mix( float( 0.32 ), float( 0.65 ), valance ) ) ) ) );

	material.metalnessNode = select( isGlass, float( 0.85 ),
		select( isTrim, bumperStrip.mul( 0.7 ).add( 0.2 ),
			select( isWheel.and( isAlloy ), float( 0.8 ),
				select( isBody.or( isMirror ), smoothstep( 0.5, 0.56, p.y ).mul( 0.2 ), float( 0 ) ) ) ) ); // mirror glass, chrome, alloy, metallic paint above the valance

	// lamp lenses: parked cars run dim marker lights, so they read at dusk
	// without blowing out in daylight ( sunlit white renders near 32 here )
	material.emissiveNode = select( isHeadlight, color( 0xfff2d8 ).mul( 10 ),
		select( isTaillight, color( 0xff2211 ).mul( 4 ),
			select( isSign, color( 0xfff6d8 ).mul( 12 ), color( 0x000000 ) ) ) );

	return material;

}

export { CarGenerator };
