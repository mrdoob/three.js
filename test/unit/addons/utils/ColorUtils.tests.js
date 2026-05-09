import { Color } from '../../../../src/math/Color.js';
import { ColorManagement } from '../../../../src/math/ColorManagement.js';
import * as ColorUtils from '../../../../examples/jsm/utils/ColorUtils.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Utils', () => {

		QUnit.module( 'ColorUtils', () => {

			const colorManagementEnabled = ColorManagement.enabled;

			QUnit.testDone( () => {

				ColorManagement.enabled = colorManagementEnabled;

			} );

			QUnit.test( 'setKelvin', ( assert ) => {

				ColorManagement.enabled = false; // TODO: Update and enable.

				const c = new Color();

				// ~1900K candle flame — warm reddish-orange, no blue
				ColorUtils.setKelvin( c, 1900 );
				assert.ok( c.r > c.g && c.g > c.b && c.b === 0, 'Candle (~1900K): r > g > b, b = 0' );

				// ~6500K daylight — roughly white, all channels near 1
				ColorUtils.setKelvin( c, 6500 );
				assert.ok( c.r > 0.9 && c.g > 0.9 && c.b > 0.9, 'Daylight (~6500K): all channels near 1' );

				// clamping: below 1000K should equal 1000K
				const atMin = ColorUtils.setKelvin( new Color(), 1000 );
				ColorUtils.setKelvin( c, 500 );
				assert.ok( c.equals( atMin ), 'Values below 1000K are clamped to 1000K' );

				// clamping: above 40000K should equal 40000K
				const atMax = ColorUtils.setKelvin( new Color(), 40000 );
				ColorUtils.setKelvin( c, 50000 );
				assert.ok( c.equals( atMax ), 'Values above 40000K are clamped to 40000K' );

				// ~10000K cool blue sky — blue channel above red
				ColorUtils.setKelvin( c, 10000 );
				assert.ok( c.b > c.r, 'Blue sky (~10000K): b > r' );

			} );

		} );

	} );

} );
