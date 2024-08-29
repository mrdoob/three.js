import { registerNode } from '../core/Node.js';
import LightingNode from './LightingNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { float, vec2, vec3, vec4 } from '../tsl/TSLBase.js';
import { reference } from '../accessors/ReferenceNode.js';
import { texture } from '../accessors/TextureNode.js';
import { positionWorld } from '../accessors/Position.js';
import { normalWorld } from '../accessors/Normal.js';
import { mix, fract } from '../math/MathNode.js';
import { add } from '../math/OperatorNode.js';
import { Color } from '../../math/Color.js';
import { DepthTexture } from '../../textures/DepthTexture.js';
import { Fn } from '../tsl/TSLBase.js';
import { LessCompare, WebGPUCoordinateSystem } from '../../constants.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';

const BasicShadowMap = Fn( ( { depthTexture, shadowCoord } ) => {

	return texture( depthTexture, shadowCoord.xy ).compare( shadowCoord.z );

} );

const PCFShadowMap = Fn( ( { depthTexture, shadowCoord, shadow } ) => {

	const depthCompare = ( uv, compare ) => texture( depthTexture, uv ).compare( compare );

	const mapSize = reference( 'mapSize', 'vec2', shadow );
	const radius = reference( 'radius', 'float', shadow );

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

const PCFSoftShadowMap = Fn( ( { depthTexture, shadowCoord, shadow } ) => {

	const depthCompare = ( uv, compare ) => texture( depthTexture, uv ).compare( compare );

	const mapSize = reference( 'mapSize', 'vec2', shadow );

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

const shadowFilterLib = [ BasicShadowMap, PCFShadowMap, PCFSoftShadowMap ];

//

let overrideMaterial = null;

class AnalyticLightNode extends LightingNode {

	constructor( light = null ) {

		super();

		this.updateType = NodeUpdateType.FRAME;

		this.light = light;

		this.color = new Color();
		this.colorNode = uniform( this.color );

		this.baseColorNode = null;

		this.shadowMap = null;
		this.shadowNode = null;
		this.shadowColorNode = null;

		this.isAnalyticLightNode = true;

	}

	getCacheKey() {

		return super.getCacheKey() + '-' + ( this.light.id + '-' + ( this.light.castShadow ? '1' : '0' ) );

	}

	getHash() {

		return this.light.uuid;

	}

	setupShadow( builder ) {

		const { object, renderer } = builder;

		let shadowColorNode = this.shadowColorNode;

		if ( shadowColorNode === null ) {

			if ( overrideMaterial === null ) {

				overrideMaterial = new NodeMaterial();
				overrideMaterial.fragmentNode = vec4( 0, 0, 0, 1 );
				overrideMaterial.isShadowNodeMaterial = true; // Use to avoid other overrideMaterial override material.fragmentNode unintentionally when using material.shadowNode
				overrideMaterial.name = 'ShadowMaterial';

			}

			const depthTexture = new DepthTexture();
			depthTexture.compareFunction = LessCompare;

			const shadow = this.light.shadow;
			const shadowMap = builder.createRenderTarget( shadow.mapSize.width, shadow.mapSize.height );
			shadowMap.depthTexture = depthTexture;

			shadow.camera.updateProjectionMatrix();

			//

			const shadowIntensity = reference( 'intensity', 'float', shadow );
			const bias = reference( 'bias', 'float', shadow );
			const normalBias = reference( 'normalBias', 'float', shadow );

			const position = object.material.shadowPositionNode || positionWorld;

			let shadowCoord = uniform( shadow.matrix ).mul( position.add( normalWorld.mul( normalBias ) ) );
			shadowCoord = shadowCoord.xyz.div( shadowCoord.w );

			let coordZ = shadowCoord.z.add( bias );

			if ( renderer.coordinateSystem === WebGPUCoordinateSystem ) {

				coordZ = coordZ.mul( 2 ).sub( 1 ); // WebGPU: Convertion [ 0, 1 ] to [ - 1, 1 ]

			}

			shadowCoord = vec3(
				shadowCoord.x,
				shadowCoord.y.oneMinus(), // follow webgpu standards
				coordZ
			);

			const frustumTest = shadowCoord.x.greaterThanEqual( 0 )
				.and( shadowCoord.x.lessThanEqual( 1 ) )
				.and( shadowCoord.y.greaterThanEqual( 0 ) )
				.and( shadowCoord.y.lessThanEqual( 1 ) )
				.and( shadowCoord.z.lessThanEqual( 1 ) );

			//

			const filterFn = shadow.filterNode || shadowFilterLib[ renderer.shadowMap.type ] || null;

			if ( filterFn === null ) {

				throw new Error( 'THREE.WebGPURenderer: Shadow map type not supported yet.' );

			}

			const shadowColor = texture( shadowMap.texture, shadowCoord );
			const shadowNode = frustumTest.select( filterFn( { depthTexture, shadowCoord, shadow } ), float( 1 ) );

			this.shadowMap = shadowMap;

			this.shadowNode = shadowNode;
			this.shadowColorNode = shadowColorNode = this.colorNode.mul( mix( 1, shadowNode.rgb.mix( shadowColor, 1 ), shadowIntensity.mul( shadowColor.a ) ) );

			this.baseColorNode = this.colorNode;

		}

		//

		this.colorNode = shadowColorNode;

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	setup( builder ) {

		this.colorNode = this.baseColorNode || this.colorNode;

		if ( this.light.castShadow ) {

			if ( builder.object.receiveShadow ) {

				this.setupShadow( builder );

			}

		} else if ( this.shadowNode !== null ) {

			this.disposeShadow();

		}

	}

	updateShadow( frame ) {

		const { shadowMap, light } = this;
		const { renderer, scene, camera } = frame;


		const depthVersion = shadowMap.depthTexture.version;
		this._depthVersionCached = depthVersion;

		const currentOverrideMaterial = scene.overrideMaterial;

		scene.overrideMaterial = overrideMaterial;

		shadowMap.setSize( light.shadow.mapSize.width, light.shadow.mapSize.height );

		light.shadow.updateMatrices( light );
		light.shadow.camera.layers.mask = camera.layers.mask;

		const currentRenderTarget = renderer.getRenderTarget();
		const currentRenderObjectFunction = renderer.getRenderObjectFunction();

		renderer.setRenderObjectFunction( ( object, ...params ) => {

			if ( object.castShadow === true ) {

				renderer.renderObject( object, ...params );

			}

		} );

		renderer.setRenderTarget( shadowMap );
		renderer.render( scene, light.shadow.camera );

		renderer.setRenderTarget( currentRenderTarget );
		renderer.setRenderObjectFunction( currentRenderObjectFunction );

		scene.overrideMaterial = currentOverrideMaterial;

	}

	disposeShadow() {

		this.shadowMap.dispose();
		this.shadowMap = null;

		this.shadowNode = null;
		this.shadowColorNode = null;

		this.baseColorNode = null;

		this.updateBeforeType = NodeUpdateType.NONE;

	}

	updateBefore( frame ) {

		const shadow = this.light.shadow;

		const needsUpdate = shadow.needsUpdate || shadow.autoUpdate;

		if ( needsUpdate ) {

			this.updateShadow( frame );

			if ( this.shadowMap.depthTexture.version === this._depthVersionCached ) {

				shadow.needsUpdate = false;

			}

		}

	}

	update( /*frame*/ ) {

		const { light } = this;

		this.color.copy( light.color ).multiplyScalar( light.intensity );

	}

}

export default AnalyticLightNode;

AnalyticLightNode.type = /*@__PURE__*/ registerNode( 'AnalyticLight', AnalyticLightNode );
