import { assert, describe, test } from 'vitest';

import { float, int, nodeObject, nodeObjectAssignable } from '../../../../../src/Three.TSL.js';

describe( 'Nodes', () => {

	describe( 'TSL', () => {

		describe( 'TSLCore', () => {

			test( 'Scalar constant independence', () => {

				for ( const value of [ 0, 1, 2, 3, - 1, - 2 ] ) {

					for ( const [ name, create ] of Object.entries( { int, float } ) ) {

						const first = create( value );
						const second = create( value );

						assert.notStrictEqual( first, second, `${ name }(${ value }) creates independent constants` );
						assert.strictEqual( first.value, value, `${ name }(${ value }) preserves the value` );
						assert.strictEqual( second.value, value, `${ name }(${ value }) preserves the second value` );
						assert.isTrue( first.assignable, `${ name }(${ value }) is assignable` );
						assert.isFalse( first.isWeak, `${ name }(${ value }) keeps its explicit type` );

					}

				}

			} );

			test( 'Assignable shared constants', () => {

				const shared = nodeObject( 1 );
				const first = nodeObjectAssignable( 1 );
				const second = nodeObjectAssignable( shared );

				assert.strictEqual( nodeObject( 1 ), shared, 'Plain constants remain cached' );
				assert.notStrictEqual( first, shared, 'Assignable constants do not reuse the shared node' );
				assert.notStrictEqual( second, shared, 'A shared constant passed as a node is copied' );
				assert.notStrictEqual( first, second, 'Assignable constants remain independent' );
				assert.isFalse( shared.assignable, 'The cached constant remains unchanged' );
				assert.isTrue( first.assignable, 'The first copy is assignable' );
				assert.isTrue( second.assignable, 'The second copy is assignable' );
				assert.strictEqual( first.isWeak, shared.isWeak, 'The copy preserves implicit numeric typing' );
				assert.strictEqual( first.toAssignable(), first, 'toAssignable() preserves node identity' );
				assert.strictEqual( nodeObjectAssignable( first ), first, 'A node outside the shared cache retains its identity' );

			} );

		} );

	} );

} );
