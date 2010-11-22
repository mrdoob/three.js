/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  env_map: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 * }
 */
 
THREE.MeshCubeMaterial = function ( parameters ) {
    
    this.id = THREE.MeshCubeMaterial.value ++;
    
	this.env_map = null;
    this.blending = THREE.NormalBlending;
    
	if ( parameters ) {

		if ( parameters.env_map !== undefined ) this.env_map = parameters.env_map;

	}
    
	this.toString = function () {

		return 'THREE.MeshCubeMaterial( ' +
			'id: ' + this.id + '<br/>' +
			'env_map: ' + this.env_map + ' )';

	};
    
}

THREE.MeshCubeMaterialCounter = { value: 0 };

