/**
 * Materials variants extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_variants
 */
export default function GLTFMaterialsVariantsExtension( parser ) {

	this.parser = parser;
	this.name = 'KHR_materials_variants';
	this.addExtensionsToUserData = true;

}

GLTFMaterialsVariantsExtension.prototype.afterRoot = function ( gltf ) {

	var parser = this.parser;
	var json = parser.json;
	var name = this.name;

	if ( ! json.extensions || ! json.extensions[ name ] ) return null;

	var extensionDef = json.extensions[ name ];
	var variantsDef = extensionDef.variants || [];
	var variants = [];

	for ( var i = 0, il = variantsDef.length; i < il; i ++ ) {

		variants.push( variantsDef[ i ].name );

	}

	for ( var i = 0, il = gltf.scenes.length; i < il; i ++ ) {

		gltf.scenes[ i ].userData.variants = variants;

	}

	gltf.userData.variants = variants;

	gltf.userData.selectVariant = function selectVariant ( variantName ) {

		var scenes = gltf.scenes;
		var pending = [];

		for ( var i = 0, il = scenes.length; i < il; i ++ ) {

			var scene = scenes[ i ];

			var variantIndex = variants.indexOf( variantName );

			if ( variantIndex === - 1 ) continue;

			scene.traverse( function ( object ) {

				if ( ! object.isMesh || ! object.userData.gltfExtensions ||
					! object.userData.gltfExtensions[ name ] ) return;

				var meshVariantDef = object.userData.gltfExtensions[ name ];
				var mappings = meshVariantDef.mappings || [];
				var materialIndex = - 1;

				for ( var j = 0, jl = mappings.length; j < jl; j ++ ) {

					var mapping = mappings[ j ];

					if ( mapping.variants.indexOf( variantIndex ) !== - 1 ) {

						materialIndex = mapping.material;
						break;

					}

				}

				if ( materialIndex >= 0 ) {

					if ( ! object.userData.originalMaterial ) {

						object.userData.originalMaterial = object.material;

					}

					pending.push( parser.getDependency( 'material', materialIndex ).then( function ( material ) {

						object.material = material;
						parser.assignFinalMaterial( object );

					} ) );

				} else if ( object.userData.originalMaterial ) {

					object.material = object.userData.originalMaterial;

				}

			} );

		}

		return Promise.all( pending );

	};

};
