import Node from '../../../../../src/nodes/core/Node.js';
import ConstNode from '../../../../../src/nodes/core/ConstNode.js';
import OperatorNode from '../../../../../src/nodes/math/OperatorNode.js';
import WGSLNodeBuilder from '../../../../../src/renderers/webgpu/nodes/WGSLNodeBuilder.js';
import StorageBufferAttribute from '../../../../../src/renderers/common/StorageBufferAttribute.js';
import { Vector3 } from '../../../../../src/math/Vector3.js';
import {
	Fn, Discard, Loop, bool, color, float, int, uint, vec2, vec3, vec4,
	ivec3, uvec3, bvec3, select, property, storage, wgslFn
} from '../../../../../src/nodes/TSL.js';

function createBuilder() {

	const renderer = {
		backend: { isWebGPUBackend: true },
		debug: { diagnostics: { keywords: true } },
		getRenderTarget: () => null
	};
	const builder = new WGSLNodeBuilder( null, renderer );
	builder.setShaderStage( 'fragment' );
	return builder;

}

function compile( callback ) {

	const builder = createBuilder();
	const flow = builder.flowStagesNode( Fn( callback )() );
	return { builder, flow };

}

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'SplitNode', () => {

		QUnit.test( 'omits pure RGB dependencies before setup', assert => {

			let rgb;
			const { builder, flow } = compile( () => {

				rgb = select( bool( true ), color( 0.1, 0.2, 0.3 ).mul( 2 ), vec3( 0.4, 0.5, 0.6 ) );
				return rgb.a;

			} );

			assert.strictEqual( flow.result, '1.0' );
			assert.strictEqual( flow.code, '' );
			assert.false( builder.nodes.has( rgb ), 'RGB graph is not registered as a dependency' );

		} );

		QUnit.test( 'folds padded alpha with the correct component type', assert => {

			for ( const [ value, expected ] of [
				[ vec2( 0.1, 0.2 ), '1.0' ],
				[ vec3( 0.1, 0.2, 0.3 ), '1.0' ],
				[ color( 0.1, 0.2, 0.3 ), '1.0' ],
				[ ivec3( 2 ), '1' ],
				[ uvec3( 2 ), '1u' ],
				[ bvec3( false ), 'true' ]
			] ) {

				assert.strictEqual( compile( () => value.a ).flow.result, expected );

			}

		} );

		QUnit.test( 'preserves scalar swizzles and existing alpha', assert => {

			assert.strictEqual( compile( () => float( 0.25 ).a ).flow.result, '0.25' );
			assert.strictEqual( compile( () => int( 2 ).a ).flow.result, '2' );
			assert.strictEqual( compile( () => uint( 2 ).a ).flow.result, '2u' );
			assert.ok( compile( () => vec4( 1, 2, 3, 0.25 ).a ).flow.result.includes( '0.25' ) );
			assert.ok( compile( () => vec3( 1, 2, 3 ).xw ).flow.result.endsWith( '.xw' ) );

			const { flow } = compile( () => select( bool( true ), vec3( 1 ), vec4( 1, 1, 1, 0.25 ) ).a );
			assert.ok( flow.code.includes( '0.25' ), 'a wider conditional branch still provides alpha' );

		} );

		QUnit.test( 'preserves discard inside RGB functions and conditional branches', assert => {

			const discarded = Fn( () => {

				Discard();
				return vec3( 1 );

			} );

			assert.ok( compile( () => discarded().a ).flow.code.includes( 'discard;' ) );
			assert.ok( compile( () => select( bool( true ), discarded(), vec3( 0 ) ).a ).flow.code.includes( 'discard;' ) );

		} );

		QUnit.test( 'preserves writes from inline RGB functions', assert => {

			const { flow } = compile( () => {

				const value = float( 0 ).toVar( 'writtenValue' );
				const rgb = Fn( () => {

					value.assign( 2 );
					return vec3( 1 );

				} )();
				return vec4( vec3( value ), rgb.a );

			} );

			assert.ok( flow.code.includes( 'writtenValue = 2.0;' ) );

		} );

		QUnit.test( 'preserves arbitrary code and custom nodes', assert => {

			class CustomColorNode extends ConstNode {

				generate( builder, output ) {

					builder.addLineFlowCode( 'discard' );
					return super.generate( builder, output );

				}

			}

			const custom = new CustomColorNode( new Vector3( 1, 1, 1 ), 'vec3' );
			assert.ok( compile( () => custom.a ).flow.code.includes( 'discard;' ) );

			const native = wgslFn( 'fn customRGB() -> vec3f { discard; return vec3f( 1.0 ); }' );
			const { flow } = compile( () => native().a );
			assert.ok( flow.result.includes( 'customRGB(' ), 'native source is not assumed to be pure' );

		} );

		QUnit.test( 'preserves explicitly ordered dependencies', assert => {

			const { flow } = compile( () => {

				const rgb = new OperatorNode( '+', vec3( 1, 2, 3 ), float( 1 ) );
				rgb.before( Fn( () => {

					Discard();
					return vec4( 0 );

				} )() );
				return rgb.a;

			} );

			assert.ok( flow.code.includes( 'discard;' ) );

		} );

		QUnit.test( 'folds native functions with local variables and counted loops', assert => {

			const native = Fn( ( [ input ] ) => {

				const value = float( input ).toVar();
				Loop( 2, () => {

					value.addAssign( 1 );

				} );
				return vec3( value );

			} ).setLayout( { name: 'localRGB', type: 'vec3', inputs: [ { name: 'input', type: 'float' } ] } );

			const { flow } = compile( () => native( 2 ).a );
			assert.strictEqual( flow.result, '1.0' );
			assert.strictEqual( flow.code, '' );
			assert.strictEqual( compile( () => native( { input: 2 } ).a ).flow.result, '1.0', 'named arguments are supported' );

		} );

		QUnit.test( 'preserves native functions with side effects', assert => {

			const native = Fn( () => {

				Discard();
				return vec3( 1 );

			} ).setLayout( { name: 'discardRGB', type: 'vec3', inputs: [] } );

			assert.ok( compile( () => native().a ).flow.result.includes( 'discardRGB(' ) );

		} );

		QUnit.test( 'preserves storage writes in inline and native functions', assert => {

			for ( const native of [ false, true ] ) {

				const buffer = storage( new StorageBufferAttribute( 1, 1 ), 'float', 1 );
				const write = Fn( () => {

					buffer.element( 0 ).assign( 2 );
					return vec3( 1 );

				} );

				if ( native ) write.setLayout( { name: 'writeRGB', type: 'vec3', inputs: [] } );

				const { builder, flow } = compile( () => write().a );
				const code = flow.code + [ ...builder.nodes ].filter( node => node.isCodeNode ).map( node => node.code ).join( '\n' );
				assert.ok( code.includes( '.value[ 0u ] = 2.0;' ), 'storage write is retained' );
				if ( native ) assert.ok( flow.result.includes( 'writeRGB(' ), 'native call is retained' );

			}

		} );

		QUnit.test( 'preserves native writes to an enclosing shader variable', assert => {

			const builder = createBuilder();
			const value = property( 'float', 'externalValue' );

			// An existing shader declaration is shared through the global node cache.
			builder.getVarFromNode( value );

			const write = Fn( () => {

				value.assign( 2 );
				return vec3( 1 );

			} ).setLayout( { name: 'writeExternalRGB', type: 'vec3', inputs: [] } );

			const flow = builder.flowStagesNode( Fn( () => write().a )() );
			assert.ok( flow.result.includes( 'writeExternalRGB(' ), 'a captured variable is not treated as function-local' );

		} );

		QUnit.test( 'does not build function arguments just to resolve a declared type', assert => {

			let calls = 0;
			const input = Fn( () => {

				calls ++;
				return float( 1 );

			} )();
			const native = Fn( ( [ value ] ) => vec3( value ) ).setLayout( {
				name: 'typedRGB', type: 'vec3', inputs: [ { name: 'value', type: 'float' } ]
			} );

			assert.strictEqual( native( input ).getNodeType( createBuilder() ), 'vec3' );
			assert.strictEqual( calls, 0 );

		} );

		QUnit.test( 'resolves conditional types without setting up their expressions', assert => {

			let setups = 0;
			class CustomNode extends Node {

				setup() {

					setups ++;
					return new ConstNode( new Vector3( 1, 1, 1 ), 'vec3' );

				}

			}

			const builder = createBuilder();
			assert.strictEqual( select( bool( true ), new CustomNode( 'vec3' ), vec3( 0 ) ).getNodeType( builder ), 'vec3' );
			assert.strictEqual( setups, 0 );

			assert.strictEqual( select( bool( true ), new CustomNode(), new ConstNode( new Vector3(), 'vec3' ) ).getNodeType( builder ), 'vec3' );
			assert.strictEqual( setups, 1, 'nodes without a known type retain the setup fallback' );

			const contextual = Fn( builder => builder.context.useRGBA ? vec4( 1 ) : vec3( 1 ) )().context( { useRGBA: true } );
			assert.strictEqual( select( bool( true ), contextual, vec3( 0 ) ).getNodeType( builder ), 'vec4' );
			assert.strictEqual( builder.context.useRGBA, undefined, 'type queries restore the surrounding context' );

		} );

		QUnit.test( 'preserves assignments to vector components', assert => {

			const { flow } = compile( () => {

				const value = property( 'vec4', 'assignedColor' );
				value.a.assign( 0.25 ).toStack();
				return value.a;

			} );

			assert.ok( flow.code.includes( 'assignedColor.w = 0.25;' ) );

		} );

	} );

} );
