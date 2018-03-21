/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { NothingsIsExportedYet } from '../../../../editor/js/commands/AddScriptCommand';

export default QUnit.module( 'Editor', () => {

	QUnit.module( 'Commands', () => {

		QUnit.module.todo( 'AddScriptCommand', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

} );
