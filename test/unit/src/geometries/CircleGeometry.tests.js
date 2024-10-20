/* global QUnit */

import { CircleGeometry } from '../../../../src/geometries/CircleGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'CircleGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				segments: 20,
				thetaStart: 0.1,
				thetaLength: 0.2
			};

			geometries = [
				new CircleGeometry(),
				new CircleGeometry( parameters.radius ),
				new CircleGeometry( parameters.radius, parameters.segments ),
				new CircleGeometry( parameters.radius, parameters.segments, parameters.thetaStart ),
				new CircleGeometry( parameters.radius, parameters.segments, parameters.thetaStart, parameters.thetaLength ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new CircleGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'CircleGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new CircleGeometry();
			assert.ok( object, 'Can instantiate a CircleGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new CircleGeometry();
			assert.ok(
				object.type === 'CircleGeometry',
				'CircleGeometry.type should be CircleGeometry'
			);

		} );

		// PARAMETERS
		QUnit.test( 'parameters', ( assert ) => {

			assert.ok(
				geometries[ 0 ].parameters.radius === 1,
				geometries[ 0 ].parameters.segments === 32,
				geometries[ 0 ].parameters.thetaStart === 0,
				geometries[ 0 ].parameters.thetaLength === 6.283185307179586,
				geometries[ 1 ].parameters.radius === 10,
				geometries[ 0 ].parameters.segments === 32,
				geometries[ 0 ].parameters.thetaStart === 0,
				geometries[ 0 ].parameters.thetaLength === 6.283185307179586,
				geometries[ 2 ].parameters.radius === 10,
				geometries[ 2 ].parameters.segments === 20,
				geometries[ 0 ].parameters.thetaStart === 0,
				geometries[ 0 ].parameters.thetaLength === 6.283185307179586,
				geometries[ 3 ].parameters.radius === 10,
				geometries[ 3 ].parameters.segments === 20,
				geometries[ 3 ].parameters.thetaStart === 0.1,
				geometries[ 0 ].parameters.thetaLength === 6.283185307179586,
				geometries[ 4 ].parameters.radius === 10,
				geometries[ 4 ].parameters.segments === 20,
				geometries[ 4 ].parameters.thetaStart === 0.1,
				geometries[ 4 ].parameters.thetaLength === 0.2
			);

		} );

		// STATIC
		QUnit.test( 'fromJSON', ( assert ) => {

			const geometriesToJSON = new Array( geometries.length );
			const geometriesToObj = new Array( geometries.length );

			geometries.forEach( function ( geometry, index ) {

				geometriesToJSON[ index ] = JSON.stringify( geometries[ index ], [ 'radius', 'segments', 'thetaStart', 'thetaLength' ] );

			} );

			geometries.forEach( function ( object, index ) {

				geometriesToObj[ index ] = ( CircleGeometry.fromJSON( object ) );

			} );

			assert.ok(
				geometriesToObj[ 0 ].parameters.radius === 1,
				geometriesToObj[ 0 ].parameters.segments === 32,
				geometriesToObj[ 0 ].parameters.thetaStart === 0,
				geometriesToObj[ 0 ].parameters.thetaLength === 6.283185307179586,
				geometriesToObj[ 1 ].parameters.radius === 10,
				geometriesToObj[ 0 ].parameters.segments === 32,
				geometriesToObj[ 0 ].parameters.thetaStart === 0,
				geometriesToObj[ 0 ].parameters.thetaLength === 6.283185307179586,
				geometriesToObj[ 2 ].parameters.radius === 10,
				geometriesToObj[ 2 ].parameters.segments === 20,
				geometriesToObj[ 0 ].parameters.thetaStart === 0,
				geometriesToObj[ 0 ].parameters.thetaLength === 6.283185307179586,
				geometriesToObj[ 3 ].parameters.radius === 10,
				geometriesToObj[ 3 ].parameters.segments === 20,
				geometriesToObj[ 3 ].parameters.thetaStart === 0.1,
				geometriesToObj[ 0 ].parameters.thetaLength === 6.283185307179586,
				geometriesToObj[ 4 ].parameters.radius === 10,
				geometriesToObj[ 4 ].parameters.segments === 20,
				geometriesToObj[ 4 ].parameters.thetaStart === 0.1,
				geometriesToObj[ 4 ].parameters.thetaLength === 0.2
			);

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
