import { describe, test } from 'vitest';
import { assert } from '../../utils/test-utils.js';

import { PropertyBinding } from '../../../../src/animation/PropertyBinding.js';

import { BoxGeometry } from '../../../../src/geometries/BoxGeometry.js';
import { Mesh } from '../../../../src/objects/Mesh.js';
import { MeshBasicMaterial } from '../../../../src/materials/MeshBasicMaterial.js';

describe( 'Animation', () => {

	describe( 'PropertyBinding', () => {

		// INSTANCING
		test( 'Instancing', () => {

			const geometry = new BoxGeometry();
			const material = new MeshBasicMaterial();
			const mesh = new Mesh( geometry, material );
			const path = '.material.opacity';
			const parsedPath = {
				nodeName: '',
				objectName: 'material',
				objectIndex: undefined,
				propertyName: 'opacity',
				propertyIndex: undefined
			  };

			// mesh, path
			const object = new PropertyBinding( mesh, path );
			assert.ok( object, 'Can instantiate a PropertyBinding.' );

			// mesh, path, parsedPath
			const object_all = new PropertyBinding( mesh, path, parsedPath );
			assert.ok( object_all, 'Can instantiate a PropertyBinding with mesh, path, and parsedPath.' );

		} );

		// STATIC

		test( 'sanitizeNodeName', () => {

			assert.equal(
				PropertyBinding.sanitizeNodeName( 'valid-name-123_' ),
				'valid-name-123_',
				'Leaves valid name intact.'
			);

			assert.equal(
				PropertyBinding.sanitizeNodeName( '急須' ),
				'急須',
				'Leaves non-latin unicode characters intact.'
			);

			assert.equal(
				PropertyBinding.sanitizeNodeName( 'space separated name 123_ -' ),
				'space_separated_name_123__-',
				'Replaces spaces with underscores.'
			);

			assert.equal(
				PropertyBinding.sanitizeNodeName( '"Mátyás" %_* 😇' ),
				'"Mátyás"_%_*_😇',
				'Allows various punctuation and symbols.'
			);

			assert.equal(
				PropertyBinding.sanitizeNodeName( '/invalid: name ^123.[_]' ),
				'invalid_name_^123_',
				'Strips reserved characters.'
			);

		} );

		test( 'parseTrackName', () => {

			const paths = [

				[
					'.property',
					{
						nodeName: undefined,
						objectName: undefined,
						objectIndex: undefined,
						propertyName: 'property',
						propertyIndex: undefined
					}
				],

				[
					'nodeName.property',
					{
						nodeName: 'nodeName',
						objectName: undefined,
						objectIndex: undefined,
						propertyName: 'property',
						propertyIndex: undefined
					}
				],

				[
					'a.property',
					{
						nodeName: 'a',
						objectName: undefined,
						objectIndex: undefined,
						propertyName: 'property',
						propertyIndex: undefined
					}
				],

				[
					'no.de.Name.property',
					{
						nodeName: 'no.de.Name',
						objectName: undefined,
						objectIndex: undefined,
						propertyName: 'property',
						propertyIndex: undefined
					}
				],

				[
					'no.d-e.Name.property',
					{
						nodeName: 'no.d-e.Name',
						objectName: undefined,
						objectIndex: undefined,
						propertyName: 'property',
						propertyIndex: undefined
					}
				],

				[
					'nodeName.property[accessor]',
					{
						nodeName: 'nodeName',
						objectName: undefined,
						objectIndex: undefined,
						propertyName: 'property',
						propertyIndex: 'accessor'
					}
				],

				[
					'nodeName.material.property[accessor]',
					{
						nodeName: 'nodeName',
						objectName: 'material',
						objectIndex: undefined,
						propertyName: 'property',
						propertyIndex: 'accessor'
					}
				],

				[
					'no.de.Name.material.property',
					{
						nodeName: 'no.de.Name',
						objectName: 'material',
						objectIndex: undefined,
						propertyName: 'property',
						propertyIndex: undefined
					}
				],

				[
					'no.de.Name.material[materialIndex].property',
					{
						nodeName: 'no.de.Name',
						objectName: 'material',
						objectIndex: 'materialIndex',
						propertyName: 'property',
						propertyIndex: undefined
					}
				],

				[
					'uuid.property[accessor]',
					{
						nodeName: 'uuid',
						objectName: undefined,
						objectIndex: undefined,
						propertyName: 'property',
						propertyIndex: 'accessor'
					}
				],

				[
					'uuid.objectName[objectIndex].propertyName[propertyIndex]',
					{
						nodeName: 'uuid',
						objectName: 'objectName',
						objectIndex: 'objectIndex',
						propertyName: 'propertyName',
						propertyIndex: 'propertyIndex'
					}
				],

				[
					'parentName/nodeName.property',
					{
						// directoryName is currently unused.
						nodeName: 'nodeName',
						objectName: undefined,
						objectIndex: undefined,
						propertyName: 'property',
						propertyIndex: undefined
					}
				],

				[
					'parentName/no.de.Name.property',
					{
						// directoryName is currently unused.
						nodeName: 'no.de.Name',
						objectName: undefined,
						objectIndex: undefined,
						propertyName: 'property',
						propertyIndex: undefined
					}
				],

				[
					'parentName/parentName/nodeName.property[index]',
					{
						// directoryName is currently unused.
						nodeName: 'nodeName',
						objectName: undefined,
						objectIndex: undefined,
						propertyName: 'property',
						propertyIndex: 'index'
					}
				],

				[
					'.bone[Armature.DEF_cog].position',
					{
						nodeName: undefined,
						objectName: 'bone',
						objectIndex: 'Armature.DEF_cog',
						propertyName: 'position',
						propertyIndex: undefined
					}
				],

				[
					'scene:helium_balloon_model:helium_balloon_model.position',
					{
						nodeName: 'helium_balloon_model',
						objectName: undefined,
						objectIndex: undefined,
						propertyName: 'position',
						propertyIndex: undefined
					}
				],

				[
					'急須.材料[零]',
					{
						nodeName: '急須',
						objectName: undefined,
						objectIndex: undefined,
						propertyName: '材料',
						propertyIndex: '零'
					}
				],

				[
					'📦.🎨[🔴]',
					{
						nodeName: '📦',
						objectName: undefined,
						objectIndex: undefined,
						propertyName: '🎨',
						propertyIndex: '🔴'
					}
				]

			];

			paths.forEach( function ( path ) {

				assert.smartEqual(
					PropertyBinding.parseTrackName( path[ 0 ] ),
					path[ 1 ],
					'Parses track name: ' + path[ 0 ]
				);

			} );

		} );

		// PUBLIC STUFF

		test( 'setValue', () => {

			const paths = [
				'.material.opacity',
				'.material[opacity]'
			];

			paths.forEach( function ( path ) {

				const originalValue = 0;
				const expectedValue = 1;

				const geometry = new BoxGeometry();
				const material = new MeshBasicMaterial();
				material.opacity = originalValue;
				const mesh = new Mesh( geometry, material );

				const binding = new PropertyBinding( mesh, path, null );
				binding.bind();

				assert.equal(
					material.opacity,
					originalValue,
					'Sets property of material with "' + path + '" (pre-setValue)'
				);

				binding.setValue( [ expectedValue ], 0 );
				assert.equal(
					material.opacity,
					expectedValue,
					'Sets property of material with "' + path + '" (post-setValue)'
				);

			} );

		} );

	} );

} );
