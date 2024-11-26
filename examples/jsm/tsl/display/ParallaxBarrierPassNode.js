import { NodeMaterial } from 'three/webgpu';
import { nodeObject, Fn, vec4, uv, If, mod, screenCoordinate } from 'three/tsl';
import StereoCompositePassNode from './StereoCompositePassNode.js';

class ParallaxBarrierPassNode extends StereoCompositePassNode {

	static get type() {

		return 'ParallaxBarrierPassNode';

	}

	constructor( scene, camera ) {

		super( scene, camera );

		this.isParallaxBarrierPassNode = true;

	}

	setup( builder ) {

		const uvNode = uv();

		const parallaxBarrier = Fn( () => {

			const color = vec4().toVar();

			If( mod( screenCoordinate.y, 2 ).greaterThan( 1 ), () => {

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

export const parallaxBarrierPass = ( scene, camera ) => nodeObject( new ParallaxBarrierPassNode( scene, camera ) );
