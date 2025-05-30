/* global QUnit */

import { RenderTarget3D } from '../../../../src/core/RenderTarget3D.js';

import { EventDispatcher } from '../../../../src/core/EventDispatcher.js';
import { NearestFilter, RepeatWrapping } from '../../../../src/constants.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'RenderTarget3D', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new RenderTarget3D();
			assert.strictEqual(
				object instanceof EventDispatcher, true,
				'RenderTarget3D extends from EventDispatcher'
			);

			const options = new RenderTarget3D( 1, 1, 1, { magFilter: NearestFilter, wrapR: RepeatWrapping } );
			assert.ok( options.width === 1 && options.height === 1 && options.depth === 1 && options.texture.magFilter === NearestFilter && options.texture.wrapR === RepeatWrapping, 'Can instantiate a RenderTarget3D with texture options.' );

		} );

	} );

} );
