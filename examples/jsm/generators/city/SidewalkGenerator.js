import {
	ExtrudeGeometry,
	Group,
	MeshStandardNodeMaterial,
	Shape
} from 'three/webgpu';

import { cameraPosition, color, float, floor, Fn, fract, fwidth, If, mix, mx_noise_float, normalWorldGeometry, positionWorld, sin, smoothstep } from 'three/tsl';

import { createInstances, updateInstances } from './InstancedMeshGenerator.js';
import { bumpNormal } from './CityGeneratorUtils.js';

/**
 * Generates the raised sidewalk for a city's blocks: per block, a rounded-corner concrete
 * slab rimmed by a distinct granite kerbstone that stands proud of the walking surface and
 * drops to the road. Instanced across a list of placements and dressed with its own
 * procedural material ( poured concrete flags, scored expansion joints, granite curb ).
 * Returns a `THREE.Group` of two instanced meshes — the walking slab and the curb.
 *
 * Unlike the building generator, this one owns its materials: the slab and curb
 * geometry and the TSL that shades them live together here.
 *
 * ```js
 * const sidewalk = new SidewalkGenerator( { width: 90, depth: 60, height: 0.5 } );
 * scene.add( sidewalk.build( placements ) ); // placements: Matrix4[]
 * ```
 */
class SidewalkGenerator {

	constructor( parameters = {} ) {

		this.parameters = Object.assign( {}, SidewalkGenerator.defaults, parameters );

		this.material = null; // the procedural concrete, built once and reused across rebuilds
		this.curbMaterial = null; // the procedural granite curb, likewise
		this.mesh = null;
		this._parametersKey = null;

	}

	build( placements ) {

		const parametersKey = JSON.stringify( this.parameters );

		if ( parametersKey !== this._parametersKey || ( this.mesh && placements.length > this.mesh.children[ 0 ].instanceMatrix.count ) ) {

			this.dispose();
			this._parametersKey = parametersKey;

		}

		if ( this.material === null ) this.material = createSidewalkMaterial();
		if ( this.curbMaterial === null ) this.curbMaterial = createCurbMaterial();

		if ( this.mesh === null ) {

			const { width, depth, height, radius, curbWidth, curbLip } = this.parameters;
			const slab = createInstances( slabGeometry( width, depth, height, radius, curbWidth ), this.material, placements.length, '' );
			const curb = createInstances( curbGeometry( width, depth, height, radius, curbWidth, curbLip ), this.curbMaterial, placements.length, '' );
			slab.castShadow = curb.castShadow = false;

			this.mesh = new Group();
			this.mesh.name = 'Sidewalk';
			this.mesh.add( slab, curb );

		}

		for ( const mesh of this.mesh.children ) updateInstances( mesh, placements );

		return this.mesh;

	}

	dispose() {

		if ( this.mesh === null ) return;

		this.mesh.traverse( ( object ) => {

			if ( object.geometry ) object.geometry.dispose();
			object.dispose();

		} );

		this.material.dispose();
		this.curbMaterial.dispose();
		this.material = null;
		this.curbMaterial = null;
		this.mesh = null;

	}

}

SidewalkGenerator.defaults = {
	width: 90, // the block footprint each slab covers
	depth: 60,
	height: 0.5, // walking-surface height above the road
	radius: 5, // corner radius, so the sidewalk turns each intersection instead of a hard 90°
	curbWidth: 0.13, // top width of the granite kerbstone rimming the block ( ~5 in )
	curbLip: 0.01 // how far the curb stands proud of the walking surface ( near-flush )
};

// --- geometry ------------------------------------------------------------

// the block footprint as a rounded-corner rectangle ( centred at the origin ), so the
// sidewalk turns each intersection instead of meeting the kerb at a hard 90°
function roundedRect( width, depth, radius ) {

	const w = width / 2;
	const d = depth / 2;
	const r = Math.min( radius, w, d );

	const shape = new Shape();
	shape.moveTo( - w + r, - d );
	shape.lineTo( w - r, - d );
	shape.quadraticCurveTo( w, - d, w, - d + r );
	shape.lineTo( w, d - r );
	shape.quadraticCurveTo( w, d, w - r, d );
	shape.lineTo( - w + r, d );
	shape.quadraticCurveTo( - w, d, - w, d - r );
	shape.lineTo( - w, - d + r );
	shape.quadraticCurveTo( - w, - d, - w + r, - d );

	return shape;

}

// extrude a footprint outline up by `height` ( the extrusion runs +Z; stand it up so height is +Y )
function extrudeUp( shape, height ) {

	const geometry = new ExtrudeGeometry( shape, { depth: height, bevelEnabled: false, curveSegments: 6 } );
	geometry.rotateX( - Math.PI / 2 );

	return geometry;

}

// the walking slab: the inner concrete surface, inset to sit inside the curb and overlapping
// it slightly so the seam is buried. base at y = 0, walking surface at `height`.
function slabGeometry( width, depth, height, radius, curbWidth ) {

	const innerRadius = Math.max( 0.5, radius - curbWidth );
	return extrudeUp( roundedRect( width - 2 * curbWidth + 0.06, depth - 2 * curbWidth + 0.06, innerRadius ), height );

}

// the curb: a distinct full-height kerbstone band rimming the block ( the outline with an
// inset hole ), standing proud of the walking slab by `curbLip` and dropping to the road.
function curbGeometry( width, depth, height, radius, curbWidth, curbLip ) {

	const innerRadius = Math.max( 0.5, radius - curbWidth );
	const shape = roundedRect( width, depth, radius );
	shape.holes.push( roundedRect( width - 2 * curbWidth, depth - 2 * curbWidth, innerRadius ) );
	return extrudeUp( shape, height + curbLip );

}

// --- material ------------------------------------------------------------

// an antialiased line repeated at every multiple of `period` ( the scored joints )
function gridLine( coord, period, halfWidth ) {

	const g = coord.div( period );
	const d = float( 0.5 ).sub( fract( g ).sub( 0.5 ).abs() ); // distance to nearest line, in periods
	const aa = fwidth( g ).max( 0.0001 );
	const hw = halfWidth / period;
	return smoothstep( float( hw ).add( aa ), float( hw ).sub( aa ), d );

}

// a noise term that only resolves up close: sampled inside a detail branch ( and kept in its
// own single-output Fn, so it is evaluated only in the output flow that consumes it )
function detailNoise( p, detail, scale, amp ) {

	return Fn( () => {

		const n = float( 0 ).toVar();

		If( detail.greaterThan( 0 ), () => {

			n.assign( mx_noise_float( p.mul( scale ) ).mul( amp ) );

		} );

		return n;

	} )();

}

function createSidewalkMaterial() {

	// concrete flags: each poured slab a slightly different tone, fine aggregate speckle
	// and expansion joints scored on a grid both ways

	const p = positionWorld;
	const detail = smoothstep( 200, 18, p.distance( cameraPosition ) );

	const panel = 1.5; // flag size ( ~5 ft NYC sidewalk flags )
	const panelHash = fract( sin( floor( p.x.div( panel ) ).mul( 127.1 ).add( floor( p.z.div( panel ) ).mul( 311.7 ) ) ).mul( 43758.5453 ) );

	const tone = mx_noise_float( p.mul( 0.5 ) ).mul( 0.5 ).add( 0.5 );

	// fine aggregate speckle ( grit, tinting the colour ) and grain relief ( driving the normal )
	const grit = detailNoise( p, detail, 14, 0.07 ).mul( detail );
	const grain = detailNoise( p, detail, 3, 0.003 );

	const base = mix( color( 0x6f6f68 ), color( 0x8c8c82 ), tone ).mul( panelHash.sub( 0.5 ).mul( 0.16 ).add( 1 ) ); // per-flag tone
	const concrete = base.add( grit );

	const joints = gridLine( p.x, panel, 0.045 ).max( gridLine( p.z, panel, 0.045 ) ).mul( detail );

	const material = new MeshStandardNodeMaterial();
	material.colorNode = concrete.mul( joints.mul( 0.45 ).oneMinus() );
	material.roughnessNode = float( 0.92 ).sub( panelHash.mul( 0.05 ) );
	material.normalNode = bumpNormal( grain.sub( joints.mul( 0.012 ) ).mul( detail ) ); // world units: ~3 mm grain, ~12 mm scored joints

	return material;

}

function createCurbMaterial() {

	// granite kerbstone: a dense, cool grey stone — darker and smoother than the concrete
	// flags — with a fine speckle, segment joints every ~1.5 m and a grimier road-facing face

	const p = positionWorld;
	const detail = smoothstep( 200, 18, p.distance( cameraPosition ) );

	const tone = mx_noise_float( p.mul( 0.6 ) ).mul( 0.5 ).add( 0.5 );
	const stone = mix( color( 0x46463f ), color( 0x5c5c54 ), tone ).add( detailNoise( p, detail, 18, 0.05 ).mul( detail ) ); // dark cool granite, fine speckle

	const seg = 1.5; // kerbstone segment length
	const joints = gridLine( p.x, seg, 0.04 ).max( gridLine( p.z, seg, 0.04 ) ).mul( detail );
	const top = smoothstep( 0.5, 0.85, normalWorldGeometry.y ); // 1 on the curb top, 0 on its walls
	const dressed = mix( stone.mul( 0.7 ), stone, top ).mul( joints.mul( 0.4 ).oneMinus() ); // grimier on the road-facing face

	const material = new MeshStandardNodeMaterial();
	material.colorNode = dressed;
	material.roughnessNode = float( 0.7 ).add( tone.mul( 0.1 ) ); // flamed granite: matte, a touch smoother than the concrete sidewalk
	material.normalNode = bumpNormal( detailNoise( p, detail, 4, 0.002 ).mul( detail ) ); // fine granite grain

	return material;

}

export { SidewalkGenerator };
