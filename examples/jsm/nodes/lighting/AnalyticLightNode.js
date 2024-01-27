import LightingNode from './LightingNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { addNodeClass } from '../core/Node.js';
import { /*vec2,*/ vec3, vec4 } from '../shadernode/ShaderNode.js';
import { reference } from '../accessors/ReferenceNode.js';
import { texture } from '../accessors/TextureNode.js';
import { positionWorld } from '../accessors/PositionNode.js';
import { normalWorld } from '../accessors/NormalNode.js';
import { WebGPUCoordinateSystem } from 'three';
//import { add } from '../math/OperatorNode.js';

import { Color, DepthTexture, NearestFilter, LessCompare } from 'three';

let overrideMaterial = null;

class AnalyticLightNode extends LightingNode {

	constructor( light = null ) {

		super();

		this.updateType = NodeUpdateType.FRAME;

		this.light = light;

		this.rtt = null;
		this.shadowNode = null;

		this.color = new Color();
		this._defaultColorNode = uniform( this.color );

		this.colorNode = this._defaultColorNode;

		this.isAnalyticLightNode = true;

	}

	getCacheKey() {

		return super.getCacheKey() + '-' + ( this.light.id + '-' + ( this.light.castShadow ? '1' : '0' ) );

	}

	getHash() {

		return this.light.uuid;

	}

	setupShadow( builder ) {

		let shadowNode = this.shadowNode;

		if ( shadowNode === null ) {

			if ( overrideMaterial === null ) {

				overrideMaterial = builder.createNodeMaterial();
				overrideMaterial.fragmentNode = vec4( 0, 0, 0, 1 );
				overrideMaterial.isShadowNodeMaterial = true; // Use to avoid other overrideMaterial override material.fragmentNode unintentionally when using material.shadowNode

			}

			const shadow = this.light.shadow;
			const rtt = builder.getRenderTarget( shadow.mapSize.width, shadow.mapSize.height );

			const depthTexture = new DepthTexture();
			depthTexture.minFilter = NearestFilter;
			depthTexture.magFilter = NearestFilter;
			depthTexture.image.width = shadow.mapSize.width;
			depthTexture.image.height = shadow.mapSize.height;
			depthTexture.compareFunction = LessCompare;

			rtt.depthTexture = depthTexture;

			shadow.camera.updateProjectionMatrix();

			//

			const bias = reference( 'bias', 'float', shadow );
			const normalBias = reference( 'normalBias', 'float', shadow );

			let shadowCoord = uniform( shadow.matrix ).mul( positionWorld.add( normalWorld.mul( normalBias ) ) );
			shadowCoord = shadowCoord.xyz.div( shadowCoord.w );

			const frustumTest = shadowCoord.x.greaterThanEqual( 0 )
				.and( shadowCoord.x.lessThanEqual( 1 ) )
				.and( shadowCoord.y.greaterThanEqual( 0 ) )
				.and( shadowCoord.y.lessThanEqual( 1 ) )
				.and( shadowCoord.z.lessThanEqual( 1 ) );

			let coordZ = shadowCoord.z.add( bias );

			if ( builder.renderer.coordinateSystem === WebGPUCoordinateSystem ) {

				coordZ = coordZ.mul( 2 ).sub( 1 ); // WebGPU: Convertion [ 0, 1 ] to [ - 1, 1 ]

			}

			shadowCoord = vec3(
				shadowCoord.x,
				shadowCoord.y.oneMinus(), // follow webgpu standards
				coordZ
			);

			const textureCompare = ( depthTexture, shadowCoord, compare ) => texture( depthTexture, shadowCoord ).compare( compare );
			//const textureCompare = ( depthTexture, shadowCoord, compare ) => compare.step( texture( depthTexture, shadowCoord ) );

			// BasicShadowMap

			shadowNode = textureCompare( depthTexture, shadowCoord.xy, shadowCoord.z );

			// PCFShadowMap
			/*
			const mapSize = reference( 'mapSize', 'vec2', shadow );
			const radius = reference( 'radius', 'float', shadow );

			const texelSize = vec2( 1 ).div( mapSize );
			const dx0 = texelSize.x.negate().mul( radius );
			const dy0 = texelSize.y.negate().mul( radius );
			const dx1 = texelSize.x.mul( radius );
			const dy1 = texelSize.y.mul( radius );
			const dx2 = dx0.mul( 2 );
			const dy2 = dy0.mul( 2 );
			const dx3 = dx1.mul( 2 );
			const dy3 = dy1.mul( 2 );

			shadowNode = add(
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
			).mul( 1 / 17 );
			*/
			//

			const shadowColor = texture( rtt.texture, shadowCoord );

			this.rtt = rtt;
			this.colorNode = this.colorNode.mul( frustumTest.mix( 1, shadowNode.mix( shadowColor.a.mix( 1, shadowColor ), 1 ) ) );

			this.shadowNode = shadowNode;

			//

			this.updateBeforeType = NodeUpdateType.RENDER;

		}

	}

	setup( builder ) {

		if ( this.light.castShadow ) this.setupShadow( builder );
		else if ( this.shadowNode !== null ) this.disposeShadow();

	}

	updateShadow( frame ) {

		const { rtt, light } = this;
		const { renderer, scene } = frame;

		const currentOverrideMaterial = scene.overrideMaterial;

		scene.overrideMaterial = overrideMaterial;

		rtt.setSize( light.shadow.mapSize.width, light.shadow.mapSize.height );

		light.shadow.updateMatrices( light );

		const currentRenderTarget = renderer.getRenderTarget();
		const currentRenderObjectFunction = renderer.getRenderObjectFunction();

		renderer.setRenderObjectFunction( ( object, ...params ) => {

			if ( object.castShadow === true ) {

				renderer.renderObject( object, ...params );

			}

		} );

		renderer.setRenderTarget( rtt );

		renderer.render( scene, light.shadow.camera );

		renderer.setRenderTarget( currentRenderTarget );
		renderer.setRenderObjectFunction( currentRenderObjectFunction );

		scene.overrideMaterial = currentOverrideMaterial;

	}

	disposeShadow() {

		this.rtt.dispose();

		this.shadowNode = null;
		this.rtt = null;

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
