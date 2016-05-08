/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.RawShaderMaterial = function ( parameters ) {

	THREE.ShaderMaterial.call( this, parameters );

};

THREE.Asset.assignPrototype( THREE.RawShaderMaterial, THREE.ShaderMaterial, {

	type: 'RawShaderMaterial'

} );
