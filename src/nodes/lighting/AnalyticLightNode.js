import LightingNode from './LightingNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { addNodeClass } from '../core/Node.js';
import { float, If, vec2, vec3, vec4 } from '../shadernode/ShaderNode.js';
import { reference } from '../accessors/ReferenceNode.js';
import { texture } from '../accessors/TextureNode.js';
import { positionWorld } from '../accessors/PositionNode.js';
import { normalWorld } from '../accessors/NormalNode.js';
import { mix } from '../math/MathNode.js';
import { add } from '../math/OperatorNode.js';
import { Color } from '../../math/Color.js';
import { DepthTexture } from '../../textures/DepthTexture.js';
import { LessCompare, WebGPUCoordinateSystem, BasicShadowMap, PCFShadowMap } from '../../constants.js';

let overrideMaterial = null;

class AnalyticLightNode extends LightingNode {

	constructor( light = null ) {

		super();

		this.updateType = NodeUpdateType.FRAME;

		this.light = light;

		this.color = new Color();
		this._defaultColorNode = uniform( this.color );
		this.colorNode = this._defaultColorNode;

		this.shadowMap = null;
		this.shadowNode = null;
		this._shadowColorNode = null;

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

		if ( object.receiveShadow === false ) {

			this.colorNode = this._defaultColorNode;

			return;

		}

		let shadowNode = this.shadowNode;

		if ( shadowNode === null ) {

			if ( overrideMaterial === null ) {

				overrideMaterial = builder.createNodeMaterial();
				overrideMaterial.fragmentNode = vec4( 0, 0, 0, 1 );
				overrideMaterial.isShadowNodeMaterial = true; // Use to avoid other overrideMaterial override material.fragmentNode unintentionally when using material.shadowNode

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

			const textureCompare = ( depthTexture, shadowCoord, compare ) => texture( depthTexture, shadowCoord ).compare( compare );

			shadowNode = float( 1 );

			if ( renderer.shadowMap.type === BasicShadowMap ) {

				shadowNode = frustumTest.cond( textureCompare( depthTexture, shadowCoord.xy, shadowCoord.z ), shadowNode );

			} else if ( renderer.shadowMap.type === PCFShadowMap ) {

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

				shadowNode = frustumTest.cond( add(
					textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx0, dy0 ) ), shadowCoord.z ),
					textureCompare( depthTexture, shadowCoord.xy.add( vec2( 0, dy0 ) ), shadowCoord.z ),
					textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx1, dy0 ) ), shadowCoord.z ),
					textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx2, dy2 ) ), shadowCoord.z ),
					textureCompare( depthTexture, shadowCoord.xy.add( vec2( 0, dy2 ) ), shadowCoord.z ),
					textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx3, dy2 ) ), shadowCoord.z ),
					textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx0, 0 ) ), shadowCoord.z ),
					textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx2, 0 ) ), shadowCoord.z ),
					textureCompare( depthTexture, shadowCoord.xy, shadowCoord.z ),
					textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx3, 0 ) ), shadowCoord.z ),
					textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx1, 0 ) ), shadowCoord.z ),
					textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx2, dy3 ) ), shadowCoord.z ),
					textureCompare( depthTexture, shadowCoord.xy.add( vec2( 0, dy3 ) ), shadowCoord.z ),
					textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx3, dy3 ) ), shadowCoord.z ),
					textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx0, dy1 ) ), shadowCoord.z ),
					textureCompare( depthTexture, shadowCoord.xy.add( vec2( 0, dy1 ) ), shadowCoord.z ),
					textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx1, dy1 ) ), shadowCoord.z )
				).mul( 1 / 17 ), shadowNode );

			} else {

				throw new Error( 'THREE.WebGPURendere: Shadow map type not supported yet.' );

			}

			this.shadowMap = shadowMap;
			this.colorNode = this.colorNode.mul( mix( 1, shadowNode, shadowIntensity ) );
			this._shadowColorNode = this.colorNode;

			this.shadowNode = shadowNode;

			//

			this.updateBeforeType = NodeUpdateType.RENDER;

		} else {

			this.colorNode = this._shadowColorNode;

		}

	}

	setup( builder ) {

		if ( this.light.castShadow ) {

			this.setupShadow( builder );

		} else if ( this.shadowNode !== null ) {

			this.disposeShadow();

		}

	}

	updateShadow( frame ) {

		const { shadowMap, light } = this;
		const { renderer, scene, camera } = frame;

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
		this._shadowColorNode = null;

		this.colorNode = this._defaultColorNode;

	}

	updateBefore( frame ) {

		const { light } = this;

		if ( light.castShadow ) this.updateShadow( frame );

	}

	update( /*frame*/ ) {

		const { light } = this;

		this.color.copy( light.color ).multiplyScalar( light.intensity );

	}

}

export default AnalyticLightNode;

addNodeClass( 'AnalyticLightNode', AnalyticLightNode );
