import { Return, VariableDeclaration, Accessor } from './AST.js';
import GLSLDecoder from './GLSLDecoder.js';

class ShaderToyDecoder extends GLSLDecoder {

	constructor() {

		super();

		this.addPolyfill( 'iTime', 'float iTime = timerGlobal();' );
		this.addPolyfill( 'iResolution', 'vec2 iResolution = screenSize;' );
		this.addPolyfill( 'fragCoord', 'vec3 fragCoord = vec3( screenCoordinate.x, screenSize.y - screenCoordinate.y, screenCoordinate.z );' );

	}

	parseFunction() {

		const node = super.parseFunction();

		if ( node.name === 'mainImage' ) {

			node.params = []; // remove default parameters
			node.type = 'vec4';
			node.layout = false; // for now

			const fragColor = new Accessor( 'fragColor' );

			for ( const subNode of node.body ) {

				if ( subNode.isReturn ) {

					subNode.value = fragColor;

				}

			}

			node.body.unshift( new VariableDeclaration( 'vec4', 'fragColor' ) );
			node.body.push( new Return( fragColor ) );

		}

		return node;

	}

}

export default ShaderToyDecoder;
