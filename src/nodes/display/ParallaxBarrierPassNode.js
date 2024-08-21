import { addNodeElement, Fn, If, nodeObject, vec4 } from '../shadernode/ShaderNode.js';
import { uv } from '../accessors/UVNode.js';
import { mod } from '../math/MathNode.js';
import { viewportCoordinate } from './ViewportNode.js';
import StereoCompositePassNode from './StereoCompositePassNode.js';
import { addNodeClass } from '../core/Node.js';

class ParallaxBarrierPassNode extends StereoCompositePassNode {

	constructor( scene, camera, eyeSep ) {

		super( scene, camera, eyeSep );

		this.isParallaxBarrierPassNode = true;

	}

	setup( builder ) {

		const uvNode = uv();

		const parallaxBarrier = Fn( () => {

			const color = vec4().toVar();

			If( mod( viewportCoordinate.y, 2 ).greaterThan( 1 ), () => {

				color.assign( this._mapLeft.uv( uvNode ) );

			} ).Else( () => {

				color.assign( this._mapRight.uv( uvNode ) );

			} );

			return color;

		} );

		const material = this._material || ( this._material = builder.createNodeMaterial() );
		material.fragmentNode = parallaxBarrier().context( builder.getSharedContext() );
		material.needsUpdate = true;

		return super.setup( builder );

	}

}

export default ParallaxBarrierPassNode;

export const parallaxBarrierPass = ( scene, camera, eyeSep ) => nodeObject( new ParallaxBarrierPassNode( scene, camera, eyeSep ) );

addNodeElement( 'parallaxBarrierPass', parallaxBarrierPass );

addNodeClass( 'ParallaxBarrierPassNode', ParallaxBarrierPassNode );
