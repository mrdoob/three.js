/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { ObjectLoader } from '../../../../src/loaders/ObjectLoader';

export default QUnit.module( 'Loaders', () => {

	QUnit.module.todo( 'ObjectLoader', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// PUBLIC STUFF
		QUnit.test( "load", ( assert ) => {} );

		QUnit.test( "setTexturePath", ( assert ) => {} );

		QUnit.test( "setCrossOrigin", ( assert ) => {} );

		QUnit.test( "parse", ( assert ) => {} );

		QUnit.test( "parseGeometries", ( assert ) => {} );

		QUnit.test( "parseMaterials", ( assert ) => {} );

		QUnit.test( "parseAnimations", ( assert ) => {} );

		QUnit.test( "parseImages", ( assert ) => {} );

		QUnit.test( "parseTextures", ( assert ) => {} );

		QUnit.test( "parseObject", ( assert ) => {} );

	} );

} );
