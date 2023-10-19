import { Return, VariableDeclaration, Accessor } from './AST.js';
import GLSLDecoder from './GLSLDecoder.js';

const keywords = [
	{ name: 'iTime', polyfill: 'float iTime = timerLocal();' },
	{ name: 'iResolution', polyfill: 'vec3 iResolution = viewportResolution;' },
	{ name: 'fragCoord', polyfill: 'vec2 fragCoord = viewportCoordinate.setY( viewportCoordinate.y.oneMinus() ).toVar();' }
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

			node.body.unshift( new VariableDeclaration( 'vec4', 'fragColor' ) );
			node.body.push( new Return( new Accessor( 'fragColor' ) ) );

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
