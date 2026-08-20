import { USDLoader } from '../../../../examples/jsm/loaders/USDLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'USDLoader', () => {

			QUnit.test( 'uses timeCodesPerSecond for USDA animation timing', ( assert ) => {

				const usda = `#usda 1.0
(
	defaultPrim = "Root"
	framesPerSecond = 24
	timeCodesPerSecond = 60
)

def Xform "Root"
{
	def Xform "Animated"
	{
		float3 xformOp:translate = (0, 0, 0)
		float3 xformOp:translate.timeSamples = {
			0: (0, 0, 0),
			60: (1, 0, 0),
		}
		uniform token[] xformOpOrder = ["xformOp:translate"]
	}
}`;

				const loader = new USDLoader();
				const scene = loader.parse( usda );
				const clip = scene.animations[ 0 ];
				const track = clip.tracks[ 0 ];

				assert.strictEqual( scene.animations.length, 1, 'One animation clip is created.' );
				assert.strictEqual( clip.name, 'TransformAnimation', 'Transform animation is created.' );
				assert.closeTo( clip.duration, 1, 0.000001, 'Animation duration uses timeCodesPerSecond.' );
				assert.strictEqual( track.name, 'Animated.position', 'Track targets the animated Xform.' );
				assert.deepEqual(
					Array.from( track.times ),
					[ 0, 1 ],
					'Time samples are converted to seconds.'
				);

			} );

		} );

	} );

} );
