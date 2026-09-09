import {
	BoxGeometry,
	CylinderGeometry,
	Float32BufferAttribute,
	InstancedBufferAttribute,
	InterpolationSamplingMode,
	InterpolationSamplingType,
	Group,
	Matrix4,
	Quaternion,
	SphereGeometry,
	TorusGeometry,
	Vector3
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { array, attribute, color, cos, float, fract, mix, normalGeometry, positionGeometry, select, sin, smoothstep, uniform, uv, varying, vec3 } from 'three/tsl';

import { mergeGeometries, mergeVertices } from '../../utils/BufferGeometryUtils.js';
import { LoftGeometry } from '../../geometries/LoftGeometry.js';
import { createInstances, updateInstances } from './InstancedMeshGenerator.js';
import { part } from './CityGeneratorUtils.js';

/**
 * A low-poly pedestrian crowd with shaped heads, jackets and lofted limbs.
 * Two shared poses stand or walk, with sleeves and trousers swept through
 * their joints. Each placement gets deterministic proportions and a small
 * seed attribute for its complexion, hairstyle and outfit, in two instanced draws.
 *
 * The material splits the figure into zones on a baked `partId` and hashes
 * the seed per zone, drawing clothes, skin and hair from small palettes.
 * Local UVs keep facial features, cuffs and shoe soles attached to their parts
 * as the figure is posed.
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
		const buckets = { walk: { matrices: [], seeds: [] }, stand: { matrices: [], seeds: [] } };
		const matrix = new Matrix4();

		for ( let i = 0; i < placements.length; i ++ ) {

			const h1 = ( ( i * 2654435761 ) >>> 0 ) % 1000 / 1000;
			const h2 = ( ( i * 1597334677 ) >>> 0 ) % 1000 / 1000;
			const h3 = ( ( i * 3812015801 ) >>> 0 ) % 1000 / 1000;

			const scale = 0.92 + h2 * 0.15; // ~1.6 m to ~1.9 m
			const width = scale * ( 0.9 + h3 * 0.2 );
			const posed = placements[ i ].clone().multiply( matrix.makeScale( width, scale, width ) );

			const bucket = buckets[ h1 < 0.65 ? 'walk' : 'stand' ];
			bucket.matrices.push( posed );
			bucket.seeds.push( i );

		}

		if ( this.mesh === null ) {

			this.mesh = new Group();
			this.mesh.name = 'People';
			this.mesh.add(
				createInstances( this.geometries.walk, this.material, placements.length, 'People' ),
				createInstances( this.geometries.stand, this.material, placements.length, 'People' )
			);
			for ( const mesh of this.mesh.children ) {

				mesh.geometry.setAttribute( 'personSeed', new InstancedBufferAttribute( new Float32Array( mesh.instanceMatrix.count ), 1 ) );

			}

		}

		for ( const [ index, pose ] of [ 'walk', 'stand' ].entries() ) {

			const mesh = this.mesh.children[ index ];
			const seed = mesh.geometry.attributes.personSeed;
			seed.array.set( buckets[ pose ].seeds );
			seed.needsUpdate = true;
			updateInstances( mesh, buckets[ pose ].matrices );

		}

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
const SKIN = 0, HEAD = 1, COAT = 2, LEGS = 3, SHOES = 4, BAG = 5, SLEEVE = 6, HANDLE = 7;

// small palettes the material indexes per instance
const COAT_COLORS = [ 0x2b3a52, 0x33332f, 0x8a6a44, 0x5a2f2f, 0x4f5238, 0x6a6a66, 0x222024, 0x7d3f22 ];
const SHIRT_COLORS = [ 0xe8e6e0, 0xb8c4d8, 0xcfc8b8, 0x9aa7b8 ];
const LEG_COLORS = [ 0x22242c, 0x35485b, 0x51473d, 0x7c7160, 0x252526 ];
const SKIN_COLORS = [ 0xc68863, 0xa96f4c, 0x8a5535, 0x6b3d24, 0xd9a077 ];
const HAIR_COLORS = [ 0x1a1512, 0x3a2a1a, 0x584022, 0x6e6862, 0x2a2624 ];

const _down = /*@__PURE__*/ new Vector3( 0, - 1, 0 );

function joint( parent, length, swing, splay ) {

	const vertical = length * Math.cos( splay );
	return new Vector3( parent.x + length * Math.sin( splay ), parent.y - vertical * Math.cos( swing ), parent.z - vertical * Math.sin( swing ) );

}

function ring( center, rx, rz, segments = 6, phase = 0 ) {

	return Array.from( { length: segments }, ( _, i ) => {

		const a = i / segments * Math.PI * 2 + phase;
		return new Vector3( center.x + Math.cos( a ) * rx, center.y, center.z + Math.sin( a ) * rz );

	} );

}

// Rings turn with the limb, keeping the elbow and knee sections round as the
// pose bends. The radii describe the clothing or anatomy at each joint.
function limbSections( joints, segments = 6, phase = 0 ) {

	const rotation = new Quaternion();
	return joints.map( ( [ center, rx, rz ], i ) => {

		const before = joints[ Math.max( 0, i - 1 ) ][ 0 ];
		const after = joints[ Math.min( joints.length - 1, i + 1 ) ][ 0 ];
		rotation.setFromUnitVectors( _down, after.clone().sub( before ).normalize() );
		return ring( new Vector3(), rx, rz, segments, phase ).map( p => p.applyQuaternion( rotation ).add( center ) );

	} );

}

function limb( joints, capEnd = true, segments = 6 ) {

	return new LoftGeometry( limbSections( joints, segments ), { capEnd } );

}

// The chest has broad front and back planes with rounded sides.
function torsoSection( y, width, depth ) {

	return [
		new Vector3( width, y, depth * 0.45 ),
		new Vector3( width * 0.65, y, depth ),
		new Vector3( - width * 0.65, y, depth ),
		new Vector3( - width, y, depth * 0.45 ),
		new Vector3( - width, y, - depth * 0.45 ),
		new Vector3( - width * 0.65, y, - depth ),
		new Vector3( width * 0.65, y, - depth ),
		new Vector3( width, y, - depth * 0.45 )
	];

}

function hipSection( side ) {

	const profile = [[ 1, 0.5 ], [ - 0.1, 1 ], [ - 0.8, 0.7 ], [ - 1, 0 ], [ - 0.8, - 0.7 ], [ - 0.1, - 1 ], [ 1, - 0.5 ]];
	const points = profile.map( ( [ x, z ], i ) => new Vector3( side * 0.093 - side * x * 0.093, i === 0 || i === 6 ? 0.82 : 0.89, z * 0.1 ) );
	return side > 0 ? points.reverse() : points;

}

function buildPersonGeometry( p, pose ) {

	const walking = pose === 'walk';
	const parts = [];
	const add = ( geometry, id ) => parts.push( part( geometry, id ) );

	const headProfile = [
		[ 1.75, 0.014, 0.014, - 0.012 ],
		[ 1.708, 0.081, 0.081, - 0.01 ],
		[ 1.656, 0.093, 0.086, 0 ],
		[ 1.617, 0.086, 0.077, 0.009 ],
		[ 1.561, 0.072, 0.065, 0.012 ],
		[ 1.532, 0.045, 0.043, 0.005 ]
	];
	const headSections = headProfile.map( ( [ y, rx, rz, z ] ) => ring( new Vector3( 0, y, z ), rx, rz, 10, Math.PI / 2 ) );
	headSections[ 3 ][ 0 ].z += 0.022;
	const head = new LoftGeometry( headSections, { capStart: true, capEnd: true } );

	// Store the unposed height alongside the loft's angular UV. Face and hair
	// masks can then follow the head as it turns and tilts.
	for ( let i = 0; i < head.attributes.position.count; i ++ ) head.attributes.uv.setX( i, head.attributes.position.getY( i ) );

	const heads = [ head ];
	for ( const side of [ - 1, 1 ] ) heads.push( new SphereGeometry( 1, 4, 2 ).scale( 0.016, 0.026, 0.018 ).translate( side * 0.092, 1.62, - 0.004 ) );
	for ( const geometry of heads ) geometry.translate( 0, - 1.535, 0 ).rotateY( walking ? 0.14 : - 0.16 ).rotateZ( walking ? - 0.02 : 0.055 ).translate( 0, 1.535, 0 );

	head.computeBoundingBox();
	const headOffset = 1.75 - head.boundingBox.max.y;
	for ( const [ index, geometry ] of heads.entries() ) add( geometry.translate( 0, headOffset, 0 ), index === 0 ? HEAD : SKIN );
	add( new CylinderGeometry( 0.045, 0.052, 0.10, 5, 1, true ).translate( 0, 1.515, 0 ), SKIN );

	const jacket = [
		[ 1.5, 0.055, 0.052 ],
		[ 1.425, 0.20, 0.10 ],
		[ 1.365, 0.195, 0.111 ],
		[ 1.285, 0.18, 0.115 ],
		[ 1.095, 0.152, 0.103 ],
		[ 1.015, 0.166, 0.108 ]
	];
	add( new LoftGeometry( jacket.map( section => torsoSection( ...section ) ), { capEnd: true } ), COAT );
	const trousers = [];
	const hips = [];

	for ( const side of [ - 1, 1 ] ) {

		const swing = walking ? - side * 0.35 : ( side < 0 ? - 0.12 : 0.06 );
		const shoulder = new Vector3( side * 0.197, 1.425, 0.008 );
		const upperArm = joint( shoulder, 0.075, swing, side * 0.08 );
		const elbow = joint( shoulder, 0.285, swing, side * 0.08 );
		const wrist = joint( elbow, 0.255, swing - 0.22, side * 0.03 );
		add( limb( [
			[ new Vector3( side * 0.14, 1.415, 0 ), 0.024, 0.035 ],
			[ upperArm, 0.066, 0.063 ],
			[ elbow, 0.051, 0.048 ],
			[ wrist, 0.029, 0.033 ]
		], false, 5 ), SLEEVE );

		const along = wrist.clone().sub( elbow ).normalize();
		const hand = wrist.clone().addScaledVector( along, 0.05 );
		add( limb( [
			[ wrist, 0.029, 0.033 ],
			[ hand, 0.032, 0.039 ],
			[ wrist.clone().addScaledVector( along, 0.095 ), 0.019, 0.025 ]
		], true, 5 ), SKIN );

		if ( ! walking && side > 0 ) {

			add( new BoxGeometry( 0.075, 0.21, 0.22 ).translate( hand.x, hand.y - 0.19, hand.z ), BAG );
			add( new TorusGeometry( 0.045, 0.006, 3, 4, Math.PI ).rotateY( Math.PI / 2 ).translate( hand.x, hand.y - 0.08, hand.z ), HANDLE );

		}

		const shoe = new LoftGeometry( [
			shoeSection( - 0.075, 0.044, - 0.008 ),
			shoeSection( 0.015, 0.054, 0.016 ),
			shoeSection( 0.125, 0.055, - 0.025 ),
			shoeSection( 0.18, 0.036, - 0.045 )
		], { capStart: true, capEnd: true } );

		// Shoe UVs retain local height and length, keeping soles and laces aligned
		// with the foot after its heel or toe is planted on the ground.
		for ( let i = 0; i < shoe.attributes.position.count; i ++ ) {

			shoe.attributes.uv.setXY( i, shoe.attributes.position.getY( i ), shoe.attributes.position.getZ( i ) );

		}

		shoe.rotateX( walking ? ( side < 0 ? - 0.12 : 0.25 ) : 0 ).rotateY( walking ? side * 0.03 : side * 0.16 );
		shoe.computeBoundingBox();

		const hip = new Vector3( side * 0.093, 0.89, 0 );
		const ankle = new Vector3( side * ( walking ? 0.105 : 0.12 ), - shoe.boundingBox.min.y, walking ? - side * 0.235 : ( side < 0 ? 0.065 : - 0.025 ) );
		const knee = hip.clone().lerp( ankle, 0.53 );
		knee.z += walking ? ( side > 0 ? 0.095 : 0.015 ) : ( side < 0 ? 0.06 : 0.01 );
		const calf = knee.clone().lerp( ankle, 0.40 );
		const legSections = limbSections( [
			[ hip, 0.087, 0.092 ],
			[ knee, 0.062, 0.067 ],
			[ calf, 0.066, 0.067 ],
			[ ankle.clone().add( new Vector3( 0, - 0.018, 0 ) ), 0.045, 0.046 ]
		], 7, Math.PI / 7 + ( side > 0 ? Math.PI : 0 ) );

		// The two upper leg loops share their inner edge at the crotch. Their
		// outer edges together form one loop leading up to the waist.
		legSections[ 0 ] = hipSection( side );
		hips.push( legSections[ 0 ] );
		trousers.push( new LoftGeometry( legSections, { capEnd: true } ) );
		add( shoe.translate( ankle.x, ankle.y, ankle.z ), SHOES );

	}

	const crotch = [ ...hips[ 0 ], ...hips[ 1 ].slice( 1, 6 ) ];
	trousers.push( new LoftGeometry( [ ring( new Vector3( 0, 1.04, 0 ), 0.157, 0.1, 12, Math.PI / 2 ), crotch ] ) );
	const pants = mergeGeometries( trousers );
	pants.deleteAttribute( 'normal' );
	pants.deleteAttribute( 'uv' );
	const joinedPants = mergeVertices( pants );
	joinedPants.computeVertexNormals();
	joinedPants.setAttribute( 'uv', new Float32BufferAttribute( new Float32Array( joinedPants.attributes.position.count * 2 ), 2 ) );
	add( joinedPants, LEGS );

	const geometry = mergeGeometries( parts );
	const scale = p.height / 1.75;
	if ( scale !== 1 ) geometry.scale( scale, scale, scale );
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
	const isSleeve = partId.equal( SLEEVE );
	const isLegs = partId.equal( LEGS );
	const isShoes = partId.equal( SHOES );
	const isBag = partId.equal( BAG );
	const isHandle = partId.equal( HANDLE );

	// Use the original placement index, so splitting poses into batches does
	// not give their first members identical outfits and complexions.
	const seed = attribute( 'personSeed', 'float' );
	const lane = ( salt ) => fract( sin( seed.add( salt ).mul( 12.9898 ) ).mul( 43758.5453 ) );
	const pick = ( colors, salt ) => array( colors.map( c => color( c ) ) ).element( lane( salt ).mul( colors.length ).floor().min( colors.length - 1 ) );
	const q = positionGeometry.mul( uniform( 1.75 / p.height ) );
	const texcoord = uv();

	const angle = texcoord.y.mul( Math.PI * 2 );
	const face = vec3( sin( angle ).mul( 0.09 ), texcoord.x, cos( angle ).mul( 0.09 ) );
	const style = lane( 13.0 );
	const hairline = mix( mix( float( 1.55 ), float( 1.61 ), style ), mix( float( 1.67 ), float( 1.71 ), style ), smoothstep( - 0.025, 0.07, face.z ) ).add( face.x.mul( style.sub( 0.5 ) ).mul( 0.35 ) );
	const hair = smoothstep( hairline.sub( 0.003 ), hairline.add( 0.003 ), face.y );
	const forward = smoothstep( 0.045, 0.075, face.z );
	const eyeWidth = smoothstep( 0.013, 0.006, face.x.abs().sub( 0.036 ).abs() );
	const eyes = eyeWidth.mul( smoothstep( 0.005, 0.0015, face.y.sub( 1.651 ).abs() ) ).mul( forward );
	const brows = eyeWidth.mul( smoothstep( 0.0035, 0.001, face.y.sub( 1.665 ).abs() ) ).mul( forward );
	const mouth = smoothstep( 0.030, 0.016, face.x.abs() ).mul( smoothstep( 0.004, 0.001, face.y.sub( 1.58 ).abs() ) ).mul( forward );
	const skin = pick( SKIN_COLORS, 17.0 );
	const head = mix( skin.mul( eyes.mul( 0.65 ).add( brows.mul( 0.35 ) ).add( mouth.mul( 0.25 ) ).oneMinus() ), pick( HAIR_COLORS, 3.0 ), hair );

	const jacket = lane( 89.0 ).greaterThan( 0.42 );
	const coat = pick( COAT_COLORS, 29.0 );
	const shirt = pick( SHIRT_COLORS, 71.0 );
	const front = smoothstep( 0.03, 0.07, q.z );
	const opening = q.y.sub( 1.33 ).mul( 0.42 );
	const shirtV = smoothstep( 1.33, 1.35, q.y ).mul( smoothstep( 1.5, 1.48, q.y ) ).mul( smoothstep( 0.004, 0, q.x.abs().sub( opening ) ) ).mul( front );
	const lapel = smoothstep( 0.025, 0.009, q.x.abs().sub( opening ).abs() ).mul( shirtV.oneMinus() ).mul( smoothstep( 1.32, 1.37, q.y ) ).mul( front );
	const zipper = smoothstep( 0.008, 0.003, q.x.abs() ).mul( front );
	const hem = smoothstep( 1.065, 1.035, q.y );
	const collar = smoothstep( 1.455, 1.48, q.y );
	const tailored = mix( coat.mul( lapel.mul( 0.25 ).add( zipper.mul( 0.35 ) ).oneMinus() ), shirt, shirtV );
	const casual = coat.mul( hem.max( collar ).mul( 0.18 ).add( zipper.mul( 0.3 ) ).oneMinus() );
	const cuff = smoothstep( 0.94, 0.985, texcoord.x );
	const sleeve = mix( coat, select( jacket, shirt, coat.mul( 0.75 ) ), cuff );

	const sneaker = lane( 5.0 ).greaterThan( 0.4 );
	const leather = mix( color( 0x201e1c ), color( 0x4a3524 ), lane( 23.0 ) );
	const upper = select( sneaker, mix( color( 0x252b32 ), color( 0xc8c3b8 ), lane( 31.0 ).step( 0.55 ) ), leather );
	const sole = smoothstep( - 0.064, - 0.074, texcoord.x );
	const laceCoord = texcoord.y.mul( 110 );
	const laces = smoothstep( 0.68, 0.78, laceCoord.fract() ).mul( laceCoord.fwidth().oneMinus().clamp() ).mul( smoothstep( - 0.015, 0.005, texcoord.x ) ).mul( smoothstep( - 0.01, 0.015, texcoord.y ) );
	const shoe = mix( mix( upper, select( sneaker, color( 0xd5d1c8 ), color( 0x191816 ) ), sole ), color( 0xaba89f ), laces.mul( 0.45 ) );

	const bagEdge = texcoord.min( texcoord.oneMinus() );
	const seam = smoothstep( 0.045, 0.02, bagEdge.x.min( bagEdge.y ) );
	const flap = smoothstep( 0.02, 0.008, texcoord.y.sub( 0.72 ).abs() );
	const buckle = smoothstep( 0.06, 0.045, texcoord.x.sub( 0.5 ).abs() ).mul( smoothstep( 0.07, 0.05, texcoord.y.sub( 0.72 ).abs() ) ).mul( select( normalGeometry.x.abs().greaterThan( 0.8 ), 1, 0 ) );
	const bag = mix( color( 0x49372a ).mul( seam.max( flap ).mul( 0.35 ).oneMinus() ), color( 0x8f8878 ), buckle );

	const material = new MeshStandardNodeMaterial();
	material.colorNode = select( isSkin, skin,
		select( isHead, head,
			select( isCoat, select( jacket, tailored, casual ),
				select( isSleeve, sleeve,
					select( isLegs, pick( LEG_COLORS, 47.0 ),
						select( isShoes, shoe,
							select( isBag, bag, color( 0x30261f ) ) ) ) ) ) ) );
	material.roughnessNode = select( isSkin, float( 0.6 ),
		select( isHead, mix( float( 0.6 ), float( 0.85 ), hair ),
			select( isBag.or( isHandle ), float( 0.55 ), float( 0.85 ) ) ) );
	material.metalness = 0;
	return material;

}

export { PersonGenerator };
