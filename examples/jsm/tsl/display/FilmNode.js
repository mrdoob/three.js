import { TempNode, rand, Fn, fract, time, uv, clamp, mix, vec4, nodeProxy } from 'three/tsl';

class FilmNode extends TempNode {

	static get type() {

		return 'FilmNode';

	}

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
			const noise = rand( fract( uvNode.add( time ) ) );

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

export default FilmNode;

export const film = /*@__PURE__*/ nodeProxy( FilmNode );
