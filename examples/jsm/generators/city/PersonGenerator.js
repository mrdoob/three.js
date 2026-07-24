import {
	BoxGeometry,
	BufferAttribute,
	CylinderGeometry,
	InstancedMesh,
	InterpolationSamplingMode,
	InterpolationSamplingType,
	Group,
	LatheGeometry,
	Matrix4,
	SphereGeometry,
	Vector2,
	Vector3
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { array, attribute, color, float, fract, instanceIndex, mix, positionGeometry, select, sin, smoothstep, varying } from 'three/tsl';

import { mergeGeometries } from '../../utils/BufferGeometryUtils.js';
import { LoftGeometry } from '../../geometries/LoftGeometry.js';

/**
 * A low-poly pedestrian crowd: each figure is a lathed coat with lofted limbs,
 * a skin head and hands under a cap of hair. Every limb is a single loft swept
 * through its joints, so sleeves bend at the elbow, legs flex at the knee and
 * shoes round off from heel to toe without any joint seams. Figures come in two
 * shared poses, mid-stride and standing ( the stander carries a bag ), and every
 * placement is assigned a pose, a height and its clothing deterministically, so
 * a crowd walks out of two instanced draws with no per-instance attributes.
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

	}

	build( placements ) {

		this.dispose();

		if ( this.material === null ) this.material = createPersonMaterial();
		if ( this.geometries === null ) {

			this.geometries = {
				walk: buildPersonGeometry( this.parameters, 'walk' ),
				stand: buildPersonGeometry( this.parameters, 'stand' )
			};

		}

		// deal each placement a pose and a height from its index, so the crowd
		// varies but rebuilding the same city deals the same crowd
		const buckets = { walk: [], stand: [] };
		const matrix = new Matrix4();

		for ( let i = 0; i < placements.length; i ++ ) {

			const h1 = ( ( i * 2654435761 ) >>> 0 ) % 1000 / 1000;
			const h2 = ( ( i * 1597334677 ) >>> 0 ) % 1000 / 1000;

			const scale = 0.92 + h2 * 0.15; // ~1.6 m to ~1.9 m
			const posed = placements[ i ].clone().multiply( matrix.makeScale( scale, scale, scale ) );

			buckets[ h1 < 0.65 ? 'walk' : 'stand' ].push( posed );

		}

		const group = new Group();
		group.name = 'People';

		for ( const pose of [ 'walk', 'stand' ] ) {

			const matrices = buckets[ pose ];
			if ( matrices.length === 0 ) continue;

			const mesh = new InstancedMesh( this.geometries[ pose ], this.material, matrices.length );
			for ( let i = 0; i < matrices.length; i ++ ) mesh.setMatrixAt( i, matrices[ i ] );
			mesh.castShadow = mesh.receiveShadow = true;
			mesh.name = 'People';
			group.add( mesh );

		}

		this.mesh = group;

		return group;

	}

	dispose() {

		if ( this.geometries ) {

			this.geometries.walk.dispose();
			this.geometries.stand.dispose();

		}

		this.geometries = null;
		this.mesh = null;

	}

}

PersonGenerator.defaults = {
	height: 1.75 // overall standing height
};

// material-zone codes baked per vertex
const SKIN = 0, HAIR = 1, COAT = 2, LEGS = 3, SHOES = 4, BAG = 5;

// small palettes the material indexes per instance
const COAT_COLORS = [ 0x2b3a52, 0x33332f, 0x8a6a44, 0x5a2f2f, 0x4f5238, 0x6a6a66, 0x222024, 0x7d3f22 ];
const SHIRT_COLORS = [ 0xe8e6e0, 0xb8c4d8, 0xcfc8b8, 0x9aa7b8 ];
const LEG_COLORS = [ 0x22242c, 0x3a3f4a, 0x2e2a26, 0x4a4640, 0x1d1d20 ];
const SKIN_COLORS = [ 0xc68863, 0xa96f4c, 0x8a5535, 0x6b3d24, 0xd9a077 ];
const HAIR_COLORS = [ 0x1a1512, 0x3a2a1a, 0x584022, 0x6e6862, 0x2a2624 ];

// tag a geometry with a flat partId and normalize to non-indexed for merging
function part( geometry, id ) {

	const g = geometry.index ? geometry.toNonIndexed() : geometry;
	g.deleteAttribute( 'uv' ); // the material works in canonical space, so drop uvs for a clean merge
	g.setAttribute( 'partId', new BufferAttribute( new Float32Array( g.attributes.position.count ).fill( id ), 1 ) );
	return g;

}

const _rotation = new Matrix4();
const _rotationZ = new Matrix4();

// offsets a joint from its parent: `v` swung about the parent by rotX / rotZ
function swingJoint( parent, v, rotX, rotZ ) {

	return v.clone()
		.applyMatrix4( _rotation.makeRotationX( rotX ).multiply( _rotationZ.makeRotationZ( rotZ ) ) )
		.add( parent );

}

// a horizontal 6-point ring for limb lofts, wound for a downward sweep
function ring( center, radius ) {

	const points = [];
	for ( let i = 0; i < 6; i ++ ) {

		const a = i / 6 * Math.PI * 2;
		points.push( new Vector3( center.x + Math.cos( a ) * radius, center.y, center.z + Math.sin( a ) * radius ) );

	}

	return points;

}

function buildPersonGeometry( p, pose ) {

	const walking = pose === 'walk';

	// rounded head and a short open-ended neck rising from the collar
	const head = new SphereGeometry( 0.105, 8, 5 ).translate( 0, 1.62, 0 );
	const neck = new CylinderGeometry( 0.05, 0.055, 0.09, 5, 1, true ).translate( 0, 1.51, 0 );

	// a cap of hair hugging the top and back of the skull, leaving the face open
	const hair = new SphereGeometry( 0.115, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.55 )
		.rotateX( - 0.42 )
		.translate( 0, 1.615, - 0.012 );

	// the coat, lathed as one organic profile: hem, hip, waist, chest, shoulder,
	// collar. flattened front-to-back so the torso is not a tube
	const coatProfile = [
		new Vector2( 0.17, 0.82 ),
		new Vector2( 0.185, 0.9 ),
		new Vector2( 0.16, 1.06 ),
		new Vector2( 0.175, 1.24 ),
		new Vector2( 0.19, 1.38 ),
		new Vector2( 0.165, 1.445 ),
		new Vector2( 0.085, 1.5 ),
		new Vector2( 0.02, 1.52 )
	];
	const coat = new LatheGeometry( coatProfile, 8 ).scale( 1, 1, 0.74 );

	// arms swing from the shoulders; each sleeve is one loft bending through the
	// elbow, with a small lofted hand chained from the wrist
	const armSwing = walking ? 0.32 : 0.05;
	const coatParts = [ coat ];
	const skinParts = [ head ];

	for ( const side of [ - 1, 1 ] ) {

		const swing = walking ? - side * armSwing : armSwing; // walkers counter-swing opposite their stride, standers hang
		const shoulder = new Vector3( side * 0.19, 1.42, 0 );
		const deltoid = swingJoint( shoulder, new Vector3( 0, - 0.07, 0 ), swing, side * 0.05 );
		const elbow = swingJoint( shoulder, new Vector3( 0, - 0.3, 0 ), swing, side * 0.05 );
		const wrist = swingJoint( elbow, new Vector3( 0, - 0.26, 0 ), swing - 0.25, side * 0.03 );

		// the sleeve pinches to a tip tucked inside the coat's shoulder slope,
		// so it emerges like a raglan seam instead of ending in a flat cap
		coatParts.push( new LoftGeometry( [
			ring( new Vector3( side * 0.165, 1.455, 0 ), 0.018 ),
			ring( deltoid, 0.056 ),
			ring( elbow, 0.047 ),
			ring( wrist, 0.038 )
		], { capStart: true, capEnd: true } ) );

		const along = wrist.clone().sub( elbow ).normalize();
		skinParts.push( new LoftGeometry( [
			ring( wrist, 0.03 ),
			ring( wrist.clone().addScaledVector( along, 0.055 ), 0.041 ),
			ring( wrist.clone().addScaledVector( along, 0.1 ), 0.018 )
		], { capStart: true, capEnd: true } ) );

	}

	// legs stride from the hips as single lofts, the knee ring pushed forward
	// where the gait flexes it; shoes loft from heel to toe under each ankle
	const legSwing = walking ? 0.21 : 0;
	const legParts = [];
	const shoeParts = [];

	for ( const side of [ - 1, 1 ] ) {

		const swing = side * legSwing;
		const hip = new Vector3( side * 0.1, 0.92, 0 );
		const ankle = swingJoint( hip, new Vector3( 0, - 0.84, 0 ), swing, 0 );

		// the trailing, pushing leg flexes most; a straight stack still gets a
		// hint of knee so the silhouette never reads as a rigid post
		const kneeBend = walking ? ( swing > 0 ? 0.06 : 0.02 ) : 0.015;
		const knee = hip.clone().lerp( ankle, 0.52 ).add( new Vector3( 0, 0, kneeBend ) );

		legParts.push( new LoftGeometry( [
			ring( hip, 0.08 ),
			ring( knee, 0.063 ),
			ring( ankle, 0.048 )
		], { capStart: true, capEnd: true } ) );

		// foot rings run heel to toe in the shoe's own frame, then take the
		// stride pitch, so the front foot lands on its heel and the back one
		// pushes off its toe
		const footRing = ( y, z, rx, ry ) => {

			const points = [];
			for ( let i = 0; i < 6; i ++ ) {

				const a = i / 6 * Math.PI * 2;
				points.push( new Vector3( Math.cos( a ) * rx, y + Math.sin( a ) * ry, z ) );

			}

			return points;

		};

		const shoe = new LoftGeometry( [
			footRing( - 0.037, - 0.06, 0.045, 0.042 ),
			footRing( - 0.039, 0.06, 0.05, 0.04 ),
			footRing( - 0.049, 0.15, 0.036, 0.026 )
		], { capStart: true, capEnd: true } )
			.rotateY( walking ? 0 : side * 0.12 ) // standers rest toe-out
			.rotateX( swing )
			.translate( ankle.x, ankle.y, ankle.z );

		shoeParts.push( shoe );

	}

	const parts = [
		part( mergeGeometries( skinParts ), SKIN ),
		part( neck, SKIN ),
		part( hair, HAIR ),
		part( mergeGeometries( coatParts ), COAT ),
		part( mergeGeometries( legParts ), LEGS ),
		part( mergeGeometries( shoeParts ), SHOES )
	];

	// the stander carries a bag at their right hand
	if ( ! walking ) parts.push( part( new BoxGeometry( 0.07, 0.2, 0.16 ).translate( 0.27, 0.72, 0.05 ), BAG ) );

	const geometry = mergeGeometries( parts );

	// scale the canonical 1.75 m figure to the requested height, feet stay on y = 0
	const s = p.height / 1.75;
	if ( s !== 1 ) geometry.scale( s, s, s );

	return geometry;

}

function createPersonMaterial() {

	const partId = varying( attribute( 'partId', 'float' ) ).setInterpolation( InterpolationSamplingType.FLAT, InterpolationSamplingMode.EITHER );
	const isSkin = partId.equal( SKIN );
	const isHair = partId.equal( HAIR );
	const isCoat = partId.equal( COAT );
	const isLegs = partId.equal( LEGS );
	const isShoes = partId.equal( SHOES );
	const isBag = partId.equal( BAG );

	// per-instance palette picks, each from its own hash lane so coat, shirt,
	// trousers, skin and hair combine freely across the crowd
	const lane = ( salt ) => fract( sin( float( instanceIndex ).add( salt ).mul( 12.9898 ) ).mul( 43758.5453 ) );
	const pick = ( colors, salt ) => array( colors.map( c => color( c ) ) ).element( lane( salt ).mul( colors.length ).floor().min( colors.length - 1 ) );

	const q = positionGeometry;

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

	material.colorNode = select( isSkin, pick( SKIN_COLORS, 17.0 ),
		select( isHair, pick( HAIR_COLORS, 3.0 ),
			select( isCoat, coatTailored,
				select( isLegs, pick( LEG_COLORS, 47.0 ),
					select( isShoes, shoes,
						select( isBag, color( 0x3a2c20 ), color( 0xffffff ) ) ) ) ) ) );

	material.roughnessNode = select( isSkin, float( 0.55 ),
		select( isHair, float( 0.65 ),
			select( isShoes.or( isBag ), float( 0.5 ), float( 0.85 ) ) ) ); // leather sheen under matte cloth

	material.metalness = 0;

	return material;

}

export { PersonGenerator };
