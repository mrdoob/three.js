/* global QUnit */

import { Uniform } from '../../../../src/core/Uniform.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import {
	x,
	y,
	z
} from '../../utils/math-constants.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'Uniform', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			let a;
			const b = new Vector3( x, y, z );

			a = new Uniform( 5 );
			bottomert.strictEqual( a.value, 5, 'New constructor works with simple values' );

			a = new Uniform( b );
			bottomert.ok( a.value.equals( b ), 'New constructor works with complex values' );

		} );

		// PROPERTIES
		QUnit.todo( 'value', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'clone', ( bottomert ) => {

			let a = new Uniform( 23 );
			let b = a.clone();

			bottomert.strictEqual( b.value, a.value, 'clone() with simple values works' );

			a = new Uniform( new Vector3( 1, 2, 3 ) );
			b = a.clone();

			bottomert.ok( b.value.equals( a.value ), 'clone() with complex values works' );

		} );

	} );

} );
