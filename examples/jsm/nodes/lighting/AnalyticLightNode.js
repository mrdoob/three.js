import LightingNode from './LightingNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { addNodeClass } from '../core/Node.js';
import { vec3 } from '../shadernode/ShaderNode.js';
import { reference } from '../accessors/ReferenceNode.js';
import { texture } from '../accessors/TextureNode.js';
import { positionWorld } from '../accessors/PositionNode.js';
import { cond } from '../math/CondNode.js';
import MeshBasicNodeMaterial from '../materials/MeshBasicNodeMaterial.js';

import { Color, DepthTexture, NearestFilter } from 'three';

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

			if ( depthMaterial === null ) depthMaterial = new MeshBasicNodeMaterial();

			const shadow = this.light.shadow;
			const rtt = builder.getRenderTarget( shadow.mapSize.width, shadow.mapSize.height );

			const depthTexture = new DepthTexture();
			depthTexture.minFilter = NearestFilter;
			depthTexture.magFilter = NearestFilter;

			rtt.depthTexture = depthTexture;

			shadow.camera.updateProjectionMatrix();

			//

			const bias = reference( 'bias', 'float', shadow );

			//const diffuseFactor = normalView.dot( objectViewPosition( this.light ).sub( positionView ).normalize().negate() );
			//bias = mix( bias, 0, diffuseFactor );

			let shadowCoord = uniform( shadow.matrix ).mul( positionWorld );
			shadowCoord = shadowCoord.xyz.div( shadowCoord.w );

			shadowCoord = vec3(
				shadowCoord.x,
				shadowCoord.y.oneMinus(),
				shadowCoord.z
			);

			// @TODO: Optimize using WebGPU compare-sampler

			let depth = texture( depthTexture, shadowCoord.xy );
			depth = depth.mul( .5 ).add( .5 ).add( bias );

			shadowNode = cond( shadowCoord.z.lessThan( depth ).or( shadowCoord.y.lessThan( .000001 ) /*@TODO: find the cause and remove it soon */ ), 1, 0 );
			//shadowNode = step( shadowCoord.z, depth );

			//

			this.rtt = rtt;
			this.colorNode = this.colorNode.mul( shadowNode );

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

	update( frame ) {

		const { light } = this;

		this.color.copy( light.color ).multiplyScalar( light.intensity );

	}

}

export default AnalyticLightNode;

addNodeClass( AnalyticLightNode );
