import { Fn, vec3, float } from '../../../../../src/nodes/tsl/TSLCore.js';

function mockBuilder() {

	return {
		getNodeProperties() {

			return {};

		},
		getClosestSubBuild() {

			return '';

		}
	};

}

function invokeFn( jsFunc, argument ) {

	// Bypass toVarIntent so we hit ShaderCallNodeInternal.call() (where the
	// argument proxy is built) without needing a real node builder / stack.
	const shaderCall = Fn( jsFunc ).shaderNode.call( [ argument ] );
	shaderCall.call( mockBuilder() );

}

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'TSLCore', () => {

			QUnit.test( 'Fn proxy positional index matches iterator for class-instance arguments', ( assert ) => {

				class SceneObject {

					constructor() {

						this.marker = 7;
						this.instanceMatrix = 'mat';

					}

				}

				const argument = new SceneObject();
				let isArrayLike;
				let viaIndex;
				let viaIterator;

				invokeFn( ( inputs ) => {

					isArrayLike = Array.isArray( inputs );
					viaIndex = inputs[ 0 ];
					[ viaIterator ] = inputs;
					return vec3( 0 );

				}, argument );

				assert.ok( isArrayLike, 'parameter proxy reports Array.isArray true' );
				assert.strictEqual( viaIterator, argument, 'native destructuring yields the argument' );
				assert.strictEqual( viaIndex, argument, 'positional index read yields the same argument (Babel _slicedToArray path)' );
				assert.strictEqual( viaIndex.instanceMatrix, 'mat', 'returned argument keeps its own properties' );

			} );

			QUnit.test( 'Fn proxy still exposes named properties from a parameter object', ( assert ) => {

				const param = float( 1 );
				let named;

				invokeFn( ( inputs ) => {

					named = inputs.a;
					return vec3( 0 );

				}, { a: param } );

				assert.strictEqual( named, param, 'named property access on a parameter object still returns the node' );

			} );

		} );

	} );

} );
