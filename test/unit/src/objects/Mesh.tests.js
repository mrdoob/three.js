/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { Mesh } from '../../../../src/objects/Mesh';

export default QUnit.module( 'Objects', () => {

	QUnit.module.todo( 'Mesh', () => {

		// INHERITANCE
		QUnit.test( "Extending", ( assert ) => {} );

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// PUBLIC STUFF
		QUnit.test( "isMesh", ( assert ) => {} );
		QUnit.test( "setDrawMode", ( assert ) => {} );
		QUnit.test( "copy", ( assert ) => {} );
		QUnit.test( "updateMorphTargets", ( assert ) => {} );
		QUnit.test( "raycast", ( assert ) => {} );
		QUnit.test( "clone", ( assert ) => {} );


	} );

} );
