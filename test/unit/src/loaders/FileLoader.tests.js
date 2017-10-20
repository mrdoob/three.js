/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { FileLoader } from '../../../../src/loaders/FileLoader';

export default QUnit.module( 'Loaders', () => {

	QUnit.module.todo( 'FileLoader', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// PUBLIC STUFF
		QUnit.test( "load", ( assert ) => {} );

		QUnit.test( "setPath", ( assert ) => {} );

		QUnit.test( "setResponseType", ( assert ) => {} );

		QUnit.test( "setWithCredentials", ( assert ) => {} );

		QUnit.test( "setMimeType", ( assert ) => {} );

		QUnit.test( "setRequestHeader", ( assert ) => {} );

	} );

} );
