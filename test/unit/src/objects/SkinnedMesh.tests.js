/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { SkinnedMesh } from '../../../../src/objects/SkinnedMesh';

export default QUnit.module( 'Objects', () => {

	QUnit.module.todo( 'SkinnedMesh', () => {

		// INHERITANCE
		QUnit.test( "Extending", ( assert ) => {} );

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// PUBLIC STUFF
		QUnit.test( "isSkinnedMesh", ( assert ) => {} );
		QUnit.test( "initBones", ( assert ) => {} );
		QUnit.test( "bind", ( assert ) => {} );
		QUnit.test( "pose", ( assert ) => {} );
		QUnit.test( "normalizeSkinWeights", ( assert ) => {} );
		QUnit.test( "updateMatrixWorld", ( assert ) => {} );
		QUnit.test( "clone", ( assert ) => {} );

	} );

} );
