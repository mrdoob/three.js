/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { ExtrudeGeometry, ExtrudeBufferGeometry } from '../../../../src/geometries/ExtrudeGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module.todo( 'ExtrudeGeometry', () => {

		// INHERITANCE
		QUnit.test( "Extending", ( assert ) => {} );

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

	} );

	QUnit.module.todo( 'ExtrudeBufferGeometry', () => {

		// INHERITANCE
		QUnit.test( "Extending", ( assert ) => {} );

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// STATIC STUFF
		QUnit.test( "WorldUVGenerator.generateTopUV", ( assert ) => {} );
		QUnit.test( "WorldUVGenerator.generateSideWallUV", ( assert ) => {} );

		// OTHERS
		QUnit.test( "getArrays", ( assert ) => {} );
		QUnit.test( "addShapeList", ( assert ) => {} );
		QUnit.test( "addShape", ( assert ) => {} );


	} );

} );
