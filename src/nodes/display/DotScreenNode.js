import TempNode from '../core/TempNode.js';
import { nodeObject, Fn, vec2, vec3, vec4 } from '../tsl/TSLBase.js';
import { uniform } from '../core/UniformNode.js';
import { uv } from '../accessors/UV.js';
import { sin, cos } from '../math/MathNode.js';
import { add } from '../math/OperatorNode.js';
import { screenSize } from './ScreenNode.js';

import { Vector2 } from '../../math/Vector2.js';

class DotScreenNode extends TempNode {

	static get type() {

		return 'DotScreenNode';

	}

	constructor( inputNode, center = new Vector2( 0.5, 0.5 ), angle = 1.57, scale = 1 ) {

		super( 'vec4' );

		this.inputNode = inputNode;
		this.center = uniform( center );
		this.angle = uniform( angle );
		this.scale = uniform( scale );

	}

	setup() {

		const inputNode = this.inputNode;

		const pattern = Fn( () => {

			const s = sin( this.angle );
			const c = cos( this.angle );

			const tex = uv().mul( screenSize ).sub( this.center );
			const point = vec2( c.mul( tex.x ).sub( s.mul( tex.y ) ), s.mul( tex.x ).add( c.mul( tex.y ) ) ).mul( this.scale );

			return sin( point.x ).mul( sin( point.y ) ).mul( 4 );

		} );

		const dotScreen = Fn( () => {

			const color = inputNode;

			const average = add( color.r, color.g, color.b ).div( 3 );

			return vec4( vec3( average.mul( 10 ).sub( 5 ).add( pattern() ) ), color.a );

		} );

		const outputNode = dotScreen();

		return outputNode;

	}

}

export default DotScreenNode;

export const dotScreen = ( node, center, angle, scale ) => nodeObject( new DotScreenNode( nodeObject( node ), center, angle, scale ) );
