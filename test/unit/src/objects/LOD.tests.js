/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { LOD } from '../../../../src/objects/LOD';

export default QUnit.module( 'Objects', () => {

	QUnit.module.todo( 'LOD', () => {

		// INHERITANCE
		QUnit.test( "Extending", ( assert ) => {} );

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// PROPERTIES
		QUnit.test( "levels", ( assert ) => {} );

		// PUBLIC STUFF
		QUnit.test( "isLOD", ( assert ) => {} );
		QUnit.test( "copy", ( assert ) => {} );
		QUnit.test( "addLevel", ( assert ) => {} );
		QUnit.test( "getObjectForDistance", ( assert ) => {} );
		QUnit.test( "raycast", ( assert ) => {} );
		QUnit.test( "update", ( assert ) => {} );
		QUnit.test( "toJSON", ( assert ) => {} );

	} );

} );
