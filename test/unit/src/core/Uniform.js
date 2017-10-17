/**
 * @author moraxy / https://github.com/moraxy
 */
/* global QUnit */

import { Uniform } from '../../../../src/core/Uniform';
import { Vector3 } from '../../../../src/math/Vector3';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'Uniform', () => {

		QUnit.test( "constructor", function ( assert ) {

			var a;
			var b = new Vector3( x, y, z );

			a = new Uniform( 5 );
			assert.strictEqual( a.value, 5, "New constructor works with simple values" );

			a = new Uniform( b );
			assert.ok( a.value.equals( b ), "New constructor works with complex values" );

		} );

		QUnit.test( "clone", function ( assert ) {

			var a = new Uniform( 23 );
			var b = a.clone();

			assert.strictEqual( b.value, a.value, "clone() with simple values works" );

			a = new Uniform( new Vector3( 1, 2, 3 ) );
			b = a.clone();

			assert.ok( b.value.equals( a.value ), "clone() with complex values works" );

		} );

	} );

} );
