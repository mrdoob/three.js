import { Fn, If, nodeObject, vec4 } from '../shadernode/ShaderNode.js';
import { uv } from '../accessors/UVNode.js';
import { mod } from '../math/MathNode.js';
import { viewportCoordinate } from './ViewportNode.js';
import StereoCompositePassNode from './StereoCompositePassNode.js';

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

		const material = this._material || ( this._material = builder.createNodeMaterial() );
		material.fragmentNode = parallaxBarrier().context( builder.getSharedContext() );
		material.needsUpdate = true;

		return super.setup( builder );

	}

}

export const parallaxBarrierPass = ( scene, camera, eyeSep ) => nodeObject( new ParallaxBarrierPassNode( scene, camera, eyeSep ) );

export default ParallaxBarrierPassNode;
