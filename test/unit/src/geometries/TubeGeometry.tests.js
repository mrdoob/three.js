/* global QUnit */

import { TubeGeometry, TubeBufferGeometry } from '../../../../src/geometries/TubeGeometry';

import { LineCurve3 } from '../../../../src/extras/curves/LineCurve3';
import { Vector3 } from '../../../../src/math/Vector3';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'TubeGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			var path = new LineCurve3( new Vector3( 0, 0, 0 ), new Vector3( 0, 1, 0 ) );

			geometries = [
				new TubeGeometry( path ),
				new TubeBufferGeometry( path )
			];

		} );

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// OTHERS
		QUnit.todo( 'Standard geometry tests', ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

} );
