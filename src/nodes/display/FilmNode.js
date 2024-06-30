import TempNode from '../core/TempNode.js';
import { uv } from '../accessors/UVNode.js';
import { luminance } from './ColorAdjustmentNode.js';
import { addNodeElement, tslFn, nodeObject, vec3, vec4 } from '../shadernode/ShaderNode.js';
import { uniform } from '../core/UniformNode.js';
import { mix, fract, clamp, rand } from '../math/MathNode.js';
import { timerLocal } from '../utils/TimerNode.js';

class FilmNode extends TempNode {

	constructor( textureNode, intensity = 0.5, grayscale = false ) {

		super();

		this.textureNode = textureNode;

		this.intensityNode = uniform( intensity );
		this.grayscale = grayscale;

	}

	setup() {

		const { textureNode } = this;

		const uvNode = textureNode.uvNode || uv();

		const film = tslFn( () => {

			const base = textureNode;

			const noise = rand( fract( uvNode.add( timerLocal() ) ) );

			let color = base.rgb.add( base.rgb.mul( clamp( noise.add( 0.1 ), 0, 1 ) ) );

			color = mix( base.rgb, color, this.intensityNode );

			if ( this.grayscale === true ) {

				color = vec3( luminance( color ) ); // assuming linear-srgb

			}

			return vec4( color, base.a );

		} );

		const outputNode = film();

		return outputNode;

	}

}

export const film = ( node, intensity, grayscale ) => nodeObject( new FilmNode( nodeObject( node ), intensity, grayscale ) );

addNodeElement( 'film', film );

export default FilmNode;
