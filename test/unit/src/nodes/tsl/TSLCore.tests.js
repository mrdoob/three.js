import { float, int, nodeObject, nodeObjectAssignable } from '../../../../../src/Three.TSL.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'TSLCore', () => {

			QUnit.test( 'Scalar constant independence', ( assert ) => {

				for ( const value of [ 0, 1, 2, 3, - 1, - 2 ] ) {

					for ( const [ name, create ] of Object.entries( { int, float } ) ) {

						const first = create( value );
						const second = create( value );

						assert.notStrictEqual( first, second, `${ name }(${ value }) creates independent constants` );
						assert.strictEqual( first.value, value, `${ name }(${ value }) preserves the value` );
						assert.strictEqual( second.value, value, `${ name }(${ value }) preserves the second value` );
						assert.true( first.assignable, `${ name }(${ value }) is assignable` );
						assert.false( first.isWeak, `${ name }(${ value }) keeps its explicit type` );

					}

				}

			} );

			QUnit.test( 'Assignable shared constants', ( assert ) => {

				const shared = nodeObject( 1 );
				const first = nodeObjectAssignable( 1 );
				const second = nodeObjectAssignable( shared );

				assert.strictEqual( nodeObject( 1 ), shared, 'Plain constants remain cached' );
				assert.notStrictEqual( first, shared, 'Assignable constants do not reuse the shared node' );
				assert.notStrictEqual( second, shared, 'A shared constant passed as a node is copied' );
				assert.notStrictEqual( first, second, 'Assignable constants remain independent' );
				assert.false( shared.assignable, 'The cached constant remains unchanged' );
				assert.true( first.assignable, 'The first copy is assignable' );
				assert.true( second.assignable, 'The second copy is assignable' );
				assert.strictEqual( first.isWeak, shared.isWeak, 'The copy preserves implicit numeric typing' );
				assert.strictEqual( first.toAssignable(), first, 'toAssignable() preserves node identity' );
				assert.strictEqual( nodeObjectAssignable( first ), first, 'A node outside the shared cache retains its identity' );

			} );

		} );

	} );

} );
