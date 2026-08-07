import { MaterialLoader } from '../../../../src/loaders/MaterialLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';
import { ShaderMaterial } from '../../../../src/materials/ShaderMaterial.js';
import { ShadowMaterial } from '../../../../src/materials/ShadowMaterial.js';
import { SpriteMaterial } from '../../../../src/materials/SpriteMaterial.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'MaterialLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new MaterialLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'MaterialLoader extends from Loader'
			);

		} );

		// PROPERTIES
		QUnit.test( 'textures', ( assert ) => {

			const actual = new MaterialLoader().textures;
			const expected = {};
			assert.deepEqual( actual, expected, 'MaterialLoader defines textures.' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new MaterialLoader();
			assert.ok( object, 'Can instantiate a MaterialLoader.' );

		} );

		// OTHERS
		QUnit.test( 'parse - overwritten defaults', ( assert ) => {

			const loader = new MaterialLoader();

			const shaderMaterial = new ShaderMaterial( { fog: true, forceSinglePass: false } );
			const parsedShaderMaterial = loader.parse( shaderMaterial.toJSON() );

			assert.strictEqual( parsedShaderMaterial.fog, true,
				'ShaderMaterial.fog survives serialization.' );
			assert.strictEqual( parsedShaderMaterial.forceSinglePass, false,
				'ShaderMaterial.forceSinglePass survives serialization.' );

			const shadowMaterial = new ShadowMaterial( { transparent: false } );

			assert.strictEqual( loader.parse( shadowMaterial.toJSON() ).transparent, false,
				'ShadowMaterial.transparent survives serialization.' );

			const spriteMaterial = new SpriteMaterial( { transparent: false } );

			assert.strictEqual( loader.parse( spriteMaterial.toJSON() ).transparent, false,
				'SpriteMaterial.transparent survives serialization.' );

		} );

	} );

} );
