import {
	BoxGeometry,
	CylinderGeometry,
	InterpolationSamplingMode,
	InterpolationSamplingType,
	Group,
	Matrix4,
	SphereGeometry,
	TorusGeometry,
	Vector3
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { array, attribute, color, float, fract, instanceIndex, mix, positionGeometry, select, sin, smoothstep, uniform, varying } from 'three/tsl';

import { mergeGeometries } from '../../utils/BufferGeometryUtils.js';
import { LoftGeometry } from '../../geometries/LoftGeometry.js';
import { createInstances, updateInstances } from './InstancedMeshGenerator.js';
import { part } from './CityGeneratorUtils.js';

/**
 * A low-poly pedestrian crowd with shaped heads, tailored coats and lofted limbs.
 * Sleeves bend at the elbow, legs flex at the knee and shoes meet the ground
 * from heel to toe. Figures share two poses, mid-stride and standing ( the
 * stander carries a bag ). Each placement gets a pose, proportions and clothing
 * deterministically, so a crowd walks out of two instanced draws with no
 * per-instance attributes.
 *
 * The material splits the figure into zones on a baked `partId` and hashes
 * `instanceIndex` per zone, drawing coat, shirt, trousers, skin, hair and shoes
 * from small palettes; canonical-space masks add the collar, the coat's front
 * opening and a shirt V at the chest.
 *
 * The canonical figure stands on `y = 0`, centred in X / Z and ~1.75 m tall,
 * facing `+Z` so a placement turns it to face the road.
 *
 * ```js
 * const people = new PersonGenerator();
 * scene.add( people.build( placements ) ); // placements: Matrix4[]
 * ```
 */
class PersonGenerator {

	constructor( parameters = {} ) {

		this.parameters = Object.assign( {}, PersonGenerator.defaults, parameters );

		this.material = null;
		this.geometries = null;
		this.mesh = null;
		this._parametersKey = null;

	}

	build( placements ) {

		const parametersKey = JSON.stringify( this.parameters );

		if ( parametersKey !== this._parametersKey || ( this.mesh && placements.length > this.mesh.children[ 0 ].instanceMatrix.count ) ) {

			this.dispose();
			this._parametersKey = parametersKey;

		}

		if ( this.material === null ) this.material = createPersonMaterial( this.parameters );
		if ( this.geometries === null ) {

			this.geometries = {
				walk: buildPersonGeometry( this.parameters, 'walk' ),
				stand: buildPersonGeometry( this.parameters, 'stand' )
			};

		}

		// deal each placement a pose and proportions from its index, so the crowd
		// varies but rebuilding the same city deals the same crowd
		const buckets = { walk: [], stand: [] };
		const matrix = new Matrix4();

		for ( let i = 0; i < placements.length; i ++ ) {

			const h1 = ( ( i * 2654435761 ) >>> 0 ) % 1000 / 1000;
			const h2 = ( ( i * 1597334677 ) >>> 0 ) % 1000 / 1000;
			const h3 = ( ( i * 3812015801 ) >>> 0 ) % 1000 / 1000;

			const scale = 0.92 + h2 * 0.15; // ~1.6 m to ~1.9 m
			const width = scale * ( 0.9 + h3 * 0.2 );
			const posed = placements[ i ].clone().multiply( matrix.makeScale( width, scale, width ) );

			buckets[ h1 < 0.65 ? 'walk' : 'stand' ].push( posed );

		}

		if ( this.mesh === null ) {

			this.mesh = new Group();
			this.mesh.name = 'People';
			this.mesh.add(
				createInstances( this.geometries.walk, this.material, placements.length, 'People' ),
				createInstances( this.geometries.stand, this.material, placements.length, 'People' )
			);

		}

		updateInstances( this.mesh.children[ 0 ], buckets.walk );
		updateInstances( this.mesh.children[ 1 ], buckets.stand );

		return this.mesh;

	}

	dispose() {

		if ( this.geometries ) {

			this.geometries.walk.dispose();
			this.geometries.stand.dispose();

		}

		if ( this.mesh ) this.mesh.traverse( ( object ) => object.dispose() );
		if ( this.material ) this.material.dispose();

		this.geometries = null;
		this.material = null;
		this.mesh = null;

	}

}

PersonGenerator.defaults = {
	height: 1.75 // overall standing height
};

// material-zone codes baked per vertex
const SKIN = 0, HEAD = 1, COAT = 2, LEGS = 3, SHOES = 4, BAG = 5;

// small palettes the material indexes per instance
const COAT_COLORS = [ 0x2b3a52, 0x33332f, 0x8a6a44, 0x5a2f2f, 0x4f5238, 0x6a6a66, 0x222024, 0x7d3f22 ];
const SHIRT_COLORS = [ 0xe8e6e0, 0xb8c4d8, 0xcfc8b8, 0x9aa7b8 ];
const LEG_COLORS = [ 0x22242c, 0x3a3f4a, 0x2e2a26, 0x4a4640, 0x1d1d20 ];
const SKIN_COLORS = [ 0xc68863, 0xa96f4c, 0x8a5535, 0x6b3d24, 0xd9a077 ];
const HAIR_COLORS = [ 0x1a1512, 0x3a2a1a, 0x584022, 0x6e6862, 0x2a2624 ];

const _rotation = new Matrix4();
const _rotationZ = new Matrix4();

// offsets a joint from its parent: `v` swung about the parent by rotX / rotZ
function swingJoint( parent, v, rotX, rotZ ) {

	return v.clone()
		.applyMatrix4( _rotation.makeRotationX( rotX ).multiply( _rotationZ.makeRotationZ( rotZ ) ) )
		.add( parent );

}

// horizontal rings are wound for a downward sweep
function ring( center, radiusX, radiusZ = radiusX, segments = 6 ) {

	const points = [];
	for ( let i = 0; i < segments; i ++ ) {

		const a = i / segments * Math.PI * 2;
		points.push( new Vector3( center.x + Math.cos( a ) * radiusX, center.y, center.z + Math.sin( a ) * radiusZ ) );

	}

	return points;

}

function buildPersonGeometry( p, pose ) {

	const walking = pose === 'walk';

	// One surface shapes the crown, brow, nose, jaw and chin. The material adds
	// the hairline without an overlapping shell.
	const headProfile = [
		[ 1.75, 0.014, 0.014, - 0.014 ],
		[ 1.72, 0.079, 0.074, - 0.012 ],
		[ 1.675, 0.09, 0.087, - 0.01 ],
		[ 1.625, 0.085, 0.078, 0.008 ],
		[ 1.595, 0.078, 0.069, 0.012 ],
		[ 1.555, 0.066, 0.064, 0.009 ],
		[ 1.532, 0.041, 0.041, 0.005 ]
	];
	const headSections = headProfile.map( ( [ y, rx, rz, z ] ) => ring( new Vector3( 0, y, z ), rx, rz, 8 ) );
	headSections[ 3 ][ 2 ].z += 0.035;
	const head = new LoftGeometry( headSections, { capStart: true, capEnd: true } );
	const neck = new CylinderGeometry( 0.045, 0.052, 0.1, 5, 1, true ).translate( 0, 1.515, 0 );

	// A broad shoulder line tapers to the waist, then opens out at the hem.
	const coatProfile = [
		[ 1.5, 0.055, 0.055 ],
		[ 1.48, 0.095, 0.062 ],
		[ 1.425, 0.208, 0.107 ],
		[ 1.315, 0.19, 0.117 ],
		[ 1.115, 0.152, 0.1 ],
		[ 0.965, 0.195, 0.14 ],
		[ 0.855, 0.196, 0.155 ]
	];
	const coat = new LoftGeometry( coatProfile.map( ( [ y, rx, rz ] ) => ring( new Vector3( 0, y, 0 ), rx, rz, 8 ) ), { capEnd: true } );

	// arms swing from the shoulders; each sleeve is one loft bending through the
	// elbow, with a small lofted hand chained from the wrist
	const coatParts = [ coat ];
	const skinParts = [ neck ];
	const bagParts = [];

	for ( const side of [ - 1, 1 ] ) {

		skinParts.push( new SphereGeometry( 1, 4, 2 ).scale( 0.016, 0.027, 0.018 ).translate( side * 0.089, 1.62, - 0.005 ) );

		const swing = walking ? - side * 0.35 : ( side < 0 ? - 0.12 : 0.03 );
		const shoulder = new Vector3( side * 0.2, 1.425, 0 );
		const deltoid = swingJoint( shoulder, new Vector3( 0, - 0.075, 0 ), swing, side * 0.09 );
		const elbow = swingJoint( shoulder, new Vector3( 0, - 0.285, 0 ), swing, side * 0.09 );
		const wrist = swingJoint( elbow, new Vector3( 0, - 0.245, 0 ), swing - 0.22, side * 0.04 );

		// the sleeve pinches to a tip tucked inside the coat's shoulder slope,
		// so it emerges like a raglan seam instead of ending in a flat cap
		coatParts.push( new LoftGeometry( [
			ring( new Vector3( side * 0.15, 1.43, 0 ), 0.025, 0.035 ),
			ring( deltoid, 0.067, 0.063 ),
			ring( elbow, 0.052, 0.047 ),
			ring( wrist, 0.037, 0.035 )
		], { capEnd: true } ) );

		const along = wrist.clone().sub( elbow ).normalize();
		const hand = wrist.clone().addScaledVector( along, 0.05 );
		skinParts.push( new LoftGeometry( [
			ring( wrist, 0.024, 0.029 ),
			ring( hand, 0.031, 0.04 ),
			ring( wrist.clone().addScaledVector( along, 0.095 ), 0.021, 0.025 )
		], { capEnd: true } ) );

		if ( ! walking && side > 0 ) {

			bagParts.push(
				new BoxGeometry( 0.075, 0.21, 0.22 ).translate( hand.x, hand.y - 0.195, hand.z ),
				new TorusGeometry( 0.045, 0.006, 3, 4, Math.PI ).rotateY( Math.PI / 2 ).translate( hand.x, hand.y - 0.085, hand.z )
			);

		}

	}

	// legs stride from the hips as single lofts, the knee ring pushed forward
	// where the gait flexes it; shoes loft from heel to toe under each ankle
	const legParts = [];
	const shoeParts = [];

	for ( const side of [ - 1, 1 ] ) {

		// Flat soles and a beveled toe stay readable at a distance. Ground each
		// shoe after pitching it, then place the ankle at its opening.
		const shoe = new LoftGeometry( [
			shoeSection( - 0.075, 0.044, - 0.008 ),
			shoeSection( 0.025, 0.054, 0.016 ),
			shoeSection( 0.17, 0.044, - 0.036 )
		], { capStart: true, capEnd: true } )
			.rotateX( walking ? ( side < 0 ? - 0.12 : 0.25 ) : 0 )
			.rotateY( walking ? side * 0.03 : side * 0.16 );

		shoe.computeBoundingBox();

		const hip = new Vector3( side * 0.095, 0.945, 0 );
		const ankle = new Vector3( side * ( walking ? 0.105 : 0.12 ), - shoe.boundingBox.min.y, walking ? - side * 0.235 : ( side < 0 ? 0.06 : - 0.025 ) );
		const knee = hip.clone().lerp( ankle, 0.51 );
		knee.z += walking ? ( side > 0 ? 0.095 : 0.015 ) : ( side < 0 ? 0.055 : 0.01 );
		const calf = knee.clone().lerp( ankle, 0.42 );

		legParts.push( new LoftGeometry( [
			ring( hip, 0.085, 0.093 ),
			ring( knee, 0.063, 0.064 ),
			ring( calf, 0.064, 0.066 ),
			ring( ankle.clone().add( new Vector3( 0, - 0.018, 0 ) ), 0.045, 0.044 )
		], { capEnd: true } ) );

		shoeParts.push( shoe.translate( ankle.x, ankle.y, ankle.z ) );

	}

	const parts = [
		part( mergeGeometries( skinParts ), SKIN ),
		part( head, HEAD ),
		part( mergeGeometries( coatParts ), COAT ),
		part( mergeGeometries( legParts ), LEGS ),
		part( mergeGeometries( shoeParts ), SHOES )
	];

	if ( bagParts.length > 0 ) parts.push( part( mergeGeometries( bagParts ), BAG ) );

	// The material uses canonical positions; remove UVs before merging the parts.
	for ( const geometry of parts ) geometry.deleteAttribute( 'uv' );

	const geometry = mergeGeometries( parts );

	// scale the canonical 1.75 m figure to the requested height, feet stay on y = 0
	const s = p.height / 1.75;
	if ( s !== 1 ) geometry.scale( s, s, s );

	return geometry;

}

function shoeSection( z, width, top ) {

	return [
		new Vector3( width, top - 0.025, z ),
		new Vector3( width * 0.7, top, z ),
		new Vector3( - width * 0.7, top, z ),
		new Vector3( - width, top - 0.025, z ),
		new Vector3( - width * 0.9, - 0.085, z ),
		new Vector3( width * 0.9, - 0.085, z )
	];

}

function createPersonMaterial( p ) {

	const partId = varying( attribute( 'partId', 'float' ) ).setInterpolation( InterpolationSamplingType.FLAT, InterpolationSamplingMode.EITHER );
	const isSkin = partId.equal( SKIN );
	const isHead = partId.equal( HEAD );
	const isCoat = partId.equal( COAT );
	const isLegs = partId.equal( LEGS );
	const isShoes = partId.equal( SHOES );
	const isBag = partId.equal( BAG );

	// per-instance palette picks, each from its own hash lane so coat, shirt,
	// trousers, skin and hair combine freely across the crowd
	const lane = ( salt ) => fract( sin( float( instanceIndex ).add( salt ).mul( 12.9898 ) ).mul( 43758.5453 ) );
	const pick = ( colors, salt ) => array( colors.map( c => color( c ) ) ).element( lane( salt ).mul( colors.length ).floor().min( colors.length - 1 ) );

	const q = positionGeometry.mul( uniform( 1.75 / p.height ) );

	// The hairline follows the temples and nape, with a different fringe per
	// instance. Facial features share the head's surface and add no geometry.
	const hairline = mix( float( 1.59 ), float( 1.695 ), smoothstep( - 0.025, 0.07, q.z ) ).add( lane( 13.0 ).sub( 0.5 ).mul( 0.018 ) );
	const hair = smoothstep( hairline.sub( 0.003 ), hairline.add( 0.003 ), q.y );
	const face = smoothstep( 0.045, 0.075, q.z );
	const eyes = smoothstep( 0.014, 0.006, q.x.abs().sub( 0.037 ).abs() ).mul( smoothstep( 0.006, 0.002, q.y.sub( 1.656 ).abs() ) ).mul( face );
	const mouth = smoothstep( 0.031, 0.018, q.x.abs() ).mul( smoothstep( 0.004, 0.001, q.y.sub( 1.585 ).abs() ) ).mul( face );
	const skin = pick( SKIN_COLORS, 17.0 );
	const head = mix( skin.mul( eyes.mul( 0.65 ).add( mouth.mul( 0.25 ) ).oneMinus() ), pick( HAIR_COLORS, 3.0 ), hair );

	// tailoring, drawn in the canonical figure's space: a darker collar band, the
	// coat falling open down the front, and a shirt V at the chest
	const collar = smoothstep( 1.43, 1.45, q.y ).mul( smoothstep( 1.52, 1.5, q.y ) );
	const placket = smoothstep( 0.02, 0.008, q.x.abs() ).mul( smoothstep( 0.02, 0.06, q.z ) ).mul( smoothstep( 1.37, 1.33, q.y ) ).mul( smoothstep( 0.8, 0.86, q.y ) );
	const shirtV = smoothstep( 0.05, 0.06, q.z ).mul( smoothstep( 1.32, 1.36, q.y ) ).mul( smoothstep( 1.49, 1.46, q.y ) ).mul( smoothstep( 0.006, 0.0, q.x.abs().sub( q.y.sub( 1.32 ).mul( 0.42 ) ) ) );

	const coatBase = pick( COAT_COLORS, 29.0 );
	const coatTailored = mix( coatBase.mul( collar.mul( 0.25 ).add( placket.mul( 0.5 ) ).oneMinus().clamp( 0.4, 1 ) ), pick( SHIRT_COLORS, 71.0 ), shirtV );

	// shoes split between black and brown leather
	const shoes = mix( color( 0x1c1a18 ), color( 0x4a3524 ), lane( 5.0 ).step( 0.45 ) );

	const material = new MeshStandardNodeMaterial();

	material.colorNode = select( isSkin, skin,
		select( isHead, head,
			select( isCoat, coatTailored,
				select( isLegs, pick( LEG_COLORS, 47.0 ),
					select( isShoes, shoes,
						select( isBag, color( 0x3a2c20 ), color( 0xffffff ) ) ) ) ) ) );

	material.roughnessNode = select( isSkin, float( 0.55 ),
		select( isHead, mix( float( 0.55 ), float( 0.85 ), hair ),
			select( isShoes.or( isBag ), float( 0.5 ), float( 0.85 ) ) ) ); // leather sheen under matte cloth

	material.metalness = 0;

	return material;

}

export { PersonGenerator };
