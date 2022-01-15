/* global QUnit */

import { Uniform } from '../../../../src/core/Uniform';
import { Vector3 } from '../../../../src/math/Vector3';
import {
	x,
	y,
	z
} from '../math/Constants.tests';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'Uniform', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			var a;
			var b = new Vector3( x, y, z );

			a = new Uniform( 5 );
			assert.strictEqual( a.value, 5, 'New constructor works with simple values' );

			a = new Uniform( b );
			assert.ok( a.value.equals( b ), 'New constructor works with complex values' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'clone', ( assert ) => {

			var a = new Uniform( 23 );
			var b = a.clone();

			assert.strictEqual( b.value, a.value, 'clone() with simple values works' );

			var a = new Uniform( new Vector3( 1, 2, 3 ) );
			var b = a.clone();

			assert.ok( b.value.equals( a.value ), 'clone() with complex values works' );

		} );

	} );

} );
