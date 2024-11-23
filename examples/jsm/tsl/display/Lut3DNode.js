import { TempNode } from 'three/webgpu';
import { nodeObject, Fn, float, uniform, vec3, vec4, mix } from 'three/tsl';

class Lut3DNode extends TempNode {

	static get type() {

		return 'Lut3DNode';

	}

	constructor( inputNode, lutNode, size, intensityNode ) {

		super( 'vec4' );

		this.inputNode = inputNode;
		this.lutNode = lutNode;
		this.size = uniform( size );
		this.intensityNode = intensityNode;

	}

	setup() {

		const { inputNode, lutNode } = this;

		const sampleLut = ( uv ) => lutNode.uv( uv );

		const lut3D = Fn( () => {

			const base = inputNode;

			// pull the sample in by half a pixel so the sample begins at the center of the edge pixels.

			const pixelWidth = float( 1.0 ).div( this.size );
			const halfPixelWidth = float( 0.5 ).div( this.size );
			const uvw = vec3( halfPixelWidth ).add( base.rgb.mul( float( 1.0 ).sub( pixelWidth ) ) );

			const lutValue = vec4( sampleLut( uvw ).rgb, base.a );

			return vec4( mix( base, lutValue, this.intensityNode ) );

		} );

		const outputNode = lut3D();

		return outputNode;

	}

}

export default Lut3DNode;

export const lut3D = ( node, lut, size, intensity ) => nodeObject( new Lut3DNode( nodeObject( node ), nodeObject( lut ), size, nodeObject( intensity ) ) );
