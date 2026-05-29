import {
	Box3,
	CubeCamera,
	CubeRenderTarget,
	Data3DTexture,
	FloatType,
	HalfFloatType,
	LinearFilter,
	LightingNode,
	NearestFilter,
	NodeMaterial,
	Object3D,
	QuadMesh,
	RGBAFormat,
	RenderTarget,
	RenderTarget3D,
	Vector3,
	Vector4
} from 'three/webgpu';

import {
	Fn,
	If,
	Loop,
	clamp,
	cubeTexture,
	dot,
	float,
	int,
	ivec2,
	modelPosition,
	max,
	normalize,
	normalWorld,
	nodeProxy,
	positionWorld,
	sqrt,
	texture,
	texture3D,
	textureLoad,
	uniform,
	vec3,
	vec4,
	viewportCoordinate
} from 'three/tsl';

const ATLAS_PADDING = 1;

let _quadMesh = null;
let _shMaterial = null;
let _shEnvMapNode = null;
let _lastCubemapSize = 0;
let _repackMaterials = null;
let _cubeRenderTarget = null;
let _cubeCamera = null;
let _cachedCubemapSize = 0;
let _cachedNear = 0;
let _cachedFar = 0;
let _batchTarget = null;
let _batchTargetProbes = 0;

const _emptyTexture3D = /*@__PURE__*/ new Data3DTexture( new Uint8Array( 4 ), 1, 1, 1 );
_emptyTexture3D.needsUpdate = true;

const _position = /*@__PURE__*/ new Vector3();
const _size = /*@__PURE__*/ new Vector3();
const _currentViewport = /*@__PURE__*/ new Vector4();
const _currentScissor = /*@__PURE__*/ new Vector4();

/**
 * WebGPU 3D grid of L2 spherical harmonic irradiance probes.
 *
 * @augments Object3D
 * @three_import import { LightProbeGrid } from 'three/addons/lighting/LightProbeGridGPU.js';
 */
class LightProbeGrid extends Object3D {

	constructor( width = 1, height = 1, depth = 1, widthProbes, heightProbes, depthProbes ) {

		super();

		this.isLightProbeGrid = true;
		this.isLight = true;

		this.width = width;
		this.height = height;
		this.depth = depth;

		this.resolution = new Vector3(
			widthProbes !== undefined ? widthProbes : Math.max( 2, Math.round( width ) + 1 ),
			heightProbes !== undefined ? heightProbes : Math.max( 2, Math.round( height ) + 1 ),
			depthProbes !== undefined ? depthProbes : Math.max( 2, Math.round( depth ) + 1 )
		);

		this.boundingBox = new Box3();
		this.texture = null;
		this._renderTarget = null;
		this.lightNode = lightProbeGrid();
		this.lightNode.probes = this;

		this.updateBoundingBox();

	}

	setSize( width = 1, height = 1, depth = 1, widthProbes, heightProbes, depthProbes ) {

		const resolutionX = widthProbes !== undefined ? widthProbes : Math.max( 2, Math.round( width ) + 1 );
		const resolutionY = heightProbes !== undefined ? heightProbes : Math.max( 2, Math.round( height ) + 1 );
		const resolutionZ = depthProbes !== undefined ? depthProbes : Math.max( 2, Math.round( depth ) + 1 );
		const sizeChanged = this.width !== width || this.height !== height || this.depth !== depth ||
			this.resolution.x !== resolutionX || this.resolution.y !== resolutionY || this.resolution.z !== resolutionZ;

		if ( sizeChanged ) {

			this.dispose();

		}

		this.width = width;
		this.height = height;
		this.depth = depth;
		this.resolution.set( resolutionX, resolutionY, resolutionZ );
		this.updateBoundingBox();

		return this;

	}

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

	updateBoundingBox() {

		_size.set( this.width, this.height, this.depth );
		this.boundingBox.setFromCenterAndSize( this.position, _size );

	}

	async bake( renderer, scene, options = {} ) {

		return bakeLightProbeGrid( renderer, scene, this, {
			...options,
			lightProbeNode: options.lightProbeNode || this.lightNode
		} );

	}

	_ensureTextures() {

		if ( this._renderTarget !== null ) return;

		const res = this.resolution;
		const atlasDepth = 7 * ( res.z + 2 * ATLAS_PADDING );

		const rt = new RenderTarget3D( res.x, res.y, atlasDepth, {
			format: RGBAFormat,
			type: FloatType,
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			generateMipmaps: false,
			depthBuffer: false
		} );

		this._renderTarget = rt;
		this.texture = rt.texture;

	}

	dispose() {

		if ( this._renderTarget !== null ) {

			this._renderTarget.dispose();
			this._renderTarget = null;
			this.texture = null;

		}

	}

}

class LightProbeGridNode extends LightingNode {

	static get type() {

		return 'LightProbeGridNode';

	}

	constructor( probes = null ) {

		super();

		this.isLightProbeGridNode = true;

		this.probes = probes;
		this.texture3DNode = texture3D( _emptyTexture3D );
		this.probesMin = uniform( new Vector3() );
		this.probesMax = uniform( new Vector3( 1, 1, 1 ) );
		this.probesResolution = uniform( new Vector3( 1, 1, 1 ) );
		this.enabled = uniform( false );
		this.updateType = 'render';

		this.update();

	}

	update() {

		const probes = this.probes;

		if ( probes && probes.texture ) {

			probes.updateBoundingBox();

			this.texture3DNode.value = probes.texture;
			this.probesMin.value.copy( probes.boundingBox.min );
			this.probesMax.value.copy( probes.boundingBox.max );
			this.probesResolution.value.copy( probes.resolution );
			this.enabled.value = probes.visible;

		} else {

			this.texture3DNode.value = _emptyTexture3D;
			this.probesMin.value.set( 0, 0, 0 );
			this.probesMax.value.set( 1, 1, 1 );
			this.probesResolution.value.set( 1, 1, 1 );
			this.enabled.value = false;

		}

	}

	setup( builder ) {

		const worldPos = builder.context.positionWorld || positionWorld;
		const worldNormal = builder.context.normalWorld || normalWorld;
		const gridRange = this.probesMax.sub( this.probesMin );
		const lightProbeGridCount = builder.lightsNode ? builder.lightsNode.getLights().filter( ( light ) => light.isLightProbeGrid || light.isLightProbeGridNode ).length : 0;
		let enabled = this.enabled;

		if ( lightProbeGridCount > 1 ) {

			const objectInBounds = modelPosition.greaterThanEqual( this.probesMin ).all().and( modelPosition.lessThanEqual( this.probesMax ).all() );
			enabled = enabled.and( objectInBounds );

		}

		const resMinusOne = this.probesResolution.sub( 1.0 );
		const probeSpacing = gridRange.div( resMinusOne );
		const samplePos = worldPos.add( worldNormal.mul( probeSpacing ).mul( 0.5 ) );
		const uvw = clamp( samplePos.sub( this.probesMin ).div( gridRange ), 0.0, 1.0 )
			.mul( resMinusOne )
			.div( this.probesResolution )
			.add( vec3( 0.5 ).div( this.probesResolution ) );

		const irradiance = enabled.select(
			sampleLightProbeGridTexture( this.texture3DNode, uvw, worldNormal, this.probesResolution ),
			vec3( 0.0 )
		);

		builder.context.irradiance.addAssign( irradiance );

	}

}

const _sampleLightProbeGridTexture = /*@__PURE__*/ Fn( ( [ probesSH, uvw, worldNormal, probesResolution ] ) => {

	const nz = probesResolution.z;
	const paddedSlices = nz.add( 2.0 );
	const atlasDepth = paddedSlices.mul( 7.0 );
	const uvZBase = uvw.z.mul( nz ).add( 1.0 );

	const s0 = probesSH.sample( vec3( uvw.xy, uvZBase.div( atlasDepth ) ) );
	const s1 = probesSH.sample( vec3( uvw.xy, uvZBase.add( paddedSlices ).div( atlasDepth ) ) );
	const s2 = probesSH.sample( vec3( uvw.xy, uvZBase.add( paddedSlices.mul( 2.0 ) ).div( atlasDepth ) ) );
	const s3 = probesSH.sample( vec3( uvw.xy, uvZBase.add( paddedSlices.mul( 3.0 ) ).div( atlasDepth ) ) );
	const s4 = probesSH.sample( vec3( uvw.xy, uvZBase.add( paddedSlices.mul( 4.0 ) ).div( atlasDepth ) ) );
	const s5 = probesSH.sample( vec3( uvw.xy, uvZBase.add( paddedSlices.mul( 5.0 ) ).div( atlasDepth ) ) );
	const s6 = probesSH.sample( vec3( uvw.xy, uvZBase.add( paddedSlices.mul( 6.0 ) ).div( atlasDepth ) ) );

	const c0 = s0.xyz;
	const c1 = vec3( s0.w, s1.xy );
	const c2 = vec3( s1.zw, s2.x );
	const c3 = s2.yzw;
	const c4 = s3.xyz;
	const c5 = vec3( s3.w, s4.xy );
	const c6 = vec3( s4.zw, s5.x );
	const c7 = s5.yzw;
	const c8 = s6.xyz;

	const x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;

	let result = c0.mul( 0.886227 );
	result = result.add( c1.mul( 2.0 * 0.511664 ).mul( y ) );
	result = result.add( c2.mul( 2.0 * 0.511664 ).mul( z ) );
	result = result.add( c3.mul( 2.0 * 0.511664 ).mul( x ) );
	result = result.add( c4.mul( 2.0 * 0.429043 ).mul( x ).mul( y ) );
	result = result.add( c5.mul( 2.0 * 0.429043 ).mul( y ).mul( z ) );
	result = result.add( c6.mul( z.mul( z ).mul( 0.743125 ).sub( 0.247708 ) ) );
	result = result.add( c7.mul( 2.0 * 0.429043 ).mul( x ).mul( z ) );
	result = result.add( c8.mul( 0.429043 ).mul( x.mul( x ).sub( y.mul( y ) ) ) );

	return max( result, vec3( 0.0 ) );

} );

function sampleLightProbeGridTexture( probesTexture, uvw, worldNormal, probesResolution ) {

	const textureNode = probesTexture && probesTexture.isTexture3DNode ? probesTexture : texture3D( probesTexture || _emptyTexture3D );

	return _sampleLightProbeGridTexture( textureNode, uvw, normalize( worldNormal ), probesResolution );

}

async function bakeLightProbeGrid( renderer, scene, probes, options = {} ) {

	_ensureLightProbeGridNode( renderer );

	await renderer.init();

	const { bounces = 0, lightProbeNode = null } = options;
	const { cubeRenderTarget, cubeCamera } = _ensureBakeResources( options );

	probes._ensureTextures();
	probes.updateBoundingBox();

	const res = probes.resolution;
	const totalProbes = res.x * res.y * res.z;
	const batchTarget = _ensureBatchTarget( totalProbes );

	const currentRenderTarget = renderer.getRenderTarget();
	const currentActiveCubeFace = renderer.getActiveCubeFace();
	const currentActiveMipmapLevel = renderer.getActiveMipmapLevel();
	renderer.getViewport( _currentViewport );
	renderer.getScissor( _currentScissor );
	const currentScissorTest = renderer.getScissorTest();
	const currentAutoClear = renderer.autoClear;
	const currentMatrixWorldAutoUpdate = scene.matrixWorldAutoUpdate;
	const currentVisible = probes.visible;

	const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

	try {

		if ( currentMatrixWorldAutoUpdate === true ) {

			scene.updateMatrixWorld( true );
			scene.matrixWorldAutoUpdate = false;

		}

		renderer.shadowMap.autoUpdate = false;
		renderer.shadowMap.needsUpdate = true;

		_ensureRepackResources();

		const paddedSlices = res.z + 2 * ATLAS_PADDING;
		const rt = probes._renderTarget;

		for ( let pass = 0; pass <= bounces; pass ++ ) {

			probes.visible = pass > 0;

			if ( lightProbeNode !== null ) {

				lightProbeNode.update();

			}

			renderer.autoClear = currentAutoClear;
			renderer.setViewport( 0, 0, 9, totalProbes );
			renderer.setScissor( 0, 0, 9, totalProbes );
			renderer.setScissorTest( false );
			renderer.setRenderTarget( batchTarget );
			batchTarget.scissorTest = false;
			batchTarget.viewport.set( 0, 0, 9, totalProbes );
			renderer.clear();

			batchTarget.scissorTest = true;
			renderer.setScissorTest( true );

			for ( let iz = 0; iz < res.z; iz ++ ) {

				for ( let iy = 0; iy < res.y; iy ++ ) {

					for ( let ix = 0; ix < res.x; ix ++ ) {

						const probeIndex = ix + iy * res.x + iz * res.x * res.y;

						probes.getProbePosition( ix, iy, iz, _position );
						cubeCamera.position.copy( _position );
						renderer.autoClear = currentAutoClear;
						cubeCamera.update( renderer, scene );

						_shEnvMapNode.value = cubeRenderTarget.texture;
						_quadMesh.material = _shMaterial;
						renderer.autoClear = false;
						renderer.setRenderTarget( batchTarget );
						renderer.setViewport( 0, probeIndex, 9, 1 );
						renderer.setScissor( 0, probeIndex, 9, 1 );
						renderer.setScissorTest( true );
						batchTarget.viewport.set( 0, probeIndex, 9, 1 );
						batchTarget.scissor.set( 0, probeIndex, 9, 1 );
						_quadMesh.render( renderer );

					}

				}

			}

			rt.scissorTest = false;
			renderer.autoClear = false;

			for ( let textureIndex = 0; textureIndex < 7; textureIndex ++ ) {

				const material = _repackMaterials[ textureIndex ];
				material.batchTextureNode.value = batchTarget.texture;
				material.resolutionNode.value.copy( res );
				_quadMesh.material = material;

				for ( let iz = 0; iz < res.z; iz ++ ) {

					material.sliceZNode.value = iz;
					renderer.setRenderTarget( rt, textureIndex * paddedSlices + ATLAS_PADDING + iz );
					renderer.setViewport( 0, 0, res.x, res.y );
					renderer.setScissor( 0, 0, res.x, res.y );
					renderer.setScissorTest( false );
					rt.viewport.set( 0, 0, res.x, res.y );
					_quadMesh.render( renderer );

				}

				material.sliceZNode.value = 0;
				renderer.setRenderTarget( rt, textureIndex * paddedSlices );
				renderer.setViewport( 0, 0, res.x, res.y );
				renderer.setScissor( 0, 0, res.x, res.y );
				renderer.setScissorTest( false );
				rt.viewport.set( 0, 0, res.x, res.y );
				_quadMesh.render( renderer );

				material.sliceZNode.value = res.z - 1;
				renderer.setRenderTarget( rt, textureIndex * paddedSlices + ATLAS_PADDING + res.z );
				renderer.setViewport( 0, 0, res.x, res.y );
				renderer.setScissor( 0, 0, res.x, res.y );
				renderer.setScissorTest( false );
				rt.viewport.set( 0, 0, res.x, res.y );
				_quadMesh.render( renderer );

			}

		}

	} finally {

		probes.visible = currentVisible;

		if ( lightProbeNode !== null ) {

			lightProbeNode.update();

		}

		renderer.autoClear = currentAutoClear;
		renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
		scene.matrixWorldAutoUpdate = currentMatrixWorldAutoUpdate;
		renderer.setRenderTarget( currentRenderTarget, currentActiveCubeFace, currentActiveMipmapLevel );
		renderer.setViewport( _currentViewport );
		renderer.setScissor( _currentScissor );
		renderer.setScissorTest( currentScissorTest );

	}

}

function _ensureLightProbeGridNode( renderer ) {

	const library = renderer.library;

	if ( library && library.getLightNodeClass( LightProbeGrid ) === null ) {

		library.addLight( LightProbeGridNode, LightProbeGrid );

	}

	const lighting = renderer.lighting;

	if ( lighting && lighting._lightProbeGridPatched !== true ) {

		const getNode = lighting.getNode.bind( lighting );
		const createNode = lighting.createNode.bind( lighting );

		lighting.getNode = function ( scene ) {

			return _patchLightsNode( getNode( scene ) );

		};

		lighting.createNode = function ( lights = [] ) {

			return _patchLightsNode( createNode( _unwrapLightProbeGridNodes( lights ) ) );

		};

		lighting._lightProbeGridPatched = true;

	}

}

function _patchLightsNode( lightsNode ) {

	if ( lightsNode && lightsNode._lightProbeGridPatched !== true ) {

		const setLights = lightsNode.setLights.bind( lightsNode );

		lightsNode.setLights = function ( lights ) {

			return setLights( _unwrapLightProbeGridNodes( lights ) );

		};

		lightsNode._lightProbeGridPatched = true;

	}

	return lightsNode;

}

function _unwrapLightProbeGridNodes( lights ) {

	return lights.map( ( light ) => light && light.isLightProbeGrid ? light.lightNode : light );

}

function _ensureQuadMesh() {

	if ( _quadMesh === null ) _quadMesh = new QuadMesh();

}

function _ensureBakeResources( options ) {

	const { cubemapSize = 8, near = 0.1, far = 100 } = options;

	if ( _cubeRenderTarget === null || cubemapSize !== _cachedCubemapSize || near !== _cachedNear || far !== _cachedFar ) {

		if ( _cubeRenderTarget !== null ) _cubeRenderTarget.dispose();

		_cubeRenderTarget = new CubeRenderTarget( cubemapSize, {
			type: HalfFloatType,
			generateMipmaps: false,
			depthBuffer: true
		} );
		_cubeCamera = new CubeCamera( near, far, _cubeRenderTarget );
		_cachedCubemapSize = cubemapSize;
		_cachedNear = near;
		_cachedFar = far;

	}

	_ensureSHMaterial( cubemapSize );

	return { cubeRenderTarget: _cubeRenderTarget, cubeCamera: _cubeCamera };

}

function _ensureBatchTarget( totalProbes ) {

	if ( _batchTarget === null || _batchTargetProbes !== totalProbes ) {

		if ( _batchTarget !== null ) _batchTarget.dispose();

		_batchTarget = new RenderTarget( 9, totalProbes, {
			type: FloatType,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false
		} );

		_batchTargetProbes = totalProbes;

	}

	return _batchTarget;

}

function _ensureSHMaterial( cubemapSize ) {

	_ensureQuadMesh();

	if ( _shMaterial !== null && cubemapSize === _lastCubemapSize ) return;

	if ( _shMaterial !== null ) _shMaterial.dispose();

	_shEnvMapNode = cubeTexture();

	const material = new NodeMaterial();
	material.fragmentNode = _projectSH( _shEnvMapNode, cubemapSize );
	material.depthTest = false;
	material.depthWrite = false;
	material.name = 'LightProbeGridGPU.SHProjection';

	_shMaterial = material;
	_lastCubemapSize = cubemapSize;

}

function _projectSH( envMap, cubemapSize ) {

	return Fn( () => {

		const coefIndex = int( viewportCoordinate.x );
		const accum0 = vec3( 0.0 ).toVar();
		const accum1 = vec3( 0.0 ).toVar();
		const accum2 = vec3( 0.0 ).toVar();
		const accum3 = vec3( 0.0 ).toVar();
		const accum4 = vec3( 0.0 ).toVar();
		const accum5 = vec3( 0.0 ).toVar();
		const accum6 = vec3( 0.0 ).toVar();
		const accum7 = vec3( 0.0 ).toVar();
		const accum8 = vec3( 0.0 ).toVar();
		const totalWeight = float( 0.0 ).toVar();
		const pixelSize = float( 2.0 / cubemapSize );

		Loop( { start: int( 0 ), end: int( 6 ), type: 'int', condition: '<' }, ( { i: face } ) => {

			Loop( { start: int( 0 ), end: int( cubemapSize ), type: 'int', name: 'iy', condition: '<' }, ( { iy } ) => {

				Loop( { start: int( 0 ), end: int( cubemapSize ), type: 'int', name: 'ix', condition: '<' }, ( { ix } ) => {

					const col = float( ix ).add( 0.5 ).mul( pixelSize ).sub( 1.0 );
					const row = float( 1.0 ).sub( float( iy ).add( 0.5 ).mul( pixelSize ) );
					const coord = vec3( 1.0, row, col ).toVar();

					If( face.equal( 0 ), () => {

						coord.assign( vec3( 1.0, row, col ) );

					} ).ElseIf( face.equal( 1 ), () => {

						coord.assign( vec3( col.negate(), 1.0, row.negate() ) );

					} ).ElseIf( face.equal( 2 ), () => {

						coord.assign( vec3( col.negate(), row, 1.0 ) );

					} ).ElseIf( face.equal( 3 ), () => {

						coord.assign( vec3( - 1.0, row, col.negate() ) );

					} ).ElseIf( face.equal( 4 ), () => {

						coord.assign( vec3( col.negate(), - 1.0, row ) );

					} ).Else( () => {

						coord.assign( vec3( col, row, - 1.0 ) );

					} );

					const lengthSq = dot( coord, coord );
					const weight = float( 4.0 ).div( sqrt( lengthSq ).mul( lengthSq ) );
					totalWeight.addAssign( weight );

					const dir = normalize( coord );
					const cw = envMap.sample( coord ).rgb.mul( weight );

					accum0.addAssign( cw.mul( 0.282095 ) );
					accum1.addAssign( cw.mul( 0.488603 ).mul( dir.y ) );
					accum2.addAssign( cw.mul( 0.488603 ).mul( dir.z ) );
					accum3.addAssign( cw.mul( 0.488603 ).mul( dir.x ) );
					accum4.addAssign( cw.mul( 1.092548 ).mul( dir.x ).mul( dir.y ) );
					accum5.addAssign( cw.mul( 1.092548 ).mul( dir.y ).mul( dir.z ) );
					accum6.addAssign( cw.mul( 0.315392 ).mul( dir.z.mul( dir.z ).mul( 3.0 ).sub( 1.0 ) ) );
					accum7.addAssign( cw.mul( 1.092548 ).mul( dir.x ).mul( dir.z ) );
					accum8.addAssign( cw.mul( 0.546274 ).mul( dir.x.mul( dir.x ).sub( dir.y.mul( dir.y ) ) ) );

				} );

			} );

		} );

		const norm = float( 4.0 * Math.PI ).div( totalWeight );
		const accum = vec3( 0.0 ).toVar();

		If( coefIndex.equal( 0 ), () => {

			accum.assign( accum0 );

		} ).ElseIf( coefIndex.equal( 1 ), () => {

			accum.assign( accum1 );

		} ).ElseIf( coefIndex.equal( 2 ), () => {

			accum.assign( accum2 );

		} ).ElseIf( coefIndex.equal( 3 ), () => {

			accum.assign( accum3 );

		} ).ElseIf( coefIndex.equal( 4 ), () => {

			accum.assign( accum4 );

		} ).ElseIf( coefIndex.equal( 5 ), () => {

			accum.assign( accum5 );

		} ).ElseIf( coefIndex.equal( 6 ), () => {

			accum.assign( accum6 );

		} ).ElseIf( coefIndex.equal( 7 ), () => {

			accum.assign( accum7 );

		} ).Else( () => {

			accum.assign( accum8 );

		} );

		return vec4( accum.mul( norm ), 1.0 );

	} )();

}

function _ensureRepackResources() {

	if ( _repackMaterials !== null ) return;

	_ensureQuadMesh();

	_repackMaterials = [];

	for ( let textureIndex = 0; textureIndex < 7; textureIndex ++ ) {

		const batchTextureNode = texture();
		const resolutionNode = uniform( new Vector3() );
		const sliceZNode = uniform( 0 );
		const material = new NodeMaterial();

		material.batchTextureNode = batchTextureNode;
		material.resolutionNode = resolutionNode;
		material.sliceZNode = sliceZNode;
		material.fragmentNode = _repackSH( batchTextureNode, resolutionNode, sliceZNode, textureIndex );
		material.depthTest = false;
		material.depthWrite = false;
		material.name = `LightProbeGridGPU.Repack${ textureIndex }`;

		_repackMaterials.push( material );

	}

}

function _repackSH( batchTextureNode, resolutionNode, sliceZNode, textureIndex ) {

	return Fn( () => {

		const ix = int( viewportCoordinate.x );
		const iy = int( viewportCoordinate.y );
		const iz = int( sliceZNode );
		const nx = int( resolutionNode.x );
		const ny = int( resolutionNode.y );
		const probeIndex = ix.add( iy.mul( nx ) ).add( iz.mul( nx ).mul( ny ) );

		const c0 = textureLoad( batchTextureNode, ivec2( 0, probeIndex ) );
		const c1 = textureLoad( batchTextureNode, ivec2( 1, probeIndex ) );
		const c2 = textureLoad( batchTextureNode, ivec2( 2, probeIndex ) );
		const c3 = textureLoad( batchTextureNode, ivec2( 3, probeIndex ) );
		const c4 = textureLoad( batchTextureNode, ivec2( 4, probeIndex ) );
		const c5 = textureLoad( batchTextureNode, ivec2( 5, probeIndex ) );
		const c6 = textureLoad( batchTextureNode, ivec2( 6, probeIndex ) );
		const c7 = textureLoad( batchTextureNode, ivec2( 7, probeIndex ) );
		const c8 = textureLoad( batchTextureNode, ivec2( 8, probeIndex ) );

		if ( textureIndex === 0 ) return vec4( c0.rgb, c1.r );
		if ( textureIndex === 1 ) return vec4( c1.g, c1.b, c2.r, c2.g );
		if ( textureIndex === 2 ) return vec4( c2.b, c3.rgb );
		if ( textureIndex === 3 ) return vec4( c4.rgb, c5.r );
		if ( textureIndex === 4 ) return vec4( c5.g, c5.b, c6.r, c6.g );
		if ( textureIndex === 5 ) return vec4( c6.b, c7.rgb );

		return vec4( c8.rgb, 0.0 );

	} )();

}

const lightProbeGrid = /*@__PURE__*/ nodeProxy( LightProbeGridNode ).setParameterLength( 0, 1 );

export { LightProbeGrid, LightProbeGridNode, bakeLightProbeGrid, lightProbeGrid, sampleLightProbeGridTexture };
