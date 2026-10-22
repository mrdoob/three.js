import {
	ArrayCamera,
	BackSide,
	Box3,
	DepthTexture,
	DoubleSide,
	FloatType,
	FrontSide,
	HalfFloatType,
	Light,
	LinearFilter,
	MathUtils,
	MeshBasicNodeMaterial,
	NearestFilter,
	NodeMaterial,
	PerspectiveCamera,
	QuadMesh,
	RenderTarget,
	RenderTarget3D,
	RGBAFormat,
	RGFormat,
	Vector3,
	Vector4
} from 'three/webgpu';

import { array, atan, Discard, float, Fn, frontFacing, getShIrradianceAt, int, ivec2, ivec3, Loop, perspectiveDepthToViewZ, screenCoordinate, select, texture, texture3D, uniform, vec2, vec3, vec4 } from 'three/tsl';

import { LightProbeGridNode, ATLAS_PADDING, DISTANCE_COLUMNS, DISTANCE_RESOLUTION, HIDDEN_DISTANCE, IRRADIANCE_RESOLUTION, IRRADIANCE_TILE, octDecode, octTileTexel, packGridSH, unpackGridSH } from '../tsl/lighting/LightProbeGridNode.js';
import { replaceSunLights, restoreSunLights } from './LightProbeGridUtils.js';

// Probes captured per render, six sub-cameras each.
const PROBES_PER_BATCH = 8;

// Row blocks per face, so each probe's projection spreads over more fragments.
const FACE_BLOCKS = 4;
// Classification sample count and threshold for probes inside geometry.
const CLASSIFY_SAMPLES = 64;
const INSIDE_FRACTION = 0.25;

// Hide probes within this many radiance near planes of a surface.
const CLEARANCE_NEAR_PLANES = 1.5;
const CLASSIFY_NEAR_SCALE = 0.01;

// Golden-angle increment for the equal-area Fibonacci sphere.
const GOLDEN_ANGLE = Math.PI * ( 3.0 - Math.sqrt( 5.0 ) );

// Per-face forward, right and up vectors of the capture cameras.
const FACE_FORWARD = [[ 1, 0, 0 ], [ - 1, 0, 0 ], [ 0, 1, 0 ], [ 0, - 1, 0 ], [ 0, 0, 1 ], [ 0, 0, - 1 ]];
const FACE_RIGHT = [[ 0, 0, 1 ], [ 0, 0, - 1 ], [ - 1, 0, 0 ], [ - 1, 0, 0 ], [ - 1, 0, 0 ], [ 1, 0, 0 ]];
const FACE_UP = [[ 0, 1, 0 ], [ 0, 1, 0 ], [ 0, 0, - 1 ], [ 0, 0, 1 ], [ 0, 1, 0 ], [ 0, 1, 0 ]];

// Shared fullscreen-quad for the bake passes.
const _quad = /*@__PURE__*/ new QuadMesh();

// Reusable temp objects.
const _position = /*@__PURE__*/ new Vector3();
const _target = /*@__PURE__*/ new Vector3();
const _size = /*@__PURE__*/ new Vector3();
const _copyRegion = /*@__PURE__*/ new Box3();

// Bake materials, shared across grids so the shaders compile once, not per bake.
let _shMaterial = null;
let _shFaceSize = - 1;
let _distanceResolution = - 1;
let _faceNode = null;
let _batchNode = null;
let _batchStartUniform = null;
let _batchCountUniform = null;
let _depthNode = null;
let _classifyNode = null;
let _classifyTarget = null;
let _classifyMaterials = null;
let _nearUniform = null;
let _farUniform = null;
let _clearanceUniform = null;
let _distanceScaleUniform = null;
let _distanceMaterial = null;
let _fractionMaterial = null;
let _resolutionUniform = null;
let _sliceZUniform = null;
let _repackMaterials = null;

// Bake render targets, pooled by size so rebakes don't churn allocations.
let _faceTarget = null;
let _faceSize = - 1;
let _batchTarget = null;
let _batchProbes = - 1;

// Renders all faces of a probe batch in one pass.
let _captureCamera = null;

/**
 * Returns the output node for the spherical-harmonic projection pass. Each
 * fragment of a batch row integrates one SH coefficient over one row block of a
 * captured cube face, weighting every texel by its exact solid angle. Columns are ordered
 * `( coefficient * 6 + face ) * FACE_BLOCKS + block`; the repack pass sums them.
 *
 * @private
 * @param {Node} faces - The face atlas texture node.
 * @param {number} size - The face resolution.
 * @param {Node<int>} batchStart - The probe index of the first batch row.
 * @return {Node<vec4>} The projected coefficient for one face.
 */
function projectSHNode( faces, size, batchStart ) {

	return Fn( () => {

		const column = int( screenCoordinate.x );
		const block = column.mod( FACE_BLOCKS );
		const coefIndex = column.div( 6 * FACE_BLOCKS ).toVar();
		const face = column.div( FACE_BLOCKS ).mod( 6 ).toVar();
		const slot = int( screenCoordinate.y ).sub( batchStart );
		const rows = size / FACE_BLOCKS;
		const rowStart = block.mul( rows ).toVar();

		const forward = array( FACE_FORWARD.map( ( v ) => vec3( ...v ) ) ).element( face ).toVar();
		const right = array( FACE_RIGHT.map( ( v ) => vec3( ...v ) ) ).element( face ).toVar();
		const up = array( FACE_UP.map( ( v ) => vec3( ...v ) ) ).element( face ).toVar();

		const origin = ivec2( face.mul( size ), slot.mul( size ).add( rowStart ) ).toVar();
		const texelSize = 2.0 / size;
		const accum = vec3( 0.0 ).toVar();

		// Signed area of the projected face region from its center to ( x, y ).
		const area = ( x, y ) => atan( x.mul( y ).div( x.mul( x ).add( y.mul( y ) ).add( 1.0 ).sqrt() ) );

		Loop( size, rows, ( { i, j } ) => {

			// Rows run top to bottom, so NDC y decreases with j.
			const x0 = float( i ).mul( texelSize ).sub( 1.0 );
			const x1 = x0.add( texelSize );
			const y0 = float( 1.0 ).sub( float( j.add( rowStart ) ).mul( texelSize ) );
			const y1 = y0.sub( texelSize );

			const solidAngle = area( x0, y0 ).sub( area( x0, y1 ) ).sub( area( x1, y0 ) ).add( area( x1, y1 ) ).abs();

			const x = x0.add( texelSize * 0.5 );
			const y = y0.sub( texelSize * 0.5 );
			const dir = forward.add( right.mul( x ) ).add( up.mul( y ) ).normalize().toVar();

			const radiance = faces.load( origin.add( ivec2( i, j ) ) ).rgb;

			// The L2 SH basis function for this fragment's coefficient.
			const dx = dir.x, dy = dir.y, dz = dir.z;
			const basis = array( [
				float( 0.282095 ),
				dy.mul( 0.488603 ),
				dz.mul( 0.488603 ),
				dx.mul( 0.488603 ),
				dx.mul( dy ).mul( 1.092548 ),
				dy.mul( dz ).mul( 1.092548 ),
				dz.mul( dz ).mul( 3.0 ).sub( 1.0 ).mul( 0.315392 ),
				dx.mul( dz ).mul( 1.092548 ),
				dx.mul( dx ).sub( dy.mul( dy ) ).mul( 0.546274 )
			] ).element( coefIndex );

			accum.addAssign( radiance.mul( basis.mul( solidAngle ) ) );

		} );

		return vec4( accum, 1.0 );

	} )();

}

/**
 * Returns the repack output node for one of the seven SH textures. It sums the
 * per-face projections of the 9 coefficients from the batch texture for the
 * probe at the current texel and packs the four floats stored by this texture
 * index.
 *
 * @private
 * @param {Node} batch - The batch texture node holding projected coefficients.
 * @param {number} textureIndex - The output texture index (0–6).
 * @param {Node<vec3>} resolution - The probe grid resolution uniform.
 * @param {Node<int>} sliceZ - The current Z slice being written.
 * @return {Node<vec4>} The packed texel.
 */
function repackNode( batch, textureIndex, resolution, sliceZ ) {

	return Fn( () => {

		const ix = int( screenCoordinate.x );
		const iy = int( screenCoordinate.y );

		// Batch rows follow the bake order (X, then Z, then Y).
		const nx = int( resolution.x );
		const nz = int( resolution.z );
		const probeIndex = ix.add( sliceZ.mul( nx ) ).add( iy.mul( nx ).mul( nz ) ).toVar();

		const coefficient = ( c ) => {

			let sum = batch.load( ivec2( c * 6 * FACE_BLOCKS, probeIndex ) );
			for ( let k = 1; k < 6 * FACE_BLOCKS; k ++ ) sum = sum.add( batch.load( ivec2( c * 6 * FACE_BLOCKS + k, probeIndex ) ) );
			return sum;

		};

		return packGridSH( coefficient, textureIndex );

	} )();

}

/**
 * Returns the capture texel and face coordinates a direction falls on.
 *
 * @private
 * @param {Node<vec3>} dir - The unit direction.
 * @param {number} size - The face resolution.
 * @param {Node<int>} slot - The probe's batch slot.
 * @return {Object} The texel `coord` and the face coordinates `fx`, `fy`.
 */
function captureTexel( dir, size, slot ) {

	const toVec3 = ( v ) => vec3( ...v );

	const a = dir.abs();
	const face = select( a.x.greaterThanEqual( a.y ).and( a.x.greaterThanEqual( a.z ) ),
		select( dir.x.greaterThanEqual( 0.0 ), int( 0 ), int( 1 ) ),
		select( a.y.greaterThanEqual( a.z ),
			select( dir.y.greaterThanEqual( 0.0 ), int( 2 ), int( 3 ) ),
			select( dir.z.greaterThanEqual( 0.0 ), int( 4 ), int( 5 ) ) ) ).toVar();

	const forward = array( FACE_FORWARD.map( toVec3 ) ).element( face );
	const right = array( FACE_RIGHT.map( toVec3 ) ).element( face );
	const up = array( FACE_UP.map( toVec3 ) ).element( face );

	const invForward = dir.dot( forward ).reciprocal();
	const fx = dir.dot( right ).mul( invForward ).toVar();
	const fy = dir.dot( up ).mul( invForward ).toVar();

	// Rows run top to bottom, so NDC y decreases with the row.
	const i = int( fx.add( 1.0 ).mul( 0.5 * size ).floor() ).clamp( 0, size - 1 );
	const j = int( float( 1.0 ).sub( fy ).mul( 0.5 * size ).floor() ).clamp( 0, size - 1 );

	return { coord: ivec2( face.mul( size ).add( i ), slot.mul( size ).add( j ) ), fx, fy };

}

/**
 * Returns the distance from a probe to the nearest surface in the classification
 * capture along a direction, and the capture texel it was read from.
 *
 * @private
 * @param {Node} depth - The classification capture's depth.
 * @param {Node<vec3>} dir - The unit direction.
 * @param {number} size - The face resolution.
 * @param {Node<int>} slot - The probe's batch slot.
 * @param {Node<float>} near - The capture near plane.
 * @param {Node<float>} far - The capture far plane.
 * @return {Object} The texel `coord` and the `distance`.
 */
function captureDistance( depth, dir, size, slot, near, far ) {

	const { coord, fx, fy } = captureTexel( dir, size, slot );
	const viewZ = perspectiveDepthToViewZ( depth.load( coord ).r, near, far );

	// Depth along the face axis to distance along the direction.
	return { coord, distance: viewZ.negate().mul( fx.mul( fx ).add( fy.mul( fy ) ).add( 1.0 ).sqrt() ) };

}

/**
 * Samples Fibonacci directions for each probe's back-face fraction and nearest hit.
 *
 * @private
 * @param {Node} flags - The classification capture's back-face flags.
 * @param {Node} depth - The classification capture's depth.
 * @param {number} size - The face resolution.
 * @param {Object} uniforms - The batch and camera uniforms.
 * @return {Node<vec4>} The back-face fraction in x and the nearest hit distance in y.
 */
function backFaceFractionNode( flags, depth, size, { batchStart, near, far } ) {

	return Fn( () => {

		const slot = int( screenCoordinate.y ).sub( batchStart ).toVar();
		const backFaces = float( 0.0 ).toVar();
		const nearest = far.toVar();

		Loop( CLASSIFY_SAMPLES, ( { i } ) => {

			const fi = float( i );
			const z = float( 1.0 ).sub( fi.mul( 2.0 ).add( 1.0 ).div( CLASSIFY_SAMPLES ) );
			const r = z.mul( z ).oneMinus().max( 0.0 ).sqrt();
			const phi = fi.mul( GOLDEN_ANGLE );
			const { coord, distance } = captureDistance( depth, vec3( r.mul( phi.cos() ), z, r.mul( phi.sin() ) ).toVar(), size, slot, near, far );

			// Background texels hold the clear color, so only count geometry hits.
			const hit = distance.lessThan( far.mul( 0.99 ) );
			backFaces.addAssign( select( hit, flags.load( coord ).r, float( 0.0 ) ) );
			nearest.assign( nearest.min( distance ) );

		} );

		return vec4( backFaces.div( CLASSIFY_SAMPLES ), nearest, 0.0, 1.0 );

	} )();

}

/**
 * Averages four distance samples per octahedral texel. Probes inside or too
 * close to geometry receive a negative mean distance to exclude them from lighting.
 *
 * @private
 * @param {Node} depth - The classification capture's depth.
 * @param {Node} batch - The batch texture holding each probe's back-face fraction.
 * @param {number} fractionColumn - The batch column of the back-face fraction.
 * @param {number} size - The face resolution.
 * @param {number} resolution - The octahedral distance resolution.
 * @param {Object} uniforms - The batch, camera and distance scale uniforms.
 * @return {Node<vec4>} The mean and mean squared normalized distance.
 */
function distanceMomentsNode( depth, batch, fractionColumn, size, resolution, { batchStart, batchCount, near, far, distanceScale, clearance } ) {

	const R = resolution;

	return Fn( () => {

		// Tiles are in bake order. Texels of probes outside the batch keep their data.

		const tile = octTileTexel( ivec2( screenCoordinate.xy ), R );
		const probeIndex = tile.probeIndex.toVar();
		const slot = probeIndex.sub( batchStart ).toVar();

		Discard( slot.lessThan( 0 ).or( slot.greaterThanEqual( batchCount ) ) );

		const classification = batch.load( ivec2( fractionColumn, probeIndex ) );
		const inside = classification.x.greaterThan( INSIDE_FRACTION ).or( classification.y.lessThan( clearance ) );

		const x = tile.x.toVar();
		const y = tile.y.toVar();

		const sum = vec2( 0.0 ).toVar();

		for ( const dy of [ 0.25, 0.75 ] ) {

			for ( const dx of [ 0.25, 0.75 ] ) {

				const e = vec2( float( x ).add( dx ), float( y ).add( dy ) ).div( R ).mul( 2.0 ).sub( 1.0 );
				const { distance } = captureDistance( depth, octDecode( e ).toVar(), size, slot, near, far );
				const normalized = distance.div( distanceScale ).min( 1.0 );

				sum.addAssign( vec2( normalized, normalized.mul( normalized ) ) );

			}

		}

		return vec4( select( inside, vec2( HIDDEN_DISTANCE, 0.0 ), sum.mul( 0.25 ) ), 0.0, 1.0 );

	} )();

}

/**
 * Evaluates SH irradiance for each octahedral texel, including its border.
 *
 * @private
 * @param {Node} atlas - The SH atlas texture node.
 * @param {Vector3} resolution - The probe grid resolution.
 * @param {Node<int>} start - The first probe index to write.
 * @param {Node<int>} end - The exclusive end probe index to write.
 * @return {Node<vec4>} The irradiance.
 */
function irradianceNode( atlas, resolution, start, end ) {

	const { x: nx, z: nz } = resolution;
	const R = IRRADIANCE_RESOLUTION;

	return Fn( () => {

		const tile = octTileTexel( ivec2( screenCoordinate.xy ), R );
		const probeIndex = tile.probeIndex.toVar();

		Discard( probeIndex.lessThan( start ).or( probeIndex.greaterThanEqual( end ) ) );

		// Bake order is X, then Z, then Y.
		const ix = probeIndex.mod( nx );
		const iz = probeIndex.div( nx ).mod( nz );
		const iy = probeIndex.div( nx * nz );

		const texels = [];

		for ( let t = 0; t < 7; t ++ ) {

			texels.push( atlas.load( ivec3( ix, iy, iz.add( t * ( nz + 2 * ATLAS_PADDING ) + ATLAS_PADDING ) ) ) );

		}

		const e = vec2( float( tile.x ).add( 0.5 ), float( tile.y ).add( 0.5 ) ).div( R ).mul( 2.0 ).sub( 1.0 );
		const irradiance = getShIrradianceAt( octDecode( e ), unpackGridSH( texels ) ).max( vec3( 0.0 ) );

		return vec4( irradiance, 1.0 );

	} )();

}

/**
 * Render object function of the classification capture: opaque meshes are drawn
 * with the classification material for their side, everything else is skipped.
 *
 * @private
 */
function classifyRenderObject( object, scene, camera, geometry, material, group, lightsNode, clippingContext ) {

	if ( object.isMesh !== true || material.transparent === true ) return;

	this.renderObject( object, scene, camera, geometry, _classifyMaterials[ material.side ], group, lightsNode, clippingContext, 'lightProbeClassify' );

}

/**
 * Creates the material that replaces meshes of the given side in the
 * classification capture. It draws both sides and flags the side the original
 * material does not show, which is what a probe inside a closed mesh sees.
 *
 * @private
 * @param {number} side - The side of the replaced material.
 * @return {NodeMaterial} The classification material.
 */
function createClassifyMaterial( side ) {

	let backFace = float( 0.0 );

	if ( side === FrontSide ) backFace = select( frontFacing, float( 0.0 ), float( 1.0 ) );
	else if ( side === BackSide ) backFace = select( frontFacing, float( 1.0 ), float( 0.0 ) );

	const material = new MeshBasicNodeMaterial();
	material.side = DoubleSide;
	material.outputNode = vec4( backFace, 0.0, 0.0, 1.0 );

	return material;

}

/**
 * Lazily creates the shared capture camera: six 90° sub-cameras per batch slot,
 * each rendering into its own tile of the face atlas.
 *
 * @private
 * @param {number} near - Capture near plane.
 * @param {number} far - Capture far plane.
 */
function ensureCaptureCamera( near, far ) {

	if ( _captureCamera === null ) {

		const cameras = [];

		for ( let i = 0; i < PROBES_PER_BATCH * 6; i ++ ) {

			const camera = new PerspectiveCamera( 90, 1, near, far );
			camera.viewport = new Vector4();
			camera.up.fromArray( FACE_UP[ i % 6 ] );
			cameras.push( camera );

		}

		_captureCamera = new ArrayCamera( cameras );

	}

	for ( const camera of _captureCamera.cameras ) {

		if ( camera.near !== near || camera.far !== far ) {

			camera.near = near;
			camera.far = far;
			camera.updateProjectionMatrix();

		}

	}

}

/**
 * Sets the near plane of every capture sub-camera.
 *
 * @private
 * @param {number} near - The near plane.
 */
function setCaptureNear( near ) {

	for ( const camera of _captureCamera.cameras ) {

		camera.near = near;
		camera.updateProjectionMatrix();

	}

}

/**
 * Lazily pools the shared face atlas and batch render targets, recreating them
 * only when their dimensions change. Each capture sub-camera renders into its
 * own tile of the face atlas.
 *
 * @private
 * @param {number} cubemapSize - Resolution of each cubemap face.
 * @param {number} totalProbes - Number of probes (batch target height).
 */
function ensureBakeTargets( cubemapSize, totalProbes ) {

	if ( _faceTarget === null || _faceSize !== cubemapSize ) {

		if ( _faceTarget !== null ) _faceTarget.dispose();

		// One row of six face tiles per batch slot.
		_faceTarget = new RenderTarget( 6 * cubemapSize, PROBES_PER_BATCH * cubemapSize, {
			type: HalfFloatType,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			generateMipmaps: false
		} );

		_captureCamera.cameras.forEach( ( camera, i ) => {

			camera.viewport.set( ( i % 6 ) * cubemapSize, Math.floor( i / 6 ) * cubemapSize, cubemapSize, cubemapSize );

		} );

		// The classification capture: back-face flags and depth for visibility.
		if ( _classifyTarget !== null ) _classifyTarget.dispose();

		_classifyTarget = new RenderTarget( 6 * cubemapSize, PROBES_PER_BATCH * cubemapSize, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			generateMipmaps: false,
			depthTexture: new DepthTexture( 6 * cubemapSize, PROBES_PER_BATCH * cubemapSize )
		} );

		_faceSize = cubemapSize;

	}

	if ( _batchTarget === null || _batchProbes !== totalProbes ) {

		if ( _batchTarget !== null ) _batchTarget.dispose();

		// One row per probe: 9 coefficients x 6 faces x face blocks.
		_batchTarget = new RenderTarget( 9 * 6 * FACE_BLOCKS + 1, totalProbes, {
			type: FloatType,
			format: RGBAFormat,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false
		} );

		_batchProbes = totalProbes;

	}

}

/**
 * Lazily builds the shared bake materials and rebinds them to the current
 * face/batch textures. The SH projection material is rebuilt only when the
 * face size changes; the repack materials are static.
 *
 * @private
 * @param {number} cubemapSize - Resolution of each cubemap face.
 * @param {Texture} faceMap - The current face atlas texture.
 * @param {Texture} batchMap - The current batch render target texture.
 * @param {Texture} classifyMap - The current classification capture texture.
 * @param {DepthTexture} depthMap - The current classification capture depth texture.
 * @param {number} visibilityGridSize - The octahedral distance resolution.
 */
function ensureBakeMaterials( cubemapSize, faceMap, batchMap, classifyMap, depthMap, visibilityGridSize ) {

	if ( _repackMaterials === null ) {

		_faceNode = texture( faceMap );
		_batchNode = texture( batchMap );
		_classifyNode = texture( classifyMap );
		_depthNode = texture( depthMap );
		_classifyMaterials = [ FrontSide, BackSide, DoubleSide ].map( createClassifyMaterial );
		_batchStartUniform = uniform( 0, 'int' );
		_batchCountUniform = uniform( 0, 'int' );
		_nearUniform = uniform( 0.1 );
		_farUniform = uniform( 100 );
		_clearanceUniform = uniform( 0 );
		_distanceScaleUniform = uniform( 1 );
		_resolutionUniform = uniform( new Vector3() );
		_sliceZUniform = uniform( 0, 'int' );
		_repackMaterials = [];

		for ( let t = 0; t < 7; t ++ ) {

			const material = new NodeMaterial();
			material.outputNode = repackNode( _batchNode, t, _resolutionUniform, _sliceZUniform );
			material.depthTest = false;
			material.depthWrite = false;
			_repackMaterials.push( material );

		}

	} else {

		_faceNode.value = faceMap;
		_batchNode.value = batchMap;
		_classifyNode.value = classifyMap;
		_depthNode.value = depthMap;

	}

	if ( _shMaterial === null || _shFaceSize !== cubemapSize || _distanceResolution !== visibilityGridSize ) {

		if ( _shMaterial !== null ) {

			_shMaterial.dispose();
			_distanceMaterial.dispose();
			_fractionMaterial.dispose();

		}

		_shMaterial = new NodeMaterial();
		_shMaterial.outputNode = projectSHNode( _faceNode, cubemapSize, _batchStartUniform );
		_shMaterial.depthTest = false;
		_shMaterial.depthWrite = false;
		_shFaceSize = cubemapSize;
		_distanceResolution = visibilityGridSize;

		_fractionMaterial = new NodeMaterial();
		_fractionMaterial.outputNode = backFaceFractionNode( _classifyNode, _depthNode, cubemapSize, {
			batchStart: _batchStartUniform,
			near: _nearUniform,
			far: _farUniform
		} );
		_fractionMaterial.depthTest = false;
		_fractionMaterial.depthWrite = false;

		_distanceMaterial = new NodeMaterial();
		_distanceMaterial.outputNode = distanceMomentsNode( _depthNode, _batchNode, 9 * 6 * FACE_BLOCKS, cubemapSize, visibilityGridSize, {
			batchStart: _batchStartUniform,
			batchCount: _batchCountUniform,
			near: _nearUniform,
			far: _farUniform,
			distanceScale: _distanceScaleUniform,
			clearance: _clearanceUniform
		} );
		_distanceMaterial.depthTest = false;
		_distanceMaterial.depthWrite = false;

	}

}

/**
 * A 3D grid of L2 Spherical Harmonic irradiance probes that provides
 * position-dependent diffuse global illumination.
 *
 * This is the {@link WebGPURenderer} version of `LightProbeGrid`. The grid is a
 * {@link Light}, so adding it to the scene applies its baked irradiance to every
 * lit node material automatically. When using {@link WebGLRenderer}, import the
 * grid from `LightProbeGridWebGL.js` instead.
 *
 * The baked data is stored in a single RGBA `RenderTarget3D` atlas that packs
 * the nine L2 SH coefficients into seven sub-volumes stacked along Z. Baking is
 * fully GPU-resident: cubemap rendering, SH projection, and texture packing all
 * happen on the GPU with zero CPU readback.
 *
 * @augments Light
 * @three_import import { LightProbeGrid } from 'three/addons/lighting/LightProbeGrid.js';
 */
class LightProbeGrid extends Light {

	/**
	 * Constructs a new irradiance probe grid.
	 *
	 * The volume is centered at the object's position.
	 *
	 * @param {number} [width=1] - Full width of the volume along X.
	 * @param {number} [height=1] - Full height of the volume along Y.
	 * @param {number} [depth=1] - Full depth of the volume along Z.
	 * @param {number} [widthProbes] - Number of probes along X. Defaults to `Math.max( 2, Math.round( width ) + 1 )`.
	 * @param {number} [heightProbes] - Number of probes along Y. Defaults to `Math.max( 2, Math.round( height ) + 1 )`.
	 * @param {number} [depthProbes] - Number of probes along Z. Defaults to `Math.max( 2, Math.round( depth ) + 1 )`.
	 */
	constructor( width = 1, height = 1, depth = 1, widthProbes, heightProbes, depthProbes ) {

		super( 0xffffff, 1 );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLightProbeGrid = true;

		this.type = 'LightProbeGrid';

		/**
		 * The full width of the volume along X.
		 *
		 * @type {number}
		 */
		this.width = width;

		/**
		 * The full height of the volume along Y.
		 *
		 * @type {number}
		 */
		this.height = height;

		/**
		 * The full depth of the volume along Z.
		 *
		 * @type {number}
		 */
		this.depth = depth;

		/**
		 * The number of probes along each axis.
		 *
		 * @type {Vector3}
		 */
		this.resolution = new Vector3(
			widthProbes !== undefined ? widthProbes : Math.max( 2, Math.round( width ) + 1 ),
			heightProbes !== undefined ? heightProbes : Math.max( 2, Math.round( height ) + 1 ),
			depthProbes !== undefined ? depthProbes : Math.max( 2, Math.round( depth ) + 1 )
		);

		/**
		 * The world-space bounding box for the grid. Updated automatically
		 * by {@link LightProbeGrid#bake}.
		 *
		 * @type {Box3}
		 */
		this.boundingBox = new Box3();

		/**
		 * Distance in world units over which the grid contribution fades out
		 * past the volume boundary. `0` applies the contribution everywhere
		 * (clamped), which matches a single-volume setup. Use a small positive
		 * value to blend multiple overlapping grids.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.falloff = 0;

		/**
		 * Whether shading weighs each probe by whether it can see the surface, using
		 * distance moments recorded during the bake. This keeps light from leaking
		 * through walls between probes, at the cost of more texture reads per
		 * fragment. It can be changed at any time.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.visibility = false;

		/**
		 * Octahedral distance-map resolution per probe, excluding the border.
		 * Set before the first bake. Recreate the grid to change the resolution.
		 *
		 * @type {number}
		 * @default 8
		 */
		this.visibilityGridSize = DISTANCE_RESOLUTION;

		/**
		 * With {@link LightProbeGrid#visibility}, how far the shaded point is moved
		 * along its normal before the probe lookup, as a fraction of the smallest
		 * probe spacing.
		 *
		 * @type {number}
		 * @default 0.08
		 */
		this.normalBias = 0.08;

		/**
		 * With {@link LightProbeGrid#visibility}, how far the shaded point is moved
		 * toward the camera before the probe lookup, as a fraction of the smallest
		 * probe spacing.
		 *
		 * @type {number}
		 * @default 0.02
		 */
		this.viewBias = 0.02;

		/**
		 * The single RGBA atlas 3D texture storing all seven packed SH
		 * sub-volumes stacked along Z.
		 *
		 * @type {?Data3DTexture}
		 * @default null
		 */
		this.texture = null;

		/**
		 * Internal render target for GPU-resident baking.
		 *
		 * @private
		 * @type {?RenderTarget3D}
		 * @default null
		 */
		this._renderTarget = null;

		// Indirect captures read a snapshot while the live atlas is updated in place.
		this._bounceGrid = null;
		this._bouncePass = - 1;

		// Per-probe distance moments for visibility, and their normalization scale.
		this._distanceTarget = null;
		this._distanceScale = 1;

		// Per-probe irradiance for visibility shading, evaluated from the SH.
		this._irradianceTarget = null;
		this._irradianceMaterial = null;

		this.updateBoundingBox();

	}

	/**
	 * Returns the world-space position of the probe at grid indices (ix, iy, iz).
	 *
	 * @param {number} ix - X index.
	 * @param {number} iy - Y index.
	 * @param {number} iz - Z index.
	 * @param {Vector3} target - The target vector.
	 * @return {Vector3} The world-space position.
	 */
	getProbePosition( ix, iy, iz, target ) {

		const pos = this.position;
		const res = this.resolution;
		const w = this.width, h = this.height, d = this.depth;

		target.set(
			res.x > 1 ? pos.x - w / 2 + ix * w / ( res.x - 1 ) : pos.x,
			res.y > 1 ? pos.y - h / 2 + iy * h / ( res.y - 1 ) : pos.y,
			res.z > 1 ? pos.z - d / 2 + iz * d / ( res.z - 1 ) : pos.z
		);

		return target;

	}

	/**
	 * Updates the world-space bounding box from the current position and size.
	 */
	updateBoundingBox() {

		_size.set( this.width, this.height, this.depth );
		this.boundingBox.setFromCenterAndSize( this.position, _size );

		// Distance moments are normalized by twice the cell diagonal, which covers
		// every receiver a probe is blended into.

		const res = this.resolution;
		_size.divide( _position.set( Math.max( 1, res.x - 1 ), Math.max( 1, res.y - 1 ), Math.max( 1, res.z - 1 ) ) );
		this._distanceScale = 2 * _size.length();

	}

	/**
	 * Bakes probes by rendering cubemaps at each probe position and
	 * projecting to L2 SH. Optionally iterates additional passes to capture
	 * indirect bounces: each extra pass samples the previous pass's data as
	 * indirect light, accumulating one bounce per extra pass.
	 *
	 * Use `start` and `count` to bake a range and publish its cells immediately.
	 * Indices advance along X, then Z, then Y, filling horizontal layers from bottom
	 * to top. For incremental indirect bounces, finish the whole grid for `pass: 0`,
	 * then repeat with `pass: 1`, etc. Start each pass at index 0 to snapshot the
	 * previous pass before updating its cells.
	 *
	 * Shadow-casting instances of `SunLight` are temporarily replaced with
	 * equivalent directional lights, since their view-fitted shadow cascades
	 * cannot be frozen across probe renders.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene to render.
	 * @param {Object} [options] - Bake options.
	 * @param {number} [options.cubemapSize=8] - Resolution of each cubemap face. Must be a multiple of 4.
	 * @param {number} [options.near=0.1] - Near plane for the cube camera.
	 * @param {number} [options.far=100] - Far plane for the cube camera.
	 * @param {number} [options.bounces=0] - Additional bounce passes. Only available when baking the whole grid.
	 * @param {number} [options.start=0] - Index of the first probe to bake.
	 * @param {number} [options.count] - Number of probes to bake. Defaults to the remaining probes.
	 * @param {number} [options.pass=0] - Starting pass. Zero captures direct light; later passes sample the previous pass. Ranged calls require `bounces: 0`.
	 */
	bake( renderer, scene, options = {} ) {

		// The bake is node based, so it needs a WebGPURenderer.
		if ( renderer.isWebGPURenderer !== true ) {

			throw new Error( 'THREE.LightProbeGrid: .bake() requires a WebGPURenderer. For WebGLRenderer, use LightProbeGridWebGL.' );

		}

		// The bake issues GPU work immediately, so the renderer must be ready.
		if ( renderer.initialized === false ) {

			throw new Error( 'THREE.LightProbeGrid: .bake() called before the renderer is initialized. Use "await renderer.init();" first.' );

		}

		const res = this.resolution;
		const totalProbes = res.x * res.y * res.z;
		const {
			cubemapSize = 8,
			near = 0.1,
			far = 100,
			bounces = 0,
			start = 0,
			count = totalProbes - start,
			pass: firstPass = 0
		} = options;
		const end = start + count;

		if ( ! Number.isInteger( start ) || ! Number.isInteger( count ) || start < 0 || count < 0 || end > totalProbes ) {

			throw new RangeError( 'THREE.LightProbeGrid: Invalid probe range.' );

		}

		if ( ! Number.isInteger( firstPass ) || firstPass < 0 || ! Number.isInteger( bounces ) || bounces < 0 ) {

			throw new RangeError( 'THREE.LightProbeGrid: Pass and bounce counts must be non-negative integers.' );

		}

		if ( bounces > 0 && count !== totalProbes ) {

			throw new RangeError( 'THREE.LightProbeGrid: For ranged baking, use pass instead of bounces.' );

		}

		if ( count === 0 ) return;

		if ( firstPass > 0 && start > 0 && this._bouncePass !== firstPass ) {

			throw new Error( 'THREE.LightProbeGrid: Start each indirect pass at probe 0.' );

		}

		this._ensureTextures();
		this.updateBoundingBox();

		// Bind the pooled bake resources to the current textures.

		ensureCaptureCamera( near, far );
		ensureBakeTargets( cubemapSize, totalProbes );
		ensureBakeMaterials( cubemapSize, _faceTarget.texture, _batchTarget.texture, _classifyTarget.texture, _classifyTarget.depthTexture, this.visibilityGridSize );

		_nearUniform.value = near * CLASSIFY_NEAR_SCALE;
		_clearanceUniform.value = near * CLEARANCE_NEAR_PLANES;
		_farUniform.value = far;
		_distanceScaleUniform.value = this._distanceScale;
		_resolutionUniform.value.copy( res );

		// Save renderer / scene state to restore after the bake.

		const currentRenderTarget = renderer.getRenderTarget();
		const currentActiveCubeFace = renderer.getActiveCubeFace();
		const currentActiveMipmapLevel = renderer.getActiveMipmapLevel();
		const currentAutoClear = renderer.autoClear;
		const currentXrEnabled = renderer.xr.enabled;
		const currentInspectorEnabled = renderer.inspector.enabled;
		const currentMatrixWorldAutoUpdate = scene.matrixWorldAutoUpdate;
		const currentVisible = this.visible;
		const renderTarget = this._renderTarget;
		const currentViewport = renderTarget.viewport.clone();
		const shadowStates = [];
		let replacedSunLights = null;

		try {

			renderer.inspector.enabled = false;
			renderer.xr.enabled = false;
			this.visible = false;

			// Scene is static during the bake: update once, disable auto-update.

			if ( currentMatrixWorldAutoUpdate === true ) {

				scene.updateMatrixWorld( true );
				scene.matrixWorldAutoUpdate = false;

			}

			replacedSunLights = replaceSunLights( scene );

			// Render each shadow map once, not once per cube face.

			scene.traverse( ( object ) => {

				if ( object.isLight && object.castShadow && object.shadow ) {

					const shadow = object.shadow;
					shadowStates.push( { shadow, autoUpdate: shadow.autoUpdate } );
					shadow.autoUpdate = false;
					shadow.needsUpdate = true;

				}

			} );

			for ( let pass = firstPass; pass <= firstPass + bounces; pass ++ ) {

				this._updateBounceGrid( renderer, scene, pass, start );
				// Geometry is static during the bake, so distances are recorded once.
				this._captureProbes( renderer, scene, start, end, pass === 0 );
				this._repackProbes( renderer, start, end );
				this._updateIrradiance( renderer, start, end );

			}

		} finally {

			// Restore renderer / scene state (pooled targets and materials kept).

			renderTarget.viewport.copy( currentViewport );
			renderer.setRenderTarget( currentRenderTarget, currentActiveCubeFace, currentActiveMipmapLevel );
			renderer.autoClear = currentAutoClear;
			renderer.xr.enabled = currentXrEnabled;
			scene.matrixWorldAutoUpdate = currentMatrixWorldAutoUpdate;

			for ( const { shadow, autoUpdate } of shadowStates ) shadow.autoUpdate = autoUpdate;

			if ( replacedSunLights !== null ) restoreSunLights( scene, replacedSunLights );

			this.visible = currentVisible;
			if ( this._bounceGrid !== null ) this._bounceGrid.removeFromParent();

			renderer.inspector.enabled = currentInspectorEnabled;

		}

	}

	/**
	 * Snapshots each indirect pass before its first range overwrites the live atlas.
	 * A separate light keeps the capture and main-view texture bindings stable.
	 *
	 * @private
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene to capture.
	 * @param {number} pass - The bounce pass.
	 * @param {number} start - The first probe index.
	 */
	_updateBounceGrid( renderer, scene, pass, start ) {

		if ( this._bounceGrid === null ) {

			const res = this.resolution;
			this._bounceGrid = new LightProbeGrid( this.width, this.height, this.depth, res.x, res.y, res.z );
			this._bounceGrid.visibilityGridSize = this.visibilityGridSize;
			this._bounceGrid._ensureTextures();
			renderer.initRenderTarget( this._bounceGrid._renderTarget );

		}

		if ( pass === 0 ) {

			if ( start === 0 ) this._bouncePass = - 1;

		} else if ( start === 0 ) {

			const renderTarget = this._renderTarget;

			renderer.initRenderTarget( renderTarget );
			_copyRegion.min.set( 0, 0, 0 );
			_copyRegion.max.set( renderTarget.width, renderTarget.height, renderTarget.depth );
			renderer.copyTextureToTexture( renderTarget.texture, this._bounceGrid.texture, _copyRegion );
			this._bouncePass = pass;

			const irradianceTarget = this._irradianceTarget;
			_copyRegion.max.set( irradianceTarget.width, irradianceTarget.height, 1 );
			renderer.initRenderTarget( this._bounceGrid._irradianceTarget );
			renderer.copyTextureToTexture( irradianceTarget.texture, this._bounceGrid._irradianceTarget.texture, _copyRegion );

			const distanceTarget = this._distanceTarget;
			renderer.initRenderTarget( this._bounceGrid._distanceTarget );
			_copyRegion.max.set( distanceTarget.width, distanceTarget.height, 1 );
			renderer.copyTextureToTexture( distanceTarget.texture, this._bounceGrid._distanceTarget.texture, _copyRegion );

		}

		const bounceGrid = this._bounceGrid;
		bounceGrid.boundingBox.copy( this.boundingBox );
		// The direct pass adds the grid unlit, so all passes share the lights and their shaders.
		bounceGrid.intensity = pass === 0 ? 0 : this.intensity;
		bounceGrid.falloff = this.falloff;
		bounceGrid.visibility = this.visibility;
		bounceGrid.normalBias = this.normalBias;
		bounceGrid.viewBias = this.viewBias;
		bounceGrid._distanceScale = this._distanceScale;
		scene.add( bounceGrid );

	}

	/**
	 * Captures the cube faces of probe batches in single passes and projects
	 * their SH coefficients into the batch target, one row per probe in bake order.
	 *
	 * @private
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene to capture.
	 * @param {number} start - The first probe index.
	 * @param {number} end - The exclusive end probe index.
	 * @param {boolean} recordDistances - Whether to record the probes' distance moments.
	 */
	_captureProbes( renderer, scene, start, end, recordDistances ) {

		// The radiance capture near plane, restored after each classification capture.
		const near = _captureCamera.cameras[ 0 ].near;

		const { x: nx, z: nz } = this.resolution;
		const probesPerLayer = nx * nz;
		const cameras = _captureCamera.cameras;
		const currentRenderObjectFunction = renderer.getRenderObjectFunction();

		for ( let batchStart = start; batchStart < end; batchStart += PROBES_PER_BATCH ) {

			const batchCount = Math.min( PROBES_PER_BATCH, end - batchStart );

			for ( let slot = 0; slot < PROBES_PER_BATCH; slot ++ ) {

				const probeIndex = batchStart + slot;

				if ( slot < batchCount ) {

					const ix = probeIndex % nx;
					const iy = Math.floor( probeIndex / probesPerLayer );
					const iz = Math.floor( probeIndex / nx ) % nz;

					this.getProbePosition( ix, iy, iz, _position );

				}

				for ( let face = 0; face < 6; face ++ ) {

					const camera = cameras[ slot * 6 + face ];

					// unused slots draw nothing, keeping the camera count fixed
					if ( slot < batchCount ) {

						camera.layers.set( 0 );
						camera.position.copy( _position );
						camera.lookAt( _target.fromArray( FACE_FORWARD[ face ] ).add( _position ) );
						camera.updateMatrixWorld();

					} else {

						camera.layers.disableAll();

					}

				}

			}

			renderer.autoClear = true;
			renderer.setRenderTarget( _faceTarget );
			renderer.render( scene, _captureCamera );

			renderer.autoClear = false;
			_batchStartUniform.value = batchStart;
			_batchTarget.viewport.set( 0, batchStart, 9 * 6 * FACE_BLOCKS, batchCount );
			renderer.setRenderTarget( _batchTarget );
			_quad.material = _shMaterial;
			_quad.render( renderer );

			if ( recordDistances === true ) {

				// The tile rows covering this batch; the shader skips other probes.

				const distanceTarget = this._distanceTarget;
				const firstRow = Math.floor( batchStart / DISTANCE_COLUMNS );
				const lastRow = Math.floor( ( batchStart + batchCount - 1 ) / DISTANCE_COLUMNS );

				// Capture double-sided depth and back-face flags with a smaller near plane.

				setCaptureNear( _nearUniform.value );

				try {

					renderer.setRenderObjectFunction( classifyRenderObject );
					renderer.autoClear = true;
					renderer.setRenderTarget( _classifyTarget );
					renderer.render( scene, _captureCamera );

				} finally {

					renderer.autoClear = false;
					renderer.setRenderObjectFunction( currentRenderObjectFunction );
					setCaptureNear( near );

				}

				_batchTarget.viewport.set( 9 * 6 * FACE_BLOCKS, batchStart, 1, batchCount );
				renderer.setRenderTarget( _batchTarget );
				_quad.material = _fractionMaterial;
				_quad.render( renderer );

				_batchCountUniform.value = batchCount;
				const tileHeight = this.visibilityGridSize + 2;
				distanceTarget.viewport.set( 0, firstRow * tileHeight, distanceTarget.width, ( lastRow - firstRow + 1 ) * tileHeight );
				renderer.setRenderTarget( distanceTarget );
				_quad.material = _distanceMaterial;
				_quad.render( renderer );

			}

		}

	}

	/**
	 * Packs a probe range into the live atlas, including its boundary padding.
	 *
	 * @private
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {number} start - The first probe index.
	 * @param {number} end - The exclusive end probe index.
	 */
	_repackProbes( renderer, start, end ) {

		const { x: nx, y: ny, z: nz } = this.resolution;
		const probesPerLayer = nx * nz;
		const startY = Math.floor( start / probesPerLayer );
		const endY = Math.floor( end / probesPerLayer );
		const paddedSlices = nz + 2 * ATLAS_PADDING;
		const renderTarget = this._renderTarget;

		// Map the horizontal bake range to contiguous rows in each Z slice.
		for ( let iz = 0; iz < nz; iz ++ ) {

			const sliceStart = startY * nx + MathUtils.clamp( start % probesPerLayer - iz * nx, 0, nx );
			const sliceEnd = endY * nx + MathUtils.clamp( end % probesPerLayer - iz * nx, 0, nx );

			for ( let probeIndex = sliceStart; probeIndex < sliceEnd; ) {

				const ix = probeIndex % nx;
				const iy = Math.floor( probeIndex / nx );

				// Coalesce complete rows within a slice into one rectangle.
				const width = Math.min( nx - ix, sliceEnd - probeIndex );
				let height = 1;

				if ( width === nx ) {

					height = Math.min( ny - iy, Math.floor( ( sliceEnd - probeIndex ) / nx ) );

				}

				renderTarget.viewport.set( ix, iy, width, height );
				_sliceZUniform.value = iz;

				for ( let t = 0; t < 7; t ++ ) {

					_quad.material = _repackMaterials[ t ];
					const base = t * paddedSlices;

					renderer.setRenderTarget( renderTarget, base + ATLAS_PADDING + iz );
					_quad.render( renderer );

					if ( iz === 0 ) {

						renderer.setRenderTarget( renderTarget, base );
						_quad.render( renderer );

					}

					if ( iz === nz - 1 ) {

						renderer.setRenderTarget( renderTarget, base + ATLAS_PADDING + nz );
						_quad.render( renderer );

					}

				}

				probeIndex += width * height;

			}

		}

	}

	/**
	 * Evaluates the irradiance tiles of a probe range from the live SH atlas.
	 *
	 * @private
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {number} start - The first probe index.
	 * @param {number} end - The exclusive end probe index.
	 */
	_updateIrradiance( renderer, start, end ) {

		if ( this._irradianceMaterial === null ) {

			this._irradianceStart = uniform( 0, 'int' );
			this._irradianceEnd = uniform( 0, 'int' );

			this._irradianceMaterial = new NodeMaterial();
			this._irradianceMaterial.outputNode = irradianceNode( texture3D( this.texture ), this.resolution.clone(), this._irradianceStart, this._irradianceEnd );
			this._irradianceMaterial.depthTest = false;
			this._irradianceMaterial.depthWrite = false;

		}

		// The tile rows covering the range; the shader skips other probes.

		const target = this._irradianceTarget;
		const firstRow = Math.floor( start / DISTANCE_COLUMNS );
		const lastRow = Math.floor( ( end - 1 ) / DISTANCE_COLUMNS );

		this._irradianceStart.value = start;
		this._irradianceEnd.value = end;

		target.viewport.set( 0, firstRow * IRRADIANCE_TILE, target.width, ( lastRow - firstRow + 1 ) * IRRADIANCE_TILE );
		renderer.setRenderTarget( target );
		_quad.material = this._irradianceMaterial;
		_quad.render( renderer );

	}

	/**
	 * Ensures the SH, irradiance and visibility atlases exist.
	 *
	 * @private
	 */
	_ensureTextures() {

		if ( this._renderTarget !== null ) return;

		const res = this.resolution;
		const nx = res.x, ny = res.y, nz = res.z;

		// Atlas depth: 7 sub-volumes, each with ATLAS_PADDING slices at both ends.
		const atlasDepth = 7 * ( nz + 2 * ATLAS_PADDING );

		this._renderTarget = new RenderTarget3D( nx, ny, atlasDepth, {
			type: HalfFloatType,
			format: RGBAFormat,
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			generateMipmaps: false,
			depthBuffer: false
		} );

		// Irradiance per probe for visibility shading, as octahedral tiles in bake order.

		const rows = Math.ceil( nx * ny * nz / DISTANCE_COLUMNS );
		const irradianceOptions = {
			type: HalfFloatType,
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			generateMipmaps: false,
			depthBuffer: false
		};

		this._irradianceTarget = new RenderTarget( DISTANCE_COLUMNS * IRRADIANCE_TILE, rows * IRRADIANCE_TILE, irradianceOptions );

		// Distance moments per probe, as octahedral tiles in bake order.

		const distanceTile = this.visibilityGridSize + 2;

		this._distanceTarget = new RenderTarget( DISTANCE_COLUMNS * distanceTile, rows * distanceTile, {
			type: HalfFloatType,
			format: RGFormat,
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			generateMipmaps: false,
			depthBuffer: false
		} );

		this.texture = this._renderTarget.texture;

	}

	/**
	 * Frees GPU resources.
	 */
	dispose() {

		if ( this._bounceGrid !== null ) {

			this._bounceGrid.dispose();
			this._bounceGrid = null;
			this._bouncePass = - 1;

		}

		if ( this._renderTarget !== null ) {

			this._distanceTarget.dispose();
			this._irradianceTarget.dispose();
			this._distanceTarget = null;
			this._irradianceTarget = null;
			this._renderTarget.dispose();
			this._renderTarget = null;
			this.texture = null;

		}

		if ( this._irradianceMaterial !== null ) {

			this._irradianceMaterial.dispose();
			this._irradianceMaterial = null;

		}

		super.dispose();

	}

}

LightProbeGrid.registerNode( LightProbeGridNode );

export { LightProbeGrid };
