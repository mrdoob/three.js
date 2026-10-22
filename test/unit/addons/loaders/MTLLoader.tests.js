import { MTLLoader } from '../../../../examples/jsm/loaders/MTLLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'MTLLoader', () => {

			QUnit.test( 'Instancing', ( assert ) => {

				const loader = new MTLLoader();

				assert.ok( loader instanceof MTLLoader, 'Can instantiate an MTLLoader.' );

			} );

			QUnit.test( 'getTextureParams', ( assert ) => {

				const creator = new MTLLoader().parse( 'newmtl material\n', '' );
				let params;

				// -s and -o take u and the optional v and w.

				params = creator.getTextureParams( '-s 2 2 1 texture.png', {} );
				assert.strictEqual( params.url, 'texture.png', 'File name after -s u v w.' );
				assert.deepEqual( params.scale.toArray(), [ 2, 2 ], 'Scale from -s u v w.' );

				params = creator.getTextureParams( '-s 2 3 texture.png', {} );
				assert.strictEqual( params.url, 'texture.png', 'File name after -s u v.' );
				assert.deepEqual( params.scale.toArray(), [ 2, 3 ], 'Scale from -s u v.' );

				params = creator.getTextureParams( '-s 2 texture.png', {} );
				assert.strictEqual( params.url, 'texture.png', 'File name after -s u.' );
				assert.deepEqual( params.scale.toArray(), [ 2, 1 ], 'Scale from -s u keeps the default v.' );

				params = creator.getTextureParams( '-o -0.25 0.5 0 -s 4 4 texture.png', {} );
				assert.strictEqual( params.url, 'texture.png', 'File name after -o and -s.' );
				assert.deepEqual( params.offset.toArray(), [ - 0.25, 0.5 ], 'Offset from -o u v w.' );
				assert.deepEqual( params.scale.toArray(), [ 4, 4 ], 'Scale from -s u v.' );

				// Options the loader does not use are skipped with their values.

				params = creator.getTextureParams( '-blendu off -blendv off -clamp on -texres 512 texture.png', {} );
				assert.strictEqual( params.url, 'texture.png', 'Unused options are not part of the file name.' );

				const matParams = {};
				params = creator.getTextureParams( '-bm 0.5 -imfchan l bump map.png', matParams );
				assert.strictEqual( params.url, 'bump map.png', 'File name with a space after -bm and -imfchan.' );
				assert.strictEqual( matParams.bumpScale, 0.5, 'Bump scale from -bm.' );

				params = creator.getTextureParams( '-mm 0.1 2 displacement.png', matParams );
				assert.strictEqual( params.url, 'displacement.png', 'File name after -mm.' );
				assert.strictEqual( matParams.displacementBias, 0.1, 'Displacement bias from -mm base.' );
				assert.strictEqual( matParams.displacementScale, 2, 'Displacement scale from -mm gain.' );

			} );

		} );

	} );

} );
