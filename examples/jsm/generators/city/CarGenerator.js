import {
	BoxGeometry,
	BufferAttribute,
	Color,
	Group,
	InstancedMesh,
	InterpolationSamplingMode,
	InterpolationSamplingType,
	LatheGeometry,
	Vector2,
	Vector3
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { atan, attribute, color, float, mix, positionGeometry, select, smoothstep, uniform, uniformArray, varying, vec2 } from 'three/tsl';

import { mergeGeometries } from '../../utils/BufferGeometryUtils.js';
import { LoftGeometry } from '../../geometries/LoftGeometry.js';

/**
 * A low-poly car fleet: smooth body shells lofted through a row of cross sections,
 * with real wheel-arch cutouts, an asymmetric hood / cabin / trunk, alloy wheels,
 * door seams and smoked glazing. Two body types ( sedan and SUV ) are mixed
 * deterministically across the fleet, and the taxi colour gets its own sedan with
 * a roof sign, so a parked row reads as different vehicles rather than one mould.
 *
 * Each geometry is built once per type and shared; cars are grouped by paint and
 * type so each group is a single instanced draw with one cheap material that
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
		this.materials = new Map(); // one material per paint colour and type
		this.mesh = null;

	}

	build( cars ) {

		this.dispose();

		// bucket the fleet by body type and paint so each pairing becomes a
		// single instanced draw. the taxi colour always gets the signed sedan;
		// the rest split deterministically between sedan and SUV
		const buckets = new Map();

		for ( let i = 0; i < cars.length; i ++ ) {

			const car = cars[ i ];
			const type = car.color === CarGenerator.taxiColor ? 'taxi' : ( ( ( i * 2654435761 ) >>> 0 ) % 100 < 42 ? 'suv' : 'sedan' );
			const key = type + '|' + car.color;

			if ( ! buckets.has( key ) ) buckets.set( key, { type, color: car.color, matrices: [] } );
			buckets.get( key ).matrices.push( car.matrix );

		}

		const group = new Group();
		group.name = 'Cars';

		for ( const [ key, { type, color: paint, matrices } ] of buckets ) {

			let geometry = this.geometries.get( type );
			if ( geometry === undefined ) {

				geometry = buildCarGeometry( BODY_SPECS[ type ] );
				this.geometries.set( type, geometry );

			}

			let material = this.materials.get( key );
			if ( material === undefined ) {

				material = createCarMaterial( paint, BODY_SPECS[ type ] );
				this.materials.set( key, material );

			}

			const mesh = new InstancedMesh( geometry, material, matrices.length );
			for ( let i = 0; i < matrices.length; i ++ ) mesh.setMatrixAt( i, matrices[ i ] );
			mesh.castShadow = mesh.receiveShadow = true;
			mesh.name = 'Car';
			group.add( mesh );

		}

		this.mesh = group;

		return group;

	}

	dispose() {

		for ( const geometry of this.geometries.values() ) geometry.dispose();
		this.geometries.clear();

		for ( const material of this.materials.values() ) material.dispose();
		this.materials.clear();

		this.mesh = null;

	}

}

CarGenerator.defaults = {};

// the paint colour that gets the roof-signed taxi shell
CarGenerator.taxiColor = 0xf5c518;

const BODY = 0, WHEEL = 1, HEADLIGHT = 2, TAILLIGHT = 3, TRIM = 4, PLATE = 5, SIGN = 6;

/*
 * Everything that shapes a body type lives in one spec: the loft stations
 * ( z, bodyHalfW, roofHalfW, yLow, yBelt, yRoof, nose to tail ) plus the
 * canonical-space constants the material masks reuse. Station yLow rises over
 * the axles, cutting real wheel arches into the shell's silhouette.
 */
const BODY_SPECS = {

	sedan: {
		stations: [
			[ 2.05, 0.70, 0.70, 0.50, 0.66, 0.74 ], // front fascia
			[ 1.96, 0.84, 0.81, 0.44, 0.71, 0.81 ], // hood rounds over the nose
			[ 1.90, 0.89, 0.86, 0.42, 0.73, 0.84 ], // arch leading edge
			[ 1.50, 0.92, 0.88, 0.68, 0.76, 0.90 ], // front axle, arch apex
			[ 1.10, 0.92, 0.88, 0.38, 0.79, 0.96 ], // arch trailing edge
			[ 0.66, 0.92, 0.84, 0.37, 0.84, 1.02 ], // cowl; the windshield base reaches for the fenders
			[ 0.10, 0.92, 0.72, 0.36, 0.88, 1.40 ], // windshield top, roof front
			[ - 0.72, 0.92, 0.73, 0.36, 0.90, 1.42 ], // roof rear
			[ - 1.10, 0.92, 0.86, 0.37, 0.90, 1.06 ], // backlight base, decklid
			[ - 1.50, 0.90, 0.84, 0.68, 0.90, 1.00 ], // rear axle, arch apex
			[ - 1.88, 0.88, 0.83, 0.40, 0.86, 0.94 ], // decklid
			[ - 1.97, 0.84, 0.80, 0.44, 0.80, 0.88 ], // decklid rounds into the tail
			[ - 2.08, 0.68, 0.66, 0.52, 0.70, 0.78 ] // tail fascia
		],
		nose: 2.05, tail: - 2.08,
		wheelRadius: 0.4, wheelZ: 1.5, wheelX: 0.78, hubRadius: 0.24,
		glassY: 1.0, roofCapY: 1.36, cabin: [ - 1.1, 0.62 ], screens: [ 0.13, - 0.75 ],
		pillars: [[ 0.04, 0.12 ], [ - 0.33, - 0.27 ], [ - 0.76, - 0.68 ]],
		seams: [ 0.6, - 0.3, - 1.0 ], handles: [ - 0.14, - 0.84 ], handleY: 0.9,
		mirror: [ 0.98, 0.5 ], lampY: 0.64, tailLampY: 0.7, bumperY: 0.48,
		sign: false
	},

	suv: {
		stations: [
			[ 2.12, 0.72, 0.72, 0.54, 0.74, 0.82 ], // front fascia
			[ 2.02, 0.86, 0.83, 0.48, 0.79, 0.90 ], // hood rounds over the nose
			[ 1.96, 0.91, 0.88, 0.46, 0.81, 0.93 ], // arch leading edge
			[ 1.55, 0.94, 0.90, 0.74, 0.84, 1.02 ], // front axle, arch apex
			[ 1.13, 0.94, 0.90, 0.44, 0.88, 1.10 ], // arch trailing edge
			[ 0.72, 0.94, 0.86, 0.42, 0.94, 1.16 ], // cowl; the windshield base reaches for the fenders
			[ 0.22, 0.94, 0.78, 0.42, 0.98, 1.58 ], // windshield top, roof front
			[ - 0.85, 0.94, 0.78, 0.42, 1.00, 1.62 ], // roof rear
			[ - 1.13, 0.94, 0.88, 0.44, 1.00, 1.52 ], // tail glass slope
			[ - 1.55, 0.92, 0.86, 0.74, 0.98, 1.46 ], // rear axle, arch apex
			[ - 1.93, 0.90, 0.84, 0.48, 0.94, 1.38 ],
			[ - 2.03, 0.85, 0.80, 0.52, 0.88, 1.22 ], // tailgate rounds off the roof
			[ - 2.12, 0.70, 0.67, 0.58, 0.80, 1.00 ] // tall tailgate
		],
		nose: 2.12, tail: - 2.12,
		wheelRadius: 0.44, wheelZ: 1.55, wheelX: 0.79, hubRadius: 0.27,
		glassY: 1.12, roofCapY: 1.56, cabin: [ - 1.88, 0.68 ], screens: [ 0.27, - 1.53 ],
		pillars: [[ 0.16, 0.26 ], [ - 0.28, - 0.22 ], [ - 0.92, - 0.85 ], [ - 1.54, - 1.46 ]],
		seams: [ 0.68, - 0.25, - 1.05 ], handles: [ - 0.1, - 0.88 ], handleY: 1.02,
		mirror: [ 1.1, 0.56 ], lampY: 0.78, tailLampY: 0.88, bumperY: 0.54,
		sign: false, rails: true
	}

};

// the taxi is the sedan shell plus a lit roof sign
BODY_SPECS.taxi = Object.assign( {}, BODY_SPECS.sedan, { sign: true } );

function part( geometry, id ) {

	const g = geometry.index ? geometry.toNonIndexed() : geometry;
	g.deleteAttribute( 'uv' ); // the material works in canonical space, so drop uvs for a clean merge
	g.setAttribute( 'partId', new BufferAttribute( new Float32Array( g.attributes.position.count ).fill( id ), 1 ) );
	return g;

}

// one body cross section: a closed 14-point ring traced up the right flank, over a
// greenhouse of half-width `roofHalfW`, then mirrored down the left flank. The bottom
// edge wraps shut as the flat underbody. Sweeping these along Z lofts the whole shell.
function carSection( z, bodyHalfW, roofHalfW, yLow, yBelt, yRoof ) {

	const right = [
		new Vector3( bodyHalfW * 0.70, yLow, z ), // underbody edge
		new Vector3( bodyHalfW * 0.94, yLow + ( yBelt - yLow ) * 0.30, z ), // sill tuck
		new Vector3( bodyHalfW, yLow + ( yBelt - yLow ) * 0.72, z ), // door barrel
		new Vector3( bodyHalfW * 0.985, yBelt, z ), // shoulder crease under the glass
		new Vector3( ( bodyHalfW + roofHalfW ) * 0.5, yBelt + ( yRoof - yBelt ) * 0.20, z ),
		new Vector3( roofHalfW, yBelt + ( yRoof - yBelt ) * 0.62, z ),
		new Vector3( roofHalfW * 0.96, yRoof - ( yRoof - yBelt ) * 0.05, z ),
		new Vector3( roofHalfW * 0.55, yRoof, z )
	];

	const section = right.slice();
	for ( let i = right.length - 1; i >= 0; i -- ) {

		const p = right[ i ];
		section.push( new Vector3( - p.x, p.y, p.z ) );

	}

	// the loft is swept nose-to-tail, so this ring winds clockwise seen from the
	// tail; reverse it to CCW so the computed face normals point outwards
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
		new Vector2( r * 0.5, - w * 0.5 ), // inner opening, hidden in the arch shadow
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

			wheels.push( new LatheGeometry( wheelProfile, 14 ).rotateZ( - side * Math.PI / 2 ).translate( x, r, z ) );

		}

	}

	// slim chrome bumpers wrap each end, a matte grille fills the nose between the
	// lamps, and each lamp pod is sunk into the fascia so only its face shows
	const frontBumper = new BoxGeometry( 1.52, 0.16, 0.18 ).translate( 0, spec.bumperY, spec.nose - 0.06 );
	const rearBumper = new BoxGeometry( 1.52, 0.16, 0.18 ).translate( 0, spec.bumperY, spec.tail + 0.06 );
	const grille = new BoxGeometry( 0.64, 0.16, 0.08 ).translate( 0, spec.lampY - 0.02, spec.nose + 0.01 );

	const headlights = mergeGeometries( [
		new BoxGeometry( 0.34, 0.12, 0.08 ).translate( - 0.48, spec.lampY, spec.nose ),
		new BoxGeometry( 0.34, 0.12, 0.08 ).translate( 0.48, spec.lampY, spec.nose )
	] );

	const taillights = mergeGeometries( [
		new BoxGeometry( 0.36, 0.13, 0.08 ).translate( - 0.46, spec.tailLampY, spec.tail ),
		new BoxGeometry( 0.36, 0.13, 0.08 ).translate( 0.46, spec.tailLampY, spec.tail )
	] );

	// wing mirrors at the base of the A-pillars, angled slightly into the wind
	const mirrorHalfW = spec.stations[ 0 ][ 1 ] < 0.8 ? 0.92 : 0.94;
	const mirrors = mergeGeometries( [
		new BoxGeometry( 0.16, 0.09, 0.06 ).rotateY( - 0.25 ).translate( - ( mirrorHalfW + 0.06 ), spec.mirror[ 0 ], spec.mirror[ 1 ] ),
		new BoxGeometry( 0.16, 0.09, 0.06 ).rotateY( 0.25 ).translate( mirrorHalfW + 0.06, spec.mirror[ 0 ], spec.mirror[ 1 ] )
	] );

	// licence plates centred on the bumper faces
	const plates = mergeGeometries( [
		new BoxGeometry( 0.32, 0.12, 0.02 ).translate( 0, spec.bumperY + 0.02, spec.nose + 0.02 ),
		new BoxGeometry( 0.32, 0.12, 0.02 ).translate( 0, spec.bumperY + 0.02, spec.tail - 0.02 )
	] );

	const darkParts = [ ...wheels, grille ];

	// low roof rails along an SUV's crown
	if ( spec.rails ) {

		darkParts.push(
			new BoxGeometry( 0.05, 0.045, 1.0 ).translate( - 0.55, 1.645, - 0.32 ),
			new BoxGeometry( 0.05, 0.045, 1.0 ).translate( 0.55, 1.645, - 0.32 )
		);

	}

	const parts = [
		part( mergeGeometries( [ body, mirrors ] ), BODY ),
		part( mergeGeometries( darkParts ), WHEEL ),
		part( mergeGeometries( [ frontBumper, rearBumper ] ), TRIM ),
		part( headlights, HEADLIGHT ),
		part( taillights, TAILLIGHT ),
		part( plates, PLATE )
	];

	// the taxi's lit roof sign
	if ( spec.sign ) parts.push( part( new BoxGeometry( 0.36, 0.1, 0.14 ).translate( 0, 1.46, - 0.1 ), SIGN ) );

	return mergeGeometries( parts );

}

function createCarMaterial( paintColor, spec ) {

	// every spec constant enters the shader as a uniform, so all paints and body
	// types share one compiled pipeline: the whole fleet costs a single shader
	// compile instead of one per paint/type pairing

	const paint = uniform( new Color( paintColor ) );
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
	const handleY = uniform( spec.handleY );
	const handleZ = uniform( new Vector2( ...spec.handles ) );
	const seamZ = uniform( new Vector3( ...spec.seams ) );

	// pad to a fixed pillar count so the unrolled loop is identical for all types
	const pillarBands = spec.pillars.slice();
	while ( pillarBands.length < 4 ) pillarBands.push( [ 9, 9.001 ] );
	const pillars = uniformArray( pillarBands.map( ( band ) => new Vector2( ...band ) ) );

	const partId = varying( attribute( 'partId', 'float' ) ).setInterpolation( InterpolationSamplingType.FLAT, InterpolationSamplingMode.EITHER );
	const isBody = partId.equal( BODY );
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
	const paneY = select( onScreens, glassY.sub( 0.09 ), glassY );
	const overBelt = p.y.greaterThan( paneY ).and( p.y.lessThan( roofCapY ) );
	const inCabin = p.z.greaterThan( cabinMin ).and( p.z.lessThan( cabinMax ) );
	let inPillar = null;
	for ( let i = 0; i < 4; i ++ ) {

		const band = pillars.element( i );
		const inBand = p.z.greaterThan( band.x ).and( p.z.lessThan( band.y ) );
		inPillar = inPillar === null ? inBand : inPillar.or( inBand );

	}

	const isGlass = isBody.and( overBelt ).and( inCabin ).and( inPillar.not() );

	// tinted glass as a dark mirror: a rubber reveal frames each pane, the tint
	// deepens toward the belt where the cabin sits behind it, and metal-style
	// reflectance turns the panes into sky mirrors even under a dim environment
	const paneEdge = ( a, b ) => smoothstep( 0.05, 0.016, a ).max( smoothstep( 0.05, 0.016, b ) );
	let reveal = paneEdge( p.y.sub( paneY ), roofCapY.sub( p.y ) ).max( paneEdge( p.z.sub( cabinMin ), cabinMax.sub( p.z ) ) );
	for ( let i = 0; i < 4; i ++ ) {

		const band = pillars.element( i );
		reveal = reveal.max( smoothstep( 0.045, 0.015, p.z.sub( band.x ).abs().min( p.z.sub( band.y ).abs() ) ) );

	}

	const glassT = p.y.sub( paneY ).div( roofCapY.sub( paneY ) ).clamp();
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
		select( isTrim, color( 0xc2c6ca ),
			select( isHeadlight, color( 0xd8d8d2 ),
				select( isTaillight, color( 0x5a0a0a ),
					select( isPlate, color( 0xd8d4c4 ),
						select( isSign, color( 0xf2efe0 ),
							select( isGlass, glassColor, bodyColor ) ) ) ) ) ) );

	material.roughnessNode = select( isWheel, select( isAlloy, mix( float( 0.55 ), float( 0.3 ), alloy ), float( 0.85 ) ),
		select( isTrim, float( 0.25 ),
			select( isPlate.or( isSign ), float( 0.6 ),
				select( isGlass, float( 0.06 ), mix( float( 0.32 ), float( 0.65 ), valance ) ) ) ) );

	material.metalnessNode = select( isGlass, float( 0.85 ),
		select( isTrim, float( 0.9 ),
			select( isWheel.and( isAlloy ), float( 0.8 ),
				select( isBody, smoothstep( 0.5, 0.56, p.y ).mul( 0.2 ), float( 0 ) ) ) ) ); // mirror glass, chrome, alloy, metallic paint above the valance

	// lamp lenses: parked cars run dim marker lights, so they read at dusk
	// without blowing out in daylight ( sunlit white renders near 32 here )
	material.emissiveNode = select( isHeadlight, color( 0xfff2d8 ).mul( 10 ),
		select( isTaillight, color( 0xff2211 ).mul( 4 ),
			select( isSign, color( 0xfff6d8 ).mul( 12 ), color( 0x000000 ) ) ) );

	return material;

}

export { CarGenerator };
