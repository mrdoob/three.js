/**
 * @author moraxy / https://github.com/moraxy
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { DirectGeometry } from '../../../../src/core/DirectGeometry';
import { Face3 } from '../../../../src/core/Face3';
import { Geometry } from '../../../../src/core/Geometry';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'DirectGeometry', () => {

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// PUBLIC STUFF
		QUnit.test( "computeGroups", ( assert ) => {

			var a = new DirectGeometry();
			var b = new Geometry();
			var expected = [
				{ start: 0, materialIndex: 0, count: 3 },
				{ start: 3, materialIndex: 1, count: 3 },
				{ start: 6, materialIndex: 2, count: 6 }
			];

			// we only care for materialIndex
			b.faces.push(
				new Face3( 0, 0, 0, undefined, undefined, 0 ),
				new Face3( 0, 0, 0, undefined, undefined, 1 ),
				new Face3( 0, 0, 0, undefined, undefined, 2 ),
				new Face3( 0, 0, 0, undefined, undefined, 2 )
			);

			a.computeGroups( b );

			assert.deepEqual( a.groups, expected, "Groups are as expected" );

		} );

	} );

} );
