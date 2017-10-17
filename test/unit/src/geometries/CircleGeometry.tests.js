/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import {
	CircleGeometry,
	CircleBufferGeometry
} from '../../../../src/geometries/CircleGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'CircleGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				segments: 20,
				thetaStart: 0.1,
				thetaLength: 0.2
			};

			this.geometries = [
				new CircleGeometry(),
				new CircleGeometry( parameters.radius ),
				new CircleGeometry( parameters.radius, parameters.segments ),
				new CircleGeometry( parameters.radius, parameters.segments, parameters.thetaStart ),
				new CircleGeometry( parameters.radius, parameters.segments, parameters.thetaStart, parameters.thetaLength ),
			];

		} );

		QUnit.test( 'standard geometry QUnit.tests', ( assert ) => {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

	QUnit.module( 'CircleBufferGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				segments: 20,
				thetaStart: 0.1,
				thetaLength: 0.2
			};

			this.geometries = [
				new CircleBufferGeometry(),
				new CircleBufferGeometry( parameters.radius ),
				new CircleBufferGeometry( parameters.radius, parameters.segments ),
				new CircleBufferGeometry( parameters.radius, parameters.segments, parameters.thetaStart ),
				new CircleBufferGeometry( parameters.radius, parameters.segments, parameters.thetaStart, parameters.thetaLength ),
			];

		} );

		QUnit.test( 'standard geometry QUnit.tests', ( assert ) => {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

} );
