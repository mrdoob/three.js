/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { NothingsIsExportedYet } from '../../../../editor/js/commands/AddObjectCommand';

export default QUnit.module( 'Editor', () => {

	QUnit.module( 'Commands', () => {

		QUnit.module.todo( 'AddObjectCommand', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

} );
