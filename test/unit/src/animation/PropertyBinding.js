/**
 * @author TristanVALCKE / https://github.com/TristanVALCKE
 */

QUnit.module( 'PropertyBinding' );

QUnit.test( 'parseTrackName' , function( assert ) {

	var paths = [

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
		]
	];

	paths.forEach( function ( path, i ) {

		assert.smartEqual(
			THREE.PropertyBinding.parseTrackName( path[ 0 ] ),
			path[ 1 ],
			'Parses track name: ' +  path[ 0 ]
		);

	} );
});

QUnit.test( 'sanitizeNodeName' , function( assert ) {

	assert.equal(
		THREE.PropertyBinding.sanitizeNodeName( 'valid-name-123_' ),
		'valid-name-123_',
		'Leaves valid name intact.'
	);

	assert.equal(
		THREE.PropertyBinding.sanitizeNodeName( 'space separated name 123_ -' ),
		'space_separated_name_123__-',
		'Replaces spaces with underscores.'
	);

	assert.equal(
		THREE.PropertyBinding.sanitizeNodeName( '"invalid" name %123%_' ),
		'invalid_name_123_',
		'Strips invalid characters.'
	);

} );
