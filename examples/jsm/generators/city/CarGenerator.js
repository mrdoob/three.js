import {
	BoxGeometry,
	BufferAttribute,
	CircleGeometry,
	CylinderGeometry,
	Group,
	InstancedMesh,
	InterpolationSamplingMode,
	InterpolationSamplingType,
	Vector3
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { attribute, color, float, select, varying } from 'three/tsl';

import { mergeGeometries } from '../../utils/BufferGeometryUtils.js';
import { LoftGeometry } from '../../geometries/LoftGeometry.js';

/**
 * A smooth low-poly car: a single body shell lofted through a row of cross sections
 * that swell from the bumpers, rise into a tapered greenhouse over the cabin and
 * tuck back down over the trunk, dressed with four fat tyres, dark glazing and lit
 * head / tail lamps. The shell is built once and shared, but cars are grouped by
 * paint colour so each colour gets its own cheap material ( body paint swapped,
 * everything else fixed ) branching on a baked `partId`.
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

		this.geometry = null;
		this.mesh = null;
		this.materials = new Map(); // one material per paint colour

	}

	build( cars ) {

		this.dispose();

		if ( this.geometry === null ) this.geometry = buildCarGeometry( this.parameters );

		// bucket the fleet by paint so each colour becomes a single instanced draw
		const byColor = new Map();
		for ( const car of cars ) {

			if ( ! byColor.has( car.color ) ) byColor.set( car.color, [] );
			byColor.get( car.color ).push( car.matrix );

		}

		const group = new Group();
		group.name = 'Cars';

		for ( const [ paint, matrices ] of byColor ) {

			let material = this.materials.get( paint );
			if ( material === undefined ) {

				material = createCarMaterial( paint );
				this.materials.set( paint, material );

			}

			const mesh = new InstancedMesh( this.geometry, material, matrices.length );
			for ( let i = 0; i < matrices.length; i ++ ) mesh.setMatrixAt( i, matrices[ i ] );
			mesh.castShadow = mesh.receiveShadow = true;
			mesh.name = 'Car';
			group.add( mesh );

		}

		this.mesh = group;

		return group;

	}

	dispose() {

		if ( this.geometry ) this.geometry.dispose();
		this.geometry = null;

		for ( const material of this.materials.values() ) material.dispose();
		this.materials.clear();

		this.mesh = null;

	}

}

CarGenerator.defaults = {
	length: 4.5, // bumper to bumper along Z
	width: 1.8, // body width across X
	wheelRadius: 0.34
};

const BODY = 0, WHEEL = 1, HEADLIGHT = 2, TAILLIGHT = 3, TRIM = 4;

function part( geometry, id ) {

	const g = geometry.index ? geometry.toNonIndexed() : geometry;
	g.deleteAttribute( 'uv' ); // the material is untextured, so drop uvs for a clean merge
	g.setAttribute( 'partId', new BufferAttribute( new Float32Array( g.attributes.position.count ).fill( id ), 1 ) );
	return g;

}

// one body cross section: a closed 14-point ring traced up the right flank, over a
// greenhouse of half-width `roofHalfW`, then mirrored down the left flank. The bottom
// edge wraps shut as the flat underbody. Sweeping these along Z lofts the whole shell.
function carSection( z, bodyHalfW, roofHalfW, yLow, yBelt, yRoof ) {

	const right = [
		new Vector3( bodyHalfW * 0.72, yLow, z ),
		new Vector3( bodyHalfW, yLow + ( yBelt - yLow ) * 0.45, z ),
		new Vector3( bodyHalfW, yBelt, z ),
		new Vector3( ( bodyHalfW + roofHalfW ) * 0.5, yBelt + ( yRoof - yBelt ) * 0.22, z ),
		new Vector3( roofHalfW, yBelt + ( yRoof - yBelt ) * 0.62, z ),
		new Vector3( roofHalfW * 0.95, yRoof - ( yRoof - yBelt ) * 0.06, z ),
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

function buildCarGeometry( p ) {

	const w = p.width, r = p.wheelRadius;
	const halfW = w / 2;

	// stations from nose ( +Z ) to tail ( -Z ): z, bodyHalfW, roofHalfW, yLow, yBelt, yRoof.
	// the greenhouse only rises over the middle rows; bumper rows pinch in and drop low
	const stations = [
		[ 2.20, halfW * 0.80, halfW * 0.80, 0.42, 0.66, 0.74 ], // front fascia
		[ 1.95, halfW * 0.97, halfW * 0.94, 0.39, 0.76, 0.86 ],
		[ 1.45, halfW, halfW * 0.98, 0.37, 0.84, 0.96 ],
		[ 1.00, halfW, halfW * 0.73, 0.36, 0.92, 1.06 ], // cowl, windshield base
		[ 0.45, halfW, halfW * 0.69, 0.35, 0.95, 1.43 ], // roof front, windshield top
		[ - 0.55, halfW, halfW * 0.69, 0.35, 0.95, 1.45 ], // roof
		[ - 1.05, halfW, halfW * 0.71, 0.36, 0.93, 1.40 ], // roof rear, backlight top
		[ - 1.55, halfW, halfW * 0.95, 0.37, 0.86, 0.98 ], // decklid, backlight base
		[ - 1.95, halfW * 0.97, halfW * 0.94, 0.39, 0.78, 0.88 ],
		[ - 2.20, halfW * 0.82, halfW * 0.82, 0.42, 0.68, 0.76 ] // rear fascia
	];

	const sections = stations.map( s => carSection( ...s ) );
	const body = new LoftGeometry( sections, { closed: true, capStart: true, capEnd: true } );

	// fat round tyres tucked under the fenders, each faced with an outward chrome
	// hubcap disc ( only the outer face is ever seen, so a flat disc is enough )
	const wheels = [];
	const hubcaps = [];
	const wheelX = halfW - 0.06;
	for ( const x of [ - wheelX, wheelX ] ) {

		const side = Math.sign( x );
		for ( const z of [ - 1.45, 1.45 ] ) {

			wheels.push( new CylinderGeometry( r, r, 0.22, 12 ).rotateZ( Math.PI / 2 ).translate( x, r, z ) );
			hubcaps.push( new CircleGeometry( 0.15, 12 ).rotateY( side * Math.PI / 2 ).translate( x + side * 0.12, r, z ) );

		}

	}

	// chrome bumpers wrap each end and a matte grille fills the nose between the lamps;
	// each pod is sunk into the fascia so its back never floats and only its face shows
	const frontBumper = new BoxGeometry( w * 0.94, 0.2, 0.18 ).translate( 0, 0.40, 2.18 );
	const rearBumper = new BoxGeometry( w * 0.94, 0.2, 0.18 ).translate( 0, 0.40, - 2.18 );
	const grille = new BoxGeometry( 0.5, 0.13, 0.08 ).translate( 0, 0.60, 2.23 );

	const headlights = mergeGeometries( [
		new BoxGeometry( 0.36, 0.12, 0.08 ).translate( - 0.56, 0.62, 2.22 ),
		new BoxGeometry( 0.36, 0.12, 0.08 ).translate( 0.56, 0.62, 2.22 )
	] );

	const taillights = mergeGeometries( [
		new BoxGeometry( 0.42, 0.14, 0.08 ).translate( - 0.56, 0.64, - 2.22 ),
		new BoxGeometry( 0.42, 0.14, 0.08 ).translate( 0.56, 0.64, - 2.22 )
	] );

	return mergeGeometries( [
		part( body, BODY ),
		part( mergeGeometries( [ ...wheels, grille ] ), WHEEL ),
		part( mergeGeometries( [ ...hubcaps, frontBumper, rearBumper ] ), TRIM ),
		part( headlights, HEADLIGHT ),
		part( taillights, TAILLIGHT )
	] );

}

function createCarMaterial( paint ) {

	const partId = varying( attribute( 'partId', 'float' ) ).setInterpolation( InterpolationSamplingType.FLAT, InterpolationSamplingMode.EITHER );
	const isWheel = partId.equal( WHEEL );
	const isTrim = partId.equal( TRIM );
	const isHeadlight = partId.equal( HEADLIGHT );
	const isTaillight = partId.equal( TAILLIGHT );

	const material = new MeshStandardNodeMaterial();

	// painted shell, matte tyres and grille, chrome trim, and two lit lamps
	material.colorNode = select( isWheel, color( 0x141414 ),
		select( isTrim, color( 0xc2c6ca ),
			select( isHeadlight, color( 0xf6f4e0 ),
				select( isTaillight, color( 0x6a0a0a ), color( paint ) ) ) ) );

	material.roughnessNode = select( isWheel, float( 0.85 ),
		select( isTrim, float( 0.25 ), float( 0.5 ) ) );

	material.metalnessNode = select( isTrim, float( 0.9 ), float( 0.1 ) ); // chrome trim, dielectric clear-coat paint

	material.emissiveNode = select( isHeadlight, color( 0xf6f4e0 ).mul( 1.6 ),
		select( isTaillight, color( 0xff1a0a ).mul( 2.4 ), color( 0x000000 ) ) ); // lit lamps

	return material;

}

export { CarGenerator };
