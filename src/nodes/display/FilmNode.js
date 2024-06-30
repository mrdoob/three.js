import TempNode from '../core/TempNode.js';
import { uv } from '../accessors/UVNode.js';
import { addNodeElement, tslFn, nodeProxy, vec3, vec4 } from '../shadernode/ShaderNode.js';
import { mix, fract, clamp, rand } from '../math/MathNode.js';
import { timerLocal } from '../utils/TimerNode.js';

class FilmNode extends TempNode {

	constructor( textureNode, intensityNode = null ) {

		super();

		this.textureNode = textureNode;
		this.intensityNode = intensityNode;

	}

	setup() {

		const { textureNode } = this;

		const uvNode = textureNode.uvNode || uv();

		const film = tslFn( () => {

			const base = textureNode;

			const noise = rand( fract( uvNode.add( timerLocal() ) ) );

			let color = base.rgb.add( base.rgb.mul( clamp( noise.add( 0.1 ), 0, 1 ) ) );

			if ( this.intensityNode !== null ) {

				color = mix( base.rgb, color, this.intensityNode );

			}

			return vec4( color, base.a );

		} );

		const outputNode = film();

		return outputNode;

	}

}

export const film = nodeProxy( FilmNode );

addNodeElement( 'film', film );

export default FilmNode;
