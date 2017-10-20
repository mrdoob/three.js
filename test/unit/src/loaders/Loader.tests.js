/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { Loader } from '../../../../src/loaders/Loader';

export default QUnit.module( 'Loaders', () => {

	QUnit.module.todo( 'Loader', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// STATIC STUFF
		QUnit.test( "Handlers.add", ( assert ) => {} );

		QUnit.test( "Handlers.get", ( assert ) => {} );

		// PUBLIC STUFF
		QUnit.test( "extractUrlBase", ( assert ) => {} );

		QUnit.test( "initMaterials", ( assert ) => {} );

		QUnit.test( "createMaterial", ( assert ) => {} );

	} );

} );
