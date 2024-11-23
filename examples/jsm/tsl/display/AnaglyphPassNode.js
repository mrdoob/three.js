import { Matrix3, NodeMaterial } from 'three/webgpu';
import { clamp, nodeObject, Fn, vec4, uv, uniform, max } from 'three/tsl';
import StereoCompositePassNode from './StereoCompositePassNode.js';

class AnaglyphPassNode extends StereoCompositePassNode {

	static get type() {

		return 'AnaglyphPassNode';

	}

	constructor( scene, camera ) {

		super( scene, camera );

		this.isAnaglyphPassNode = true;

		// Dubois matrices from https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.7.6968&rep=rep1&type=pdf#page=4

		this._colorMatrixLeft = uniform( new Matrix3().fromArray( [
			0.456100, - 0.0400822, - 0.0152161,
			0.500484, - 0.0378246, - 0.0205971,
			0.176381, - 0.0157589, - 0.00546856
		] ) );

		this._colorMatrixRight = uniform( new Matrix3().fromArray( [
			- 0.0434706, 0.378476, - 0.0721527,
			- 0.0879388, 0.73364, - 0.112961,
			- 0.00155529, - 0.0184503, 1.2264
		] ) );

	}

	setup( builder ) {

		const uvNode = uv();

		const anaglyph = Fn( () => {

			const colorL = this._mapLeft.uv( uvNode );
			const colorR = this._mapRight.uv( uvNode );

			const color = clamp( this._colorMatrixLeft.mul( colorL.rgb ).add( this._colorMatrixRight.mul( colorR.rgb ) ) );

			return vec4( color.rgb, max( colorL.a, colorR.a ) );

		} );

		const material = this._material || ( this._material = new NodeMaterial() );
		material.fragmentNode = anaglyph().context( builder.getSharedContext() );
		material.name = 'Anaglyph';
		material.needsUpdate = true;

		return super.setup( builder );

	}

}

export default AnaglyphPassNode;

export const anaglyphPass = ( scene, camera ) => nodeObject( new AnaglyphPassNode( scene, camera ) );
