import { Return, VariableDeclaration, Accessor } from './AST.js';
import GLSLDecoder from './GLSLDecoder.js';

const keywords = [
	{ name: 'iTime', polyfill: 'float iTime = timerLocal();' },
	{ name: 'iResolution', polyfill: 'vec2 iResolution = viewportResolution;' },
	{ name: 'fragCoord', polyfill: 'vec2 fragCoord = vec2( viewportCoordinate.x, viewportCoordinate.y.oneMinus() );' }
];

class ShaderToyDecoder extends GLSLDecoder {

	constructor() {

		super();

	}

	parseFunction() {

		const node = super.parseFunction();

		if ( node.name === 'mainImage' ) {

			node.params = [];
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

	parse( source ) {

		let polyfill = '';

		for ( const keyword of keywords ) {

			if ( new RegExp( `(^|\\b)${ keyword.name }($|\\b)`, 'gm' ).test( source ) ) {

				polyfill += keyword.polyfill + '\n';

			}

		}

		if ( polyfill ) {

			polyfill = '// Polyfills\n\n' + polyfill + '\n';

		}

		return super.parse( polyfill + source );

	}

}

export default ShaderToyDecoder;
