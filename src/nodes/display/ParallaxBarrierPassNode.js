import { registerNode } from '../core/Node.js';
import { Fn, If, nodeObject, vec4 } from '../tsl/TSLBase.js';
import { uv } from '../accessors/UV.js';
import { mod } from '../math/MathNode.js';
import { viewportCoordinate } from './ViewportNode.js';
import StereoCompositePassNode from './StereoCompositePassNode.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';

class ParallaxBarrierPassNode extends StereoCompositePassNode {

	constructor( scene, camera ) {

		super( scene, camera );

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

		const material = this._material || ( this._material = new NodeMaterial() );
		material.fragmentNode = parallaxBarrier().context( builder.getSharedContext() );
		material.needsUpdate = true;

		return super.setup( builder );

	}

}

export default ParallaxBarrierPassNode;

ParallaxBarrierPassNode.type = /*@__PURE__*/ registerNode( 'ParallaxBarrierPass', ParallaxBarrierPassNode );

export const parallaxBarrierPass = ( scene, camera ) => nodeObject( new ParallaxBarrierPassNode( scene, camera ) );
