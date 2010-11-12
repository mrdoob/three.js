/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 
 * params = {
 * 	diffuse: new THREE.Color(),
 *  diffuse_map: new THREE.UVMap( <Image> ),
 *  alpha: float,
 *  shading: THREE.Gourad,
 *  blending: THREE.AdditiveBlending,
 *  wireframe: false
 * }
 */

THREE.MeshLambertMaterial = function ( params ) {

    this.id = THREE.MeshLambertMaterial.value ++;
    
    this.params = this.setDefaultParams( params );
    
	this.toString = function () {

		return 'THREE.MeshLambertMaterial ( diffuse: ' + this.params.diffuse 
        + ', alpha: ' + this.params.alpha 
        + ', shading: ' + this.params.shading 
        + ', blending: ' + this.params.blending 
        + ', wireframe: ' + this.params.wireframe 
        + ', id: ' + this.id +' )';

	};

};

THREE.MeshLambertMaterial.setDefaultParams = function ( override ) {
    
    var params = {
        diffuse: new THREE.Color( 0xeeeeee ),
        diffuse_map: null,
        alpha: 1.0,
        shading: THREE.Gourad,
        blending: THREE.AdditiveBlending,
        wireframe: false
    };
        
    if ( override != undefined ) {
        
        if( override.diffuse != undefined ) params.diffuse = override.diffuse;
        if( override.diffuse_map != undefined ) params.diffuse_map = override.diffuse_map;
        if( override.alpha != undefined ) params.alpha = override.alpha;
        if( override.shading != undefined ) params.shading = override.shading;
        if( override.blending != undefined ) params.blending = override.blending;
        if( override.wireframe != undefined ) params.wireframe = override.wireframe;
        
    }
    
    return params;
    
};

THREE.MeshLambertMaterial = { value: 0 };
