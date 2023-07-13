import LightingNode from './LightingNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { addNodeClass } from '../core/Node.js';
import { vec3 } from '../shadernode/ShaderNode.js';
import { reference } from '../accessors/ReferenceNode.js';
import { texture } from '../accessors/TextureNode.js';
import { positionWorld } from '../accessors/PositionNode.js';

import { Color, DepthTexture, NearestFilter, LessCompare } from 'three';

let depthMaterial = null;

class AnalyticLightNode extends LightingNode {

	constructor( light = null ) {

		super();

		this.updateType = NodeUpdateType.FRAME;

		this.light = light;

		this.rtt = null;
		this.shadowNode = null;

		this.color = new Color();
		this.colorNode = uniform( this.color );

	}

	getHash( /*builder*/ ) {

		return this.light.uuid;

	}

	constructShadow( builder ) {

		let shadowNode = this.shadowNode;

		if ( shadowNode === null ) {

			if ( depthMaterial === null ) depthMaterial = builder.createNodeMaterial( 'MeshBasicNodeMaterial' );

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

			//

			let shadowCoord = uniform( shadow.matrix ).mul( positionWorld );
			shadowCoord = shadowCoord.xyz.div( shadowCoord.w );

			const frustumTest = shadowCoord.x.greaterThanEqual( 0 )
				.and( shadowCoord.x.lessThanEqual( 1 ) )
				.and( shadowCoord.y.greaterThanEqual( 0 ) )
				.and( shadowCoord.y.lessThanEqual( 1 ) )
				.and( shadowCoord.z.lessThanEqual( 1 ) );

			shadowCoord = vec3(
				shadowCoord.x,
				shadowCoord.y.oneMinus(), // WebGPU: Flip Y
				shadowCoord.z.add( bias ).mul( 2 ).sub( 1 ) // WebGPU: Convertion [ 0, 1 ] to [ - 1, 1 ]
			);

			shadowNode = texture( depthTexture, shadowCoord.xy ).compare( shadowCoord.z );

			//

			this.rtt = rtt;
			this.colorNode = this.colorNode.mul( frustumTest.mix( 1, shadowNode ) );

			this.shadowNode = shadowNode;

			//

			this.updateBeforeType = NodeUpdateType.RENDER;

		}

	}

	construct( builder ) {

		if ( this.light.castShadow ) this.constructShadow( builder );

	}

	updateShadow( frame ) {

		const { rtt, light } = this;
		const { renderer, scene } = frame;

		scene.overrideMaterial = depthMaterial;

		rtt.setSize( light.shadow.mapSize.width, light.shadow.mapSize.height );

		light.shadow.updateMatrices( light );

		renderer.setRenderTarget( rtt );
		renderer.render( scene, light.shadow.camera );
		renderer.setRenderTarget( null );

		scene.overrideMaterial = null;

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

addNodeClass( AnalyticLightNode );
