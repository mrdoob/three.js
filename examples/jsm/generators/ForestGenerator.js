import {
	BufferAttribute,
	Group,
	IcosahedronGeometry,
	InstancedBufferAttribute,
	InstancedMesh,
	Object3D,
	Vector3
} from 'three';

import { MeshStandardNodeMaterial } from 'three/webgpu';
import { attribute, color, float, Fn, If, mix, mx_noise_float, normalView, positionLocal, positionView, positionWorld, smoothstep, step, uniform } from 'three/tsl';

import { ImprovedNoise } from '../math/ImprovedNoise.js';
import { mergeVertices } from '../utils/BufferGeometryUtils.js';

/**
 * Carpets a {@link TerrainGenerator} ( or anything exposing `sampleHeight`,
 * `sampleSlope`, `minY`, `maxY` and `parameters.size` ) with a forest of hundreds
 * of thousands of trees in a single draw call.
 *
 * Each tree is the cheapest thing that still reads as a tree: a ~20-face icosphere
 * squashed into a tapered teardrop and lumped with a little noise, carrying a baked
 * dark-base / bright-top gradient. Tens of triangles each, so a single
 * {@link THREE.InstancedMesh} of half a million of them costs one draw call. Trees
 * are placed by rejection sampling against ecological rules — a min/max altitude
 * band ( above the mist floor, below the snowline ), a slope limit ( none on
 * cliffs ) and a low-frequency density mask that opens clearings — then jittered in
 * yaw, lean and ( squared-biased ) scale so the stand never reads as copies.
 *
 * ```js
 * const forest = new ForestGenerator( { count: 500000 } );
 * scene.add( forest.build( terrain ) );
 * ```
 */
class ForestGenerator {

	constructor( parameters = {} ) {

		this.parameters = Object.assign( {}, ForestGenerator.defaults, parameters );

		// stochastic distance cull ( THREE.Fog-style near / far ): drawn within `from`, gone
		// past `to`, the band between thinned by a baked random. live-tunable uniforms.
		this.from = uniform( this.parameters.from );
		this.to = uniform( this.parameters.to );

		// main-camera position ( set via setCameraPosition ). NOT the TSL cameraPosition node:
		// in the shadow pass that resolves to the light, which would cull the wrong trees.
		this._cameraPosition = uniform( new Vector3() );

		this.material = createForestMaterial( this.from, this.to, this._cameraPosition );
		this.mesh = null;
		this.group = null;

	}

	build( terrain ) {

		this.dispose();

		const p = this.parameters;
		const geometry = blobGeometry( p );

		const size = terrain.parameters.size;
		const minY = terrain.minY;
		const span = terrain.maxY - terrain.minY;

		const random = createRandom( p.seed );

		// a low-frequency field that breaks the forest into patches and clearings
		const perlin = new ImprovedNoise();
		const dOffX = random() * 256, dOffZ = random() * 256, dSlice = random() * 256;
		const densityAt = ( x, z ) => smoothBlend( - 0.12, 0.22, perlin.noise( x * p.densityFrequency + dOffX, z * p.densityFrequency + dOffZ, dSlice ) );

		const mesh = new InstancedMesh( geometry, this.material, p.count );
		mesh.castShadow = mesh.receiveShadow = p.castShadow; // honoured on every rebuild

		// per-instance cull data: xyz = tree position ( for its distance to the camera ),
		// w = a threshold jitter from a separate PRNG, so it doesn't disturb placement
		const cullData = new Float32Array( p.count * 4 );
		const cullRandom = createRandom( ( p.seed ^ 0x9e3779b9 ) >>> 0 );

		// per-instance regional colour drift, baked here so the vertex-bound shader taps no
		// noise. offsets come from the cull PRNG, so placement is untouched.
		const regionData = new Float32Array( p.count );
		const rOffX = cullRandom() * 256, rOffZ = cullRandom() * 256, rSlice = cullRandom() * 256;

		const dummy = new Object3D();
		let placed = 0;
		let attempts = 0;
		const maxAttempts = p.count * 14; // give up rather than hang if the band is too small

		while ( placed < p.count && attempts < maxAttempts ) {

			attempts ++;

			const x = ( random() - 0.5 ) * size;
			const z = ( random() - 0.5 ) * size;

			const y = terrain.sampleHeight( x, z );
			const altitude = ( y - minY ) / span;
			if ( altitude < p.altitudeMin || altitude > p.altitudeMax ) continue;

			if ( terrain.sampleSlope( x, z ) < p.minSlope ) continue;

			// density mask, feathered out at the top so the treeline scatters, not a clean line
			let density = densityAt( x, z );
			density *= smoothBlend( p.altitudeMax, p.altitudeMax - 0.14, altitude );
			if ( random() >= density ) continue;

			dummy.position.set( x, y - p.sink, z ); // sink the base point into the ground
			dummy.rotation.set( ( random() - 0.5 ) * 0.12, random() * Math.PI * 2, ( random() - 0.5 ) * 0.12 ); // small lean + free yaw, trunk ~vertical

			const s = p.minScale + random() * random() * ( p.maxScale - p.minScale ); // squared bias: mostly small, rare giants
			dummy.scale.set( s * ( 0.85 + random() * 0.3 ), s, s * ( 0.85 + random() * 0.3 ) );

			dummy.updateMatrix();
			mesh.setMatrixAt( placed, dummy.matrix );

			const c = placed * 4;
			cullData[ c ] = x;
			cullData[ c + 1 ] = dummy.position.y; // the sunk y, matching the drawn position
			cullData[ c + 2 ] = z;
			cullData[ c + 3 ] = cullRandom();

			regionData[ placed ] = Math.min( 1, Math.max( 0, perlin.noise( x * 0.02 + rOffX, z * 0.02 + rOffZ, rSlice ) * 0.6 + 0.5 ) );

			placed ++;

		}

		mesh.count = placed; // only what got planted
		mesh.instanceMatrix.needsUpdate = true;
		geometry.setAttribute( 'cull', new InstancedBufferAttribute( cullData, 4 ) );
		geometry.setAttribute( 'region', new InstancedBufferAttribute( regionData, 1 ) );

		const group = new Group();
		group.name = 'Forest';
		group.add( mesh );

		this.mesh = mesh;
		this.group = group;

		return group;

	}

	// call each frame so the distance cull tracks the camera
	setCameraPosition( position ) {

		this._cameraPosition.value.copy( position );

	}

	dispose() {

		if ( this.mesh ) this.mesh.geometry.dispose();
		this.mesh = null;
		this.group = null;

	}

}

ForestGenerator.defaults = {
	seed: 1,
	count: 500000, // number of trees to plant ( a single instanced draw call )
	detail: 0, // icosphere subdivision ( 0 = 20 faces, welds to 12 verts )
	radius: 1.3, // base half-width of a tree blob, in world units
	height: 4, // base height of a tree blob
	distortion: 0.5, // lumpiness of the blob hull ( a rough conifer, not a smooth egg )
	sink: 0.4, // how far the base point is pushed under the surface, to hide it
	altitudeMin: 0.12, // normalised altitude band the forest occupies: above the mist floor...
	altitudeMax: 0.46, // ...and safely below the snowline
	minSlope: 0.55, // minimum surface flatness ( normal.y ); steeper ground stays bare rock
	densityFrequency: 0.012, // patch / clearing scale ( world units )
	minScale: 0.7,
	maxScale: 1.8,
	from: 300, // distance ( like THREE.Fog ) within which every tree is drawn...
	to: 620, // ...past which none are; the band between thins out stochastically
	castShadow: false // whether the canopy casts + receives shadows ( 500k casters is a real cost — opt in )
};

// deterministic PRNG ( mulberry32 ), matching the other generators
function createRandom( seed ) {

	let s = ( seed >>> 0 ) || 1;

	return function () {

		s = ( s + 0x6D2B79F5 ) | 0;
		let t = Math.imul( s ^ ( s >>> 15 ), 1 | s );
		t = ( t + Math.imul( t ^ ( t >>> 7 ), 61 | t ) ) ^ t;
		return ( ( t ^ ( t >>> 14 ) ) >>> 0 ) / 4294967296;

	};

}

function smoothBlend( edge0, edge1, x ) {

	const t = Math.max( 0, Math.min( 1, ( x - edge0 ) / ( edge1 - edge0 ) ) );
	return t * t * ( 3 - 2 * t );

}

// smooth low-frequency lump over the unit sphere, so the blob hull is bumpy not spiky
function blobNoise( x, y, z ) {

	return Math.sin( x * 3.1 ) * Math.sin( y * 2.7 + 1.3 ) * Math.sin( z * 3.5 + 2.1 );

}

// one tree blob: an icosphere squashed into a lumpy, tapered teardrop, base at y = 0.
// normals are re-pointed up-and-out so it shades as a soft canopy volume; a baked `ao`
// ( 0 base → 1 crown ) drives the dark-underside / bright-crown gradient.
function blobGeometry( p ) {

	// IcosahedronGeometry is non-indexed ( 60 verts ); deleting uv + normal lets mergeVertices
	// weld by position to 12 verts — ~5× fewer vertex-shader runs. normals are rebuilt below.
	let geometry = new IcosahedronGeometry( 1, p.detail );
	geometry.deleteAttribute( 'uv' );
	geometry.deleteAttribute( 'normal' );
	geometry = mergeVertices( geometry );

	const position = geometry.attributes.position;
	const count = position.count;

	const normals = new Float32Array( count * 3 );
	const ao = new Float32Array( count );

	for ( let i = 0; i < count; i ++ ) {

		const ux = position.getX( i );
		const uy = position.getY( i );
		const uz = position.getZ( i ); // a point on the unit sphere

		const h = ( uy + 1 ) / 2; // 0 at the base, 1 at the top
		const taper = 1 - 0.62 * h; // narrower toward a pointier crown
		const lump = 1 + p.distortion * blobNoise( ux, uy, uz );
		const r = taper * lump;

		position.setXYZ( i, ux * r * p.radius, h * p.height, uz * r * p.radius );

		// up-and-outward normal: a soft, dome-lit canopy rather than faceted rock
		const inv = 1 / Math.hypot( ux, 0.55, uz );
		normals[ i * 3 ] = ux * inv;
		normals[ i * 3 + 1 ] = 0.55 * inv;
		normals[ i * 3 + 2 ] = uz * inv;

		ao[ i ] = h;

	}

	position.needsUpdate = true;
	geometry.setAttribute( 'normal', new BufferAttribute( normals, 3 ) );
	geometry.setAttribute( 'ao', new BufferAttribute( ao, 1 ) );
	geometry.computeBoundingSphere();

	return geometry;

}

// derivative-based bump ( surface-gradient method ): perturbs the view normal from a
// procedural height field, so the canopy reads as clustered foliage, not a smooth shell
function bumpNormal( height ) {

	const dpdx = positionView.dFdx();
	const dpdy = positionView.dFdy();
	const r1 = dpdy.cross( normalView );
	const r2 = normalView.cross( dpdx );
	const det = dpdx.dot( r1 );
	const grad = det.sign().mul( height.dFdx().mul( r1 ).add( height.dFdy().mul( r2 ) ) );

	return det.abs().mul( normalView ).sub( grad ).normalize();

}

/**
 * The single material shared by every tree in a {@link ForestGenerator}. A plain
 * MeshStandardNodeMaterial lit by the scene — only the surface is authored: deep
 * shadowed green in the recesses rising to a bright, yellow-green sunlit crown,
 * mottled into needle clumps by 3D noise, with a matching bump so the clumps catch
 * the light. Half a million instanced blobs makes this mesh vertex-bound, so the
 * regional colour drift is baked to a per-instance attribute ( no shader noise for it ),
 * and the costly clump noise + bump are **gated by distance** — full detail on the near
 * trees ( where it reads ), skipped on the far canopy ( where it is sub-pixel ).
 *
 * @param {Node} from - distance within which every tree is drawn.
 * @param {Node} to - distance past which no tree is drawn.
 * @return {MeshStandardNodeMaterial}
 */
function createForestMaterial( from, to, camPos ) {

	const material = new MeshStandardNodeMaterial();
	material.metalness = 0;
	material.roughness = 0.88;

	const cull = attribute( 'cull', 'vec4' ); // xyz = tree position, w = random 0..1
	const d = cull.xyz.distance( camPos ); // per-tree distance to the ( main ) camera

	// stochastic distance cull: past its jittered `from`→`to` threshold a tree collapses to a
	// point, dropping the far canopy. `positionLocal` is already WORLD space here ( the instance
	// transform runs before positionNode ), so the ×0 lands the whole blob on the origin.
	const t = d.sub( from ).div( to.sub( from ) );
	material.positionNode = positionLocal.mul( step( t, cull.w ) ); // keep where random ≥ t

	const ao = attribute( 'ao', 'float' ); // 0 at the blob base, 1 at the crown

	// regional drift, baked per tree ( see build ) so no stage taps a noise; a blob is small
	// enough that one value per tree reads as a smooth field across the canopy
	const region = attribute( 'region', 'float' );
	const deep = mix( color( 0x1d3318 ), color( 0x2e4420 ), region ); // shadowed interior
	const bright = mix( color( 0x4c6a2e ), color( 0x6e8a40 ), region ); // sunlit tips ( muted green, not neon )

	// one 3D noise field ( coarse + fine ), shared by the colour and bump, near canopy only
	const detailFade = smoothstep( 280, 25, positionWorld.distance( camPos ) );

	// gated by an If ( which must sit inside an Fn ) so the far canopy skips the noise
	const clump = Fn( () => {

		const c = float( 0 ).toVar();

		If( detailFade.greaterThan( 0.01 ), () => {

			c.assign( mx_noise_float( positionWorld.mul( 0.9 ) )
				.add( mx_noise_float( positionWorld.mul( 3.1 ) ).mul( 0.5 ) )
				.mul( detailFade ) );

		} );

		return c;

	} )();

	// deep recesses → bright clumps / crown
	const lit = ao.mul( 0.5 ).add( 0.32 ).add( clump.mul( 0.18 ) ).clamp();
	material.colorNode = mix( deep, bright, lit );

	// clumps catch the light ( clump is 0 far away, so the bump flattens there )
	material.normalNode = bumpNormal( clump.mul( 0.22 ) );

	return material;

}

export { ForestGenerator, createForestMaterial };
