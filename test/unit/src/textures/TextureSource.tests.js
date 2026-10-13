import { TextureSource } from '../../../../src/textures/TextureSource.js';
import { Vector3 } from '../../../../src/math/Vector3.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'TextureSource', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new TextureSource();
			assert.ok( object, 'Can instantiate a TextureSource.' );

		} );

		// PUBLIC
		QUnit.test( 'isTextureSource', ( assert ) => {

			const object = new TextureSource();
			assert.ok(
				object.isTextureSource,
				'TextureSource.isTextureSource should be true'
			);

		} );

		QUnit.test( 'getSize', ( assert ) => {

			const target = new Vector3();

			// data with defined dimensions
			new TextureSource( { width: 8, height: 4, depth: 2 } ).getSize( target );
			assert.deepEqual(
				[ target.x, target.y, target.z ],
				[ 8, 4, 2 ],
				'getSize() writes the source dimensions.'
			);

			// null data
			new TextureSource( null ).getSize( target );
			assert.deepEqual(
				[ target.x, target.y, target.z ],
				[ 0, 0, 0 ],
				'getSize() writes zeros when there is no data.'
			);

			// undefined dimensions (e.g. a DepthTexture created without an explicit
			// size) must never be written into the target's numeric fields
			new TextureSource( { width: undefined, height: undefined, depth: 1 } ).getSize( target );
			assert.ok(
				typeof target.x === 'number' && typeof target.y === 'number' && typeof target.z === 'number',
				'getSize() only ever writes numbers into the target vector.'
			);
			assert.deepEqual(
				[ target.x, target.y, target.z ],
				[ 0, 0, 1 ],
				'getSize() coerces undefined dimensions to 0.'
			);

		} );

	} );

} );
