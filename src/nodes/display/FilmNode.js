import TempNode from '../core/TempNode.js';
import { uv } from '../accessors/UVNode.js';
import { Fn, nodeProxy, vec4 } from '../tsl/TSLBase.js';
import { mix, fract, clamp, rand } from '../math/MathNode.js';
import { timerLocal } from '../utils/TimerNode.js';

class FilmNode extends TempNode {

	constructor( inputNode, intensityNode = null, uvNode = null ) {

		super();

		this.inputNode = inputNode;
		this.intensityNode = intensityNode;
		this.uvNode = uvNode;

	}

	setup() {

		const uvNode = this.uvNode || uv();

		const film = Fn( () => {

			const base = this.inputNode.rgb;
			const noise = rand( fract( uvNode.add( timerLocal() ) ) );

			let color = base.add( base.mul( clamp( noise.add( 0.1 ), 0, 1 ) ) );

			if ( this.intensityNode !== null ) {

				color = mix( base, color, this.intensityNode );

			}

			return vec4( color, this.inputNode.a );

		} );

		const outputNode = film();

		return outputNode;

	}

}

export const film = nodeProxy( FilmNode );

export default FilmNode;
