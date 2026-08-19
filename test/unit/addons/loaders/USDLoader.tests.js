import { LoadingManager } from 'three';
import { USDLoader } from '../../../../examples/jsm/loaders/USDLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'USDLoader', () => {

			QUnit.test( 'resolves connected asset inputs before fallback values', ( assert ) => {

				const usda = `#usda 1.0
(
	defaultPrim = "Root"
)

def Xform "Root"
{
	def Material "PlaneMaterial"
	{
		asset inputs:baseColorTexture = @base-color.png@
		token outputs:surface.connect = </Root/PlaneMaterial/PreviewSurface.outputs:surface>

		def Shader "BaseColor"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @fallback-orm.png@
			asset inputs:file.connect = </Root/PlaneMaterial.inputs:baseColorTexture>
			float3 outputs:rgb
		}

		def Shader "PreviewSurface"
		{
			uniform token info:id = "UsdPreviewSurface"
			color3f inputs:diffuseColor.connect = </Root/PlaneMaterial/BaseColor.outputs:rgb>
			token outputs:surface
		}
	}

	def Cube "Plane"
	{
		rel material:binding = </Root/PlaneMaterial>
	}
}`;

				const requestedURLs = [];
				const manager = new LoadingManager();
				manager.setURLModifier( ( url ) => {

					requestedURLs.push( url );
					return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

				} );

				new USDLoader( manager ).parse( usda );

				assert.deepEqual(
					requestedURLs,
					[ 'base-color.png' ],
					'The connected material input overrides the texture node fallback.'
				);

			} );

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
