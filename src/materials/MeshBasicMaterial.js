/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 
 * params = {
 * 	color: hex,
 *  bitmap: new THREE.UVMap( <Image> ),
 *  alpha: float,
 *  blending: THREE.AdditiveBlending,
 *  wireframe: false
 * }
 */

THREE.MeshBasicMaterial = function ( params ) {

    this.id = THREE.MeshBasicMaterialCounter.value ++;
    
    this.params = this.setDefaultParams( params );

	this.toString = function () {

		return 'THREE.MeshBasicMaterial ( color: ' + this.params.color 
        + ', alpha: ' + this.params.alpha 
        + ', blending: ' + this.params.blending 
        + ', wireframe: ' + this.params.wireframe 
        + ', id: ' + this.id + ' )';

	};

};

THREE.MeshBasicMaterial.prototype.setDefaultParams = function ( override ) {
    
    var params = {
        color: new THREE.Color( 0xeeeeee ),
        bitmap: null,
        alpha: 1.0,
        blending: THREE.AdditiveBlending,
        wireframe: false
    };
        
    if ( override != undefined ) {
        
        if( override.color != undefined ) params.color = new THREE.Color( override.color );
        if( override.bitmap != undefined ) params.bitmap = override.bitmap;
        
        if( override.alpha != undefined ) params.alpha = override.alpha;
        if( override.blending != undefined ) params.blending = override.blending;
        if( override.wireframe != undefined ) params.wireframe = override.wireframe;
        
    }
    
    return params;
    
};

THREE.MeshBasicMaterialCounter = { value: 0 };