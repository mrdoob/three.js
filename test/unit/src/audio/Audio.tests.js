/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { Audio } from '../../../../src/audio/Audio';

export default QUnit.module( 'Audios', () => {

	QUnit.module.todo( 'Audio', () => {

		// INHERITANCE
		QUnit.test( "Extending", ( assert ) => {} );

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// PUBLIC STUFF
		QUnit.test( "getOutput", ( assert ) => {} );

		QUnit.test( "setNodeSource", ( assert ) => {} );

		QUnit.test( "setBuffer", ( assert ) => {} );

		QUnit.test( "play", ( assert ) => {} );

		QUnit.test( "pause", ( assert ) => {} );

		QUnit.test( "stop", ( assert ) => {} );

		QUnit.test( "connect", ( assert ) => {} );

		QUnit.test( "disconnect", ( assert ) => {} );

		QUnit.test( "getFilters", ( assert ) => {} );

		QUnit.test( "setFilters", ( assert ) => {} );

		QUnit.test( "getFilter", ( assert ) => {} );

		QUnit.test( "setFilter", ( assert ) => {} );

		QUnit.test( "setPlaybackRate", ( assert ) => {} );

		QUnit.test( "getPlaybackRate", ( assert ) => {} );

		QUnit.test( "onEnded", ( assert ) => {} );

		QUnit.test( "getLoop", ( assert ) => {} );

		QUnit.test( "setLoop", ( assert ) => {} );

		QUnit.test( "getVolume", ( assert ) => {} );

		QUnit.test( "setVolume", ( assert ) => {} );

	} );

} );
