/**
 * @author simonThiele / https://github.com/simonThiele
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { Face3 } from '../../../../src/core/Face3';
import { Color } from '../../../../src/math/Color';
import { Vector3 } from '../../../../src/math/Vector3';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'Face3', () => {

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// PUBLIC STUFF
		QUnit.test( "copy", ( assert ) => {

			var instance = new Face3( 0, 1, 2, new Vector3( 0, 1, 0 ), new Color( 0.25, 0.5, 0.75 ), 2 );
			var copiedInstance = new Face3().copy( instance );

			checkCopy( copiedInstance, assert );
			checkVertexAndColors( copiedInstance, assert );

		} );

		QUnit.test( "copy (more)", ( assert ) => {

			var instance = new Face3( 0, 1, 2,
				[ new Vector3( 0, 1, 0 ), new Vector3( 1, 0, 1 ) ],
				[ new Color( 0.25, 0.5, 0.75 ), new Color( 1, 0, 0.4 ) ],
				2 );
			var copiedInstance = new Face3().copy( instance );

			checkCopy( copiedInstance, assert );
			checkVertexAndColorArrays( copiedInstance, assert );

		} );

		QUnit.test( "clone", ( assert ) => {

			var instance = new Face3( 0, 1, 2, new Vector3( 0, 1, 0 ), new Color( 0.25, 0.5, 0.75 ), 2 );
			var copiedInstance = instance.clone();

			checkCopy( copiedInstance, assert );
			checkVertexAndColors( copiedInstance, assert );

		} );

		function checkCopy( copiedInstance, assert ) {

			assert.ok( copiedInstance instanceof Face3, "copy created the correct type" );
			assert.ok(
				copiedInstance.a === 0 &&
				copiedInstance.b === 1 &&
				copiedInstance.c === 2 &&
				copiedInstance.materialIndex === 2
				, "properties where copied" );

		}

		function checkVertexAndColors( copiedInstance, assert ) {

			assert.ok(
				copiedInstance.normal.x === 0 && copiedInstance.normal.y === 1 && copiedInstance.normal.z === 0 &&
				copiedInstance.color.r === 0.25 && copiedInstance.color.g === 0.5 && copiedInstance.color.b === 0.75
				, "properties where copied" );

		}

		function checkVertexAndColorArrays( copiedInstance, assert ) {

			assert.ok(
				copiedInstance.vertexNormals[ 0 ].x === 0 && copiedInstance.vertexNormals[ 0 ].y === 1 && copiedInstance.vertexNormals[ 0 ].z === 0 &&
				copiedInstance.vertexNormals[ 1 ].x === 1 && copiedInstance.vertexNormals[ 1 ].y === 0 && copiedInstance.vertexNormals[ 1 ].z === 1 &&
				copiedInstance.vertexColors[ 0 ].r === 0.25 && copiedInstance.vertexColors[ 0 ].g === 0.5 && copiedInstance.vertexColors[ 0 ].b === 0.75 &&
				copiedInstance.vertexColors[ 1 ].r === 1 && copiedInstance.vertexColors[ 1 ].g === 0 && copiedInstance.vertexColors[ 1 ].b === 0.4
				, "properties where copied" );

		}

	} );

} );
