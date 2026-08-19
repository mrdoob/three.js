import { LoadingManager } from 'three';
import { USDLoader } from '../../../../examples/jsm/loaders/USDLoader.js';
import { USDComposer, SpecType } from '../../../../examples/jsm/loaders/usd/USDComposer.js';
import { USDCParser } from '../../../../examples/jsm/loaders/usd/USDCParser.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'USDLoader', () => {

			QUnit.test( 'reads the USDC string table after its count prefix', ( assert ) => {

				const parser = new USDCParser();
				const stringIndices = [ 4, 7, 9 ];
				let readIndex = 0;
				let seekOffset = null;

				parser.sections = { STRINGS: { start: 32, size: 20 } };
				parser.reader = {
					seek( offset ) {

						seekOffset = offset;

					},
					readUint64() {

						return stringIndices.length;

					},
					readUint32() {

						return stringIndices[ readIndex ++ ];

					}
				};

				parser._readStrings();

				assert.strictEqual( seekOffset, 32, 'The string section start is used.' );
				assert.deepEqual( parser.strings, stringIndices, 'Only string indices after the count are read.' );

			} );

			QUnit.test( 'resolves inherited material bindings by strength', ( assert ) => {

				const composer = new USDComposer();
				const parentBinding = {
					specType: SpecType.Relationship,
					fields: {
						bindMaterialAs: 'strongerThanDescendants',
						targetPaths: [ '/Root/Materials/Green' ]
					}
				};

				composer.externalVariantSelections = {};
				composer.specsByPath = {
					'/Root': {
						specType: SpecType.Prim,
						fields: {
							typeName: 'Xform',
							variantSelection: { Material: 'Green' },
							variantSetChildren: [ 'Material' ]
						}
					},
					'/Root/{Material=Green}/Parent.material:binding': parentBinding,
					'/Root/Parent/Mesh.material:binding': {
						specType: SpecType.Relationship,
						fields: {
							bindMaterialAs: 'weakerThanDescendants',
							targetPaths: [ '/Root/Materials/White' ]
						}
					}
				};

				assert.strictEqual(
					composer._getMaterialBindingTarget( '/Root/Parent/Mesh' ),
					'/Root/Materials/Green',
					'A stronger inherited variant binding overrides the descendant binding.'
				);

				parentBinding.fields.bindMaterialAs = 'weakerThanDescendants';
				assert.strictEqual(
					composer._getMaterialBindingTarget( '/Root/Parent/Mesh' ),
					'/Root/Materials/White',
					'A descendant binding overrides a weaker inherited binding.'
				);

			} );

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
