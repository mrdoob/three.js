/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 
 * params = {
 * 	ambient: new THREE.Color(),
 * 	diffuse: new THREE.Color(),
 * 	specular: new THREE.Color(),
 *  diffuse_map: new THREE.UVMap( <Image> ),
 *  specular_map: new THREE.UVMap( <Image> ),
 *  shininess: float,
 *  alpha: float,
 *  shading: THREE.Phong,
 *  blending: THREE.AdditiveBlending,
 *  wireframe: false
 * }
 */

THREE.MeshPhongMaterial = function ( ambient, diffuse, specular, shininess, opacity ) {

    this.id = THREE.MeshPhongMaterial.value ++;
    
    this.params = this.setDefaultParams( params );
    
	this.toString = function () {

		return 'THREE.MeshPhongMaterial ( <br/>ambient: ' + this.params.ambient_color
                + ', <br/>diffuse: ' + this.params.diffuse 
                + ', <br/>specular: ' + this.params.specular 
                + ', <br/>shininess: ' + this.params.shininess 
                + ', <br/>alpha: ' + this.params.alpha
                + ', <br/>shading: ' + this.params.shading
                + ', <br/>wireframe: ' + this.params.wireframe
                + ', <br/>id: ' + this.params.id        
                + ')';

	};

};

THREE.MeshPhongMaterial.setDefaultParams = function ( override ) {
    
    var params = {
        ambient: new THREE.Color( 0x050505 ),
        diffuse: new THREE.Color( 0xeeeeee ),
        specular: new THREE.Color( 0x111111 ),
        diffuse_map: null,
        specular_map: null,
        shininess: 30,
        alpha: 1.0,
        shading: THREE.Gourad,
        blending: THREE.AdditiveBlending,
        wireframe: false
    };
        
    if ( override != undefined ) {
        
        if( override.ambient != undefined ) params.ambient = override.ambient;
        if( override.diffuse != undefined ) params.diffuse = override.diffuse;
        if( override.specular != undefined ) params.specular = override.specular;
        if( override.diffuse_map != undefined ) params.diffuse_map = override.diffuse_map;
        if( override.specular_map != undefined ) params.specular_map = override.specular_map;
        if( override.shininess != undefined ) params.shininess = override.shininess;
        if( override.alpha != undefined ) params.alpha = override.alpha;
        if( override.shading != undefined ) params.shading = override.shading;
        if( override.blending != undefined ) params.blending = override.blending;
        if( override.wireframe != undefined ) params.wireframe = override.wireframe;
        
    }
    
    return params;
    
};

THREE.MeshPhongMaterial = { value: 0 };
