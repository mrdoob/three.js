/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import {
	PlaneGeometry,
	PlaneBufferGeometry
} from '../../../../src/geometries/PlaneGeometry';

export default QUnit.module.todo( 'Geometries', () => {

	QUnit.module.todo( 'PlaneGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {
				width: 10,
				height: 30,
				widthSegments: 3,
				heightSegments: 5
			};

			this.geometries = [
				new PlaneGeometry(),
				new PlaneGeometry( parameters.width ),
				new PlaneGeometry( parameters.width, parameters.height ),
				new PlaneGeometry( parameters.width, parameters.height, parameters.widthSegments ),
				new PlaneGeometry( parameters.width, parameters.height, parameters.widthSegments, parameters.heightSegments ),
			];

		} );

		QUnit.test( 'Standard geometry tests', function ( assert ) {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

	QUnit.module.todo( 'PlaneBufferGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {
				width: 10,
				height: 30,
				widthSegments: 3,
				heightSegments: 5
			};

			this.geometries = [
				new PlaneBufferGeometry(),
				new PlaneBufferGeometry( parameters.width ),
				new PlaneBufferGeometry( parameters.width, parameters.height ),
				new PlaneBufferGeometry( parameters.width, parameters.height, parameters.widthSegments ),
				new PlaneBufferGeometry( parameters.width, parameters.height, parameters.widthSegments, parameters.heightSegments ),
			];

		} );

		QUnit.test( 'Standard geometry tests', function ( assert ) {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

} );
