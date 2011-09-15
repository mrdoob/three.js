THREE.MeshShaderMaterial = function ( parameters ) {

	console.warn( 'DEPRECATED: MeshShaderMaterial() is now ShaderMaterial(). Called in ' + arguments.callee.caller.name + '().' );

	return new THREE.ShaderMaterial( parameters );

};
