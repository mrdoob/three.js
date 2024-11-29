import Node from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { float, vec2, vec3, vec4, If, int, Fn, nodeObject } from '../tsl/TSLBase.js';
import { reference } from '../accessors/ReferenceNode.js';
import { texture } from '../accessors/TextureNode.js';
import { positionWorld } from '../accessors/Position.js';
import { transformedNormalWorld } from '../accessors/Normal.js';
import { mix, fract, step, max, clamp, sqrt } from '../math/MathNode.js';
import { add, sub } from '../math/OperatorNode.js';
import { DepthTexture } from '../../textures/DepthTexture.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';
import QuadMesh from '../../renderers/common/QuadMesh.js';
import { Loop } from '../utils/LoopNode.js';
import { screenCoordinate } from '../display/ScreenNode.js';
import { HalfFloatType, LessCompare, NoBlending, RGFormat, VSMShadowMap, WebGPUCoordinateSystem } from '../../constants.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { viewZToLogarithmicDepth } from '../display/ViewportDepthNode.js';
import { objectPosition } from '../accessors/Object3DNode.js';
import { lightShadowMatrix } from '../accessors/Lights.js';

const shadowMaterialLib = /*@__PURE__*/ new WeakMap();
const shadowWorldPosition = /*@__PURE__*/ vec3().toVar( 'shadowWorldPosition' );

const linearDistance = /*@__PURE__*/ Fn( ( [ position, cameraNear, cameraFar ] ) => {

	let dist = positionWorld.sub( position ).length();
	dist = dist.sub( cameraNear ).div( cameraFar.sub( cameraNear ) );
	dist = dist.saturate(); // clamp to [ 0, 1 ]

	return dist;

} );

const linearShadowDistance = ( light ) => {

	const camera = light.shadow.camera;

	const nearDistance = reference( 'near', 'float', camera ).setGroup( renderGroup );
	const farDistance = reference( 'far', 'float', camera ).setGroup( renderGroup );

	const referencePosition = objectPosition( light );

	return linearDistance( referencePosition, nearDistance, farDistance );

};

const getShadowMaterial = ( light ) => {

	let material = shadowMaterialLib.get( light );

	if ( material === undefined ) {

		const depthNode = light.isPointLight ? linearShadowDistance( light ) : null;

		material = new NodeMaterial();
		material.colorNode = vec4( 0, 0, 0, 1 );
		material.depthNode = depthNode;
		material.isShadowNodeMaterial = true; // Use to avoid other overrideMaterial override material.colorNode unintentionally when using material.shadowNode
		material.blending = NoBlending;
		material.name = 'ShadowMaterial';

		shadowMaterialLib.set( light, material );

	}

	return material;

};

export const BasicShadowFilter = /*@__PURE__*/ Fn( ( { depthTexture, shadowCoord } ) => {

	return texture( depthTexture, shadowCoord.xy ).compare( shadowCoord.z );

} );

export const PCFShadowFilter = /*@__PURE__*/ Fn( ( { depthTexture, shadowCoord, shadow } ) => {

	const depthCompare = ( uv, compare ) => texture( depthTexture, uv ).compare( compare );

	const mapSize = reference( 'mapSize', 'vec2', shadow ).setGroup( renderGroup );
	const radius = reference( 'radius', 'float', shadow ).setGroup( renderGroup );

	const texelSize = vec2( 1 ).div( mapSize );
	const dx0 = texelSize.x.negate().mul( radius );
	const dy0 = texelSize.y.negate().mul( radius );
	const dx1 = texelSize.x.mul( radius );
	const dy1 = texelSize.y.mul( radius );
	const dx2 = dx0.div( 2 );
	const dy2 = dy0.div( 2 );
	const dx3 = dx1.div( 2 );
	const dy3 = dy1.div( 2 );

	return add(
		depthCompare( shadowCoord.xy.add( vec2( dx0, dy0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( 0, dy0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx1, dy0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx2, dy2 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( 0, dy2 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx3, dy2 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx0, 0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx2, 0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy, shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx3, 0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx1, 0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx2, dy3 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( 0, dy3 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx3, dy3 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx0, dy1 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( 0, dy1 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx1, dy1 ) ), shadowCoord.z )
	).mul( 1 / 17 );

} );

export const PCFSoftShadowFilter = /*@__PURE__*/ Fn( ( { depthTexture, shadowCoord, shadow } ) => {

	const depthCompare = ( uv, compare ) => texture( depthTexture, uv ).compare( compare );

	const mapSize = reference( 'mapSize', 'vec2', shadow ).setGroup( renderGroup );

	const texelSize = vec2( 1 ).div( mapSize );
	const dx = texelSize.x;
	const dy = texelSize.y;

	const uv = shadowCoord.xy;
	const f = fract( uv.mul( mapSize ).add( 0.5 ) );
	uv.subAssign( f.mul( texelSize ) );

	return add(
		depthCompare( uv, shadowCoord.z ),
		depthCompare( uv.add( vec2( dx, 0 ) ), shadowCoord.z ),
		depthCompare( uv.add( vec2( 0, dy ) ), shadowCoord.z ),
		depthCompare( uv.add( texelSize ), shadowCoord.z ),
		mix(
			depthCompare( uv.add( vec2( dx.negate(), 0 ) ), shadowCoord.z ),
			depthCompare( uv.add( vec2( dx.mul( 2 ), 0 ) ), shadowCoord.z ),
			f.x
		),
		mix(
			depthCompare( uv.add( vec2( dx.negate(), dy ) ), shadowCoord.z ),
			depthCompare( uv.add( vec2( dx.mul( 2 ), dy ) ), shadowCoord.z ),
			f.x
		),
		mix(
			depthCompare( uv.add( vec2( 0, dy.negate() ) ), shadowCoord.z ),
			depthCompare( uv.add( vec2( 0, dy.mul( 2 ) ) ), shadowCoord.z ),
			f.y
		),
		mix(
			depthCompare( uv.add( vec2( dx, dy.negate() ) ), shadowCoord.z ),
			depthCompare( uv.add( vec2( dx, dy.mul( 2 ) ) ), shadowCoord.z ),
			f.y
		),
		mix(
			mix(
				depthCompare( uv.add( vec2( dx.negate(), dy.negate() ) ), shadowCoord.z ),
				depthCompare( uv.add( vec2( dx.mul( 2 ), dy.negate() ) ), shadowCoord.z ),
				f.x
			),
			mix(
				depthCompare( uv.add( vec2( dx.negate(), dy.mul( 2 ) ) ), shadowCoord.z ),
				depthCompare( uv.add( vec2( dx.mul( 2 ), dy.mul( 2 ) ) ), shadowCoord.z ),
				f.x
			),
			f.y
		)
	).mul( 1 / 9 );

} );

// VSM

export const VSMShadowFilter = /*@__PURE__*/ Fn( ( { depthTexture, shadowCoord } ) => {

	const occlusion = float( 1 ).toVar();

	const distribution = texture( depthTexture ).uv( shadowCoord.xy ).rg;

	const hardShadow = step( shadowCoord.z, distribution.x );

	If( hardShadow.notEqual( float( 1.0 ) ), () => {

		const distance = shadowCoord.z.sub( distribution.x );
		const variance = max( 0, distribution.y.mul( distribution.y ) );
		let softnessProbability = variance.div( variance.add( distance.mul( distance ) ) ); // Chebeyshevs inequality
		softnessProbability = clamp( sub( softnessProbability, 0.3 ).div( 0.95 - 0.3 ) );
		occlusion.assign( clamp( max( hardShadow, softnessProbability ) ) );

	} );

	return occlusion;

} );

const VSMPassVertical = /*@__PURE__*/ Fn( ( { samples, radius, size, shadowPass } ) => {

	const mean = float( 0 ).toVar();
	const squaredMean = float( 0 ).toVar();

	const uvStride = samples.lessThanEqual( float( 1 ) ).select( float( 0 ), float( 2 ).div( samples.sub( 1 ) ) );
	const uvStart = samples.lessThanEqual( float( 1 ) ).select( float( 0 ), float( - 1 ) );

	Loop( { start: int( 0 ), end: int( samples ), type: 'int', condition: '<' }, ( { i } ) => {

		const uvOffset = uvStart.add( float( i ).mul( uvStride ) );

		const depth = shadowPass.uv( add( screenCoordinate.xy, vec2( 0, uvOffset ).mul( radius ) ).div( size ) ).x;
		mean.addAssign( depth );
		squaredMean.addAssign( depth.mul( depth ) );

	} );

	mean.divAssign( samples );
	squaredMean.divAssign( samples );

	const std_dev = sqrt( squaredMean.sub( mean.mul( mean ) ) );
	return vec2( mean, std_dev );

} );

const VSMPassHorizontal = /*@__PURE__*/ Fn( ( { samples, radius, size, shadowPass } ) => {

	const mean = float( 0 ).toVar();
	const squaredMean = float( 0 ).toVar();

	const uvStride = samples.lessThanEqual( float( 1 ) ).select( float( 0 ), float( 2 ).div( samples.sub( 1 ) ) );
	const uvStart = samples.lessThanEqual( float( 1 ) ).select( float( 0 ), float( - 1 ) );

	Loop( { start: int( 0 ), end: int( samples ), type: 'int', condition: '<' }, ( { i } ) => {

		const uvOffset = uvStart.add( float( i ).mul( uvStride ) );

		const distribution = shadowPass.uv( add( screenCoordinate.xy, vec2( uvOffset, 0 ).mul( radius ) ).div( size ) );
		mean.addAssign( distribution.x );
		squaredMean.addAssign( add( distribution.y.mul( distribution.y ), distribution.x.mul( distribution.x ) ) );

	} );

	mean.divAssign( samples );
	squaredMean.divAssign( samples );

	const std_dev = sqrt( squaredMean.sub( mean.mul( mean ) ) );
	return vec2( mean, std_dev );

} );

const _shadowFilterLib = [ BasicShadowFilter, PCFShadowFilter, PCFSoftShadowFilter, VSMShadowFilter ];

//

const _quadMesh = /*@__PURE__*/ new QuadMesh();

class ShadowNode extends Node {

	static get type() {

		return 'ShadowNode';

	}

	constructor( light, shadow = null ) {

		super();

		this.light = light;
		this.shadow = shadow || light.shadow;

		this.shadowMap = null;

		this.vsmShadowMapVertical = null;
		this.vsmShadowMapHorizontal = null;

		this.vsmMaterialVertical = null;
		this.vsmMaterialHorizontal = null;

		this.updateBeforeType = NodeUpdateType.RENDER;
		this._node = null;

		this.isShadowNode = true;

	}

	setupShadowFilter( builder, { filterFn, depthTexture, shadowCoord, shadow } ) {

		const frustumTest = shadowCoord.x.greaterThanEqual( 0 )
			.and( shadowCoord.x.lessThanEqual( 1 ) )
			.and( shadowCoord.y.greaterThanEqual( 0 ) )
			.and( shadowCoord.y.lessThanEqual( 1 ) )
			.and( shadowCoord.z.lessThanEqual( 1 ) );

		const shadowNode = filterFn( { depthTexture, shadowCoord, shadow } );

		return frustumTest.select( shadowNode, float( 1 ) );

	}

	setupShadowCoord( builder, shadowPosition ) {

		const { shadow } = this;
		const { renderer } = builder;

		const bias = reference( 'bias', 'float', shadow ).setGroup( renderGroup );

		let shadowCoord = shadowPosition;
		let coordZ;

		if ( shadow.camera.isOrthographicCamera || renderer.logarithmicDepthBuffer !== true ) {

			shadowCoord = shadowCoord.xyz.div( shadowCoord.w );

			coordZ = shadowCoord.z;

			if ( renderer.coordinateSystem === WebGPUCoordinateSystem ) {

				coordZ = coordZ.mul( 2 ).sub( 1 ); // WebGPU: Conversion [ 0, 1 ] to [ - 1, 1 ]

			}

		} else {

			const w = shadowCoord.w;
			shadowCoord = shadowCoord.xy.div( w ); // <-- Only divide X/Y coords since we don't need Z

			// The normally available "cameraNear" and "cameraFar" nodes cannot be used here because they do not get
			// updated to use the shadow camera. So, we have to declare our own "local" ones here.
			// TODO: How do we get the cameraNear/cameraFar nodes to use the shadow camera so we don't have to declare local ones here?
			const cameraNearLocal = reference( 'near', 'float', shadow.camera ).setGroup( renderGroup );
			const cameraFarLocal = reference( 'far', 'float', shadow.camera ).setGroup( renderGroup );

			coordZ = viewZToLogarithmicDepth( w.negate(), cameraNearLocal, cameraFarLocal );

		}

		shadowCoord = vec3(
			shadowCoord.x,
			shadowCoord.y.oneMinus(), // follow webgpu standards
			coordZ.add( bias )
		);

		return shadowCoord;

	}

	getShadowFilterFn( type ) {

		return _shadowFilterLib[ type ];

	}

	setupShadow( builder ) {

		const { renderer } = builder;

		const { light, shadow } = this;

		const shadowMapType = renderer.shadowMap.type;

		const depthTexture = new DepthTexture( shadow.mapSize.width, shadow.mapSize.height );
		depthTexture.compareFunction = LessCompare;

		const shadowMap = builder.createRenderTarget( shadow.mapSize.width, shadow.mapSize.height );
		shadowMap.depthTexture = depthTexture;

		shadow.camera.updateProjectionMatrix();

		// VSM

		if ( shadowMapType === VSMShadowMap ) {

			depthTexture.compareFunction = null; // VSM does not use textureSampleCompare()/texture2DCompare()

			this.vsmShadowMapVertical = builder.createRenderTarget( shadow.mapSize.width, shadow.mapSize.height, { format: RGFormat, type: HalfFloatType } );
			this.vsmShadowMapHorizontal = builder.createRenderTarget( shadow.mapSize.width, shadow.mapSize.height, { format: RGFormat, type: HalfFloatType } );

			const shadowPassVertical = texture( depthTexture );
			const shadowPassHorizontal = texture( this.vsmShadowMapVertical.texture );

			const samples = reference( 'blurSamples', 'float', shadow ).setGroup( renderGroup );
			const radius = reference( 'radius', 'float', shadow ).setGroup( renderGroup );
			const size = reference( 'mapSize', 'vec2', shadow ).setGroup( renderGroup );

			let material = this.vsmMaterialVertical || ( this.vsmMaterialVertical = new NodeMaterial() );
			material.fragmentNode = VSMPassVertical( { samples, radius, size, shadowPass: shadowPassVertical } ).context( builder.getSharedContext() );
			material.name = 'VSMVertical';

			material = this.vsmMaterialHorizontal || ( this.vsmMaterialHorizontal = new NodeMaterial() );
			material.fragmentNode = VSMPassHorizontal( { samples, radius, size, shadowPass: shadowPassHorizontal } ).context( builder.getSharedContext() );
			material.name = 'VSMHorizontal';

		}

		//

		const shadowIntensity = reference( 'intensity', 'float', shadow ).setGroup( renderGroup );
		const normalBias = reference( 'normalBias', 'float', shadow ).setGroup( renderGroup );

		const shadowPosition = lightShadowMatrix( light ).mul( shadowWorldPosition.add( transformedNormalWorld.mul( normalBias ) ) );
		const shadowCoord = this.setupShadowCoord( builder, shadowPosition );

		//

		const filterFn = shadow.filterNode || this.getShadowFilterFn( renderer.shadowMap.type ) || null;

		if ( filterFn === null ) {

			throw new Error( 'THREE.WebGPURenderer: Shadow map type not supported yet.' );

		}

		const shadowDepthTexture = ( shadowMapType === VSMShadowMap ) ? this.vsmShadowMapHorizontal.texture : depthTexture;

		const shadowNode = this.setupShadowFilter( builder, { filterFn, shadowTexture: shadowMap.texture, depthTexture: shadowDepthTexture, shadowCoord, shadow } );

		const shadowColor = texture( shadowMap.texture, shadowCoord );
		const shadowOutput = mix( 1, shadowNode.rgb.mix( shadowColor, 1 ), shadowIntensity.mul( shadowColor.a ) ).toVar();

		this.shadowMap = shadowMap;
		this.shadow.map = shadowMap;

		return shadowOutput;

	}

	setup( builder ) {

		if ( builder.renderer.shadowMap.enabled === false ) return;

		return Fn( ( { material } ) => {

			shadowWorldPosition.assign( material.shadowPositionNode || positionWorld );

			let node = this._node;

			if ( node === null ) {

				this._node = node = this.setupShadow( builder );

			}

			if ( builder.material.shadowNode ) { // @deprecated, r171

				console.warn( 'THREE.NodeMaterial: ".shadowNode" is deprecated. Use ".castShadowNode" instead.' );

			}

			if ( builder.material.receivedShadowNode ) {

				node = builder.material.receivedShadowNode( node );

			}

			return node;

		} )();

	}

	renderShadow( frame ) {

		const { shadow, shadowMap } = this;
		const { renderer, scene } = frame;

		shadowMap.setSize( shadow.mapSize.width, shadow.mapSize.height );

		renderer.render( scene, shadow.camera );

	}

	updateShadow( frame ) {

		const { shadowMap, light, shadow } = this;
		const { renderer, scene, camera } = frame;

		const shadowType = renderer.shadowMap.type;

		const depthVersion = shadowMap.depthTexture.version;
		this._depthVersionCached = depthVersion;

		const currentOverrideMaterial = scene.overrideMaterial;

		scene.overrideMaterial = getShadowMaterial( light );

		shadow.camera.layers.mask = camera.layers.mask;

		const currentRenderTarget = renderer.getRenderTarget();
		const currentRenderObjectFunction = renderer.getRenderObjectFunction();
		const currentMRT = renderer.getMRT();

		renderer.setMRT( null );

		renderer.setRenderObjectFunction( ( object, ...params ) => {

			if ( object.castShadow === true || ( object.receiveShadow && shadowType === VSMShadowMap ) ) {

				renderer.renderObject( object, ...params );

			}

		} );

		renderer.setRenderTarget( shadowMap );

		this.renderShadow( frame );

		renderer.setRenderObjectFunction( currentRenderObjectFunction );

		// vsm blur pass

		if ( light.isPointLight !== true && shadowType === VSMShadowMap ) {

			this.vsmPass( renderer );

		}

		renderer.setRenderTarget( currentRenderTarget );

		renderer.setMRT( currentMRT );

		scene.overrideMaterial = currentOverrideMaterial;

	}

	vsmPass( renderer ) {

		const { shadow } = this;

		this.vsmShadowMapVertical.setSize( shadow.mapSize.width, shadow.mapSize.height );
		this.vsmShadowMapHorizontal.setSize( shadow.mapSize.width, shadow.mapSize.height );

		renderer.setRenderTarget( this.vsmShadowMapVertical );
		_quadMesh.material = this.vsmMaterialVertical;
		_quadMesh.render( renderer );

		renderer.setRenderTarget( this.vsmShadowMapHorizontal );
		_quadMesh.material = this.vsmMaterialHorizontal;
		_quadMesh.render( renderer );

	}

	dispose() {

		this.shadowMap.dispose();
		this.shadowMap = null;

		if ( this.vsmShadowMapVertical !== null ) {

			this.vsmShadowMapVertical.dispose();
			this.vsmShadowMapVertical = null;

			this.vsmMaterialVertical.dispose();
			this.vsmMaterialVertical = null;

		}

		if ( this.vsmShadowMapHorizontal !== null ) {

			this.vsmShadowMapHorizontal.dispose();
			this.vsmShadowMapHorizontal = null;

			this.vsmMaterialHorizontal.dispose();
			this.vsmMaterialHorizontal = null;

		}

		this.updateBeforeType = NodeUpdateType.NONE;

	}

	updateBefore( frame ) {

		const { shadow } = this;

		const needsUpdate = shadow.needsUpdate || shadow.autoUpdate;

		if ( needsUpdate ) {

			this.updateShadow( frame );

			if ( this.shadowMap.depthTexture.version === this._depthVersionCached ) {

				shadow.needsUpdate = false;

			}

		}

	}

}

export default ShadowNode;

export const shadow = ( light, shadow ) => nodeObject( new ShadowNode( light, shadow ) );
