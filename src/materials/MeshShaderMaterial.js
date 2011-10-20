THREE.MeshShaderMaterial = function ( parameters ) {

	console.warn( 'DEPRECATED: MeshShaderMaterial() is now ShaderMaterial().' );

	return new THREE.ShaderMaterial( parameters );

};
