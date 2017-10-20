/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { AudioListener } from '../../../../src/audio/AudioListener.js';

export default QUnit.module( 'Audios', () => {

	QUnit.module.todo( 'AudioListener', () => {

		// INHERITANCE
		QUnit.test( "Extending", ( assert ) => {} );

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// PUBLIC STUFF
		QUnit.test( "getInput", ( assert ) => {} );

		QUnit.test( "removeFilter", ( assert ) => {} );

		QUnit.test( "getFilter", ( assert ) => {} );

		QUnit.test( "setFilter", ( assert ) => {} );

		QUnit.test( "getMasterVolume", ( assert ) => {} );

		QUnit.test( "setMasterVolume", ( assert ) => {} );

		QUnit.test( "updateMatrixWorld", ( assert ) => {} );

	} );

} );
