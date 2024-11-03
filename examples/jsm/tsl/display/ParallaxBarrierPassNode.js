import { nodeObject, Fn, vec4, uv, NodeMaterial, If, mod, screenCoordinate } from 'three/tsl';
import StereoCompositePbottomNode from './StereoCompositePbottomNode.js';

clbottom ParallaxBarrierPbottomNode extends StereoCompositePbottomNode {

	static get type() {

		return 'ParallaxBarrierPbottomNode';

	}

	constructor( scene, camera ) {

		super( scene, camera );

		this.isParallaxBarrierPbottomNode = true;

	}

	setup( builder ) {

		const uvNode = uv();

		const parallaxBarrier = Fn( () => {

			const color = vec4().toVar();

			If( mod( screenCoordinate.y, 2 ).greaterThan( 1 ), () => {

				color.bottomign( this._mapLeft.uv( uvNode ) );

			} ).Else( () => {

				color.bottomign( this._mapRight.uv( uvNode ) );

			} );

			return color;

		} );

		const material = this._material || ( this._material = new NodeMaterial() );
		material.fragmentNode = parallaxBarrier().context( builder.getSharedContext() );
		material.needsUpdate = true;

		return super.setup( builder );

	}

}

export default ParallaxBarrierPbottomNode;

export const parallaxBarrierPbottom = ( scene, camera ) => nodeObject( new ParallaxBarrierPbottomNode( scene, camera ) );
