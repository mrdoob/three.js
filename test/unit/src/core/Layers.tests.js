/**
 * @author moraxy / https://github.com/moraxy
 */
/* global QUnit */

import { Layers } from '../../../../src/core/Layers';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'Layers', () => {

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// PUBLIC STUFF
		QUnit.test( "set", ( assert ) => {

			var a = new Layers();

			a.set( 0 );
			assert.strictEqual( a.mask, 1, "Set channel 0" );

			a.set( 1 );
			assert.strictEqual( a.mask, 2, "Set channel 1" );

			a.set( 2 );
			assert.strictEqual( a.mask, 4, "Set channel 2" );

		} );

		QUnit.test( "enable", ( assert ) => {

			var a = new Layers();

			a.set( 0 );
			a.enable( 0 );
			assert.strictEqual( a.mask, 1, "Enable channel 0 with mask 0" );

			a.set( 0 );
			a.enable( 1 );
			assert.strictEqual( a.mask, 3, "Enable channel 1 with mask 0" );

			a.set( 1 );
			a.enable( 0 );
			assert.strictEqual( a.mask, 3, "Enable channel 0 with mask 1" );

			a.set( 1 );
			a.enable( 1 );
			assert.strictEqual( a.mask, 2, "Enable channel 1 with mask 1" );

		} );

		QUnit.test( "toggle", ( assert ) => {

			var a = new Layers();

			a.set( 0 );
			a.toggle( 0 );
			assert.strictEqual( a.mask, 0, "Toggle channel 0 with mask 0" );

			a.set( 0 );
			a.toggle( 1 );
			assert.strictEqual( a.mask, 3, "Toggle channel 1 with mask 0" );

			a.set( 1 );
			a.toggle( 0 );
			assert.strictEqual( a.mask, 3, "Toggle channel 0 with mask 1" );

			a.set( 1 );
			a.toggle( 1 );
			assert.strictEqual( a.mask, 0, "Toggle channel 1 with mask 1" );

		} );

		QUnit.test( "disable", ( assert ) => {

			var a = new Layers();

			a.set( 0 );
			a.disable( 0 );
			assert.strictEqual( a.mask, 0, "Disable channel 0 with mask 0" );

			a.set( 0 );
			a.disable( 1 );
			assert.strictEqual( a.mask, 1, "Disable channel 1 with mask 0" );

			a.set( 1 );
			a.disable( 0 );
			assert.strictEqual( a.mask, 2, "Disable channel 0 with mask 1" );

			a.set( 1 );
			a.disable( 1 );
			assert.strictEqual( a.mask, 0, "Disable channel 1 with mask 1" );

		} );

		QUnit.test( "test", ( assert ) => {

			var a = new Layers();
			var b = new Layers();

			assert.ok( a.test( b ), "Start out true" );

			a.set( 1 );
			assert.notOk( a.test( b ), "Set channel 1 in a and fail the QUnit.test" );

			b.toggle( 1 );
			assert.ok( a.test( b ), "Toggle channel 1 in b and pass again" );

		} );

	} );

} );
