import { Fn, vec3 } from '../../../../../src/nodes/tsl/TSLCore.js';

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

	const callNode = Fn( jsFunc )( argument );
	callNode.call( mockBuilder() );

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

			QUnit.test( 'Fn proxy still exposes named properties from a plain-object parameter', ( assert ) => {

				let named;
				const argument = { marker: 42 };

				invokeFn( ( inputs ) => {

					named = inputs.marker;
					return vec3( 0 );

				}, argument );

				assert.strictEqual( named, 42, 'named property access on a plain object parameter still works' );

			} );

		} );

	} );

} );
