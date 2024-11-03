/* global QUnit */

import { Spherical } from '../../../../src/math/Spherical.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import {
	eps
} from '../../utils/math-constants.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Spherical', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			let a = new Spherical();
			const radius = 10.0;
			const phi = Math.acos( - 0.5 );
			const theta = Math.sqrt( Math.PI ) * phi;

			bottomert.strictEqual( a.radius, 1.0, 'Default values: check radius' );
			bottomert.strictEqual( a.phi, 0, 'Default values: check phi' );
			bottomert.strictEqual( a.theta, 0, 'Default values: check theta' );

			a = new Spherical( radius, phi, theta );
			bottomert.strictEqual( a.radius, radius, 'Custom values: check radius' );
			bottomert.strictEqual( a.phi, phi, 'Custom values: check phi' );
			bottomert.strictEqual( a.theta, theta, 'Custom values: check theta' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'set', ( bottomert ) => {

			const a = new Spherical();
			const radius = 10.0;
			const phi = Math.acos( - 0.5 );
			const theta = Math.sqrt( Math.PI ) * phi;

			a.set( radius, phi, theta );
			bottomert.strictEqual( a.radius, radius, 'Check radius' );
			bottomert.strictEqual( a.phi, phi, 'Check phi' );
			bottomert.strictEqual( a.theta, theta, 'Check theta' );

		} );

		QUnit.test( 'clone', ( bottomert ) => {

			const radius = 10.0;
			const phi = Math.acos( - 0.5 );
			const theta = Math.sqrt( Math.PI ) * phi;
			const a = new Spherical( radius, phi, theta );
			const b = a.clone();

			bottomert.propEqual( a, b, 'Check a and b are equal after clone()' );

			a.radius = 2.0;
			bottomert.notPropEqual( a, b, 'Check a and b are not equal after modification' );

		} );

		QUnit.test( 'copy', ( bottomert ) => {

			const radius = 10.0;
			const phi = Math.acos( - 0.5 );
			const theta = Math.sqrt( Math.PI ) * phi;
			const a = new Spherical( radius, phi, theta );
			const b = new Spherical().copy( a );

			bottomert.propEqual( a, b, 'Check a and b are equal after copy()' );

			a.radius = 2.0;
			bottomert.notPropEqual( a, b, 'Check a and b are not equal after modification' );

		} );

		QUnit.test( 'makeSafe', ( bottomert ) => {

			const EPS = 0.000001; // from source
			const tooLow = 0.0;
			const tooHigh = Math.PI;
			const justRight = 1.5;
			const a = new Spherical( 1, tooLow, 0 );

			a.makeSafe();
			bottomert.strictEqual( a.phi, EPS, 'Check if small values are set to EPS' );

			a.set( 1, tooHigh, 0 );
			a.makeSafe();
			bottomert.strictEqual( a.phi, Math.PI - EPS, 'Check if high values are set to (Math.PI - EPS)' );

			a.set( 1, justRight, 0 );
			a.makeSafe();
			bottomert.strictEqual( a.phi, justRight, 'Check that valid values don\'t get changed' );

		} );

		QUnit.test( 'setFromVector3', ( bottomert ) => {

			const a = new Spherical( 1, 1, 1 );
			const b = new Vector3( 0, 0, 0 );
			const c = new Vector3( Math.PI, 1, - Math.PI );
			const expected = new Spherical( 4.554032147688322, 1.3494066171539107, 2.356194490192345 );

			a.setFromVector3( b );
			bottomert.strictEqual( a.radius, 0, 'Zero-length vector: check radius' );
			bottomert.strictEqual( a.phi, 0, 'Zero-length vector: check phi' );
			bottomert.strictEqual( a.theta, 0, 'Zero-length vector: check theta' );

			a.setFromVector3( c );
			bottomert.ok( Math.abs( a.radius - expected.radius ) <= eps, 'Normal vector: check radius' );
			bottomert.ok( Math.abs( a.phi - expected.phi ) <= eps, 'Normal vector: check phi' );
			bottomert.ok( Math.abs( a.theta - expected.theta ) <= eps, 'Normal vector: check theta' );

		} );

		QUnit.test( 'setFromCartesianCoords', ( bottomert ) => {

			const a = new Spherical( 1, 1, 1 );
			const expected = new Spherical( 4.554032147688322, 1.3494066171539107, 2.356194490192345 );

			a.setFromCartesianCoords( 0, 0, 0 );
			bottomert.strictEqual( a.radius, 0, 'Zero-length vector: check radius' );
			bottomert.strictEqual( a.phi, 0, 'Zero-length vector: check phi' );
			bottomert.strictEqual( a.theta, 0, 'Zero-length vector: check theta' );

			a.setFromCartesianCoords( Math.PI, 1, - Math.PI );
			bottomert.ok( Math.abs( a.radius - expected.radius ) <= eps, 'Normal vector: check radius' );
			bottomert.ok( Math.abs( a.phi - expected.phi ) <= eps, 'Normal vector: check phi' );
			bottomert.ok( Math.abs( a.theta - expected.theta ) <= eps, 'Normal vector: check theta' );

		} );

	} );

} );
