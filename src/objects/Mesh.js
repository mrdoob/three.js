/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Mesh = function ( geometry, material, normUVs ) {

	THREE.Object3D.call( this );

	this.geometry = geometry;
	this.material = material instanceof Array ? material : [ material ];

	this.flipSided = false;
	this.doubleSided = false;

	this.overdraw = false;

    this.materialFaces = {};
        
    this.sortFacesByMaterial();
    if( normUVs ) this.normalizeUVs();

    this.geometry.computeBoundingBox();
    
};

THREE.Mesh.prototype = new THREE.Object3D();
THREE.Mesh.prototype.constructor = THREE.Mesh;

THREE.Mesh.prototype.sortFacesByMaterial = function () {
    
    var f, fl, face, material;

    for ( f = 0, fl = this.geometry.faces.length; f < fl; f++ ) {

        face = this.geometry.faces[ f ];
        material = face.material;

        if ( this.materialFaces[material] == undefined ) 
            this.materialFaces[material] = { 'faces': [] };

        this.materialFaces[material].faces.push( f );

    }

}
    
THREE.Mesh.prototype.normalizeUVs = function () {

    var i,j;
    
    for ( i = 0, l = this.geometry.uvs.length; i < l; i++ ) {

        var uvs = this.geometry.uvs[i];
        
        for ( j = 0, jl = uvs.length; j < jl; j++ ) {
        
            // texture repeat
            // (WebGL does this by default but canvas renderer needs to do it explicitly)
            
            if( uvs[j].u != 1.0 ) uvs[j].u = uvs[j].u - Math.floor(uvs[j].u);
            if( uvs[j].v != 1.0 ) uvs[j].v = uvs[j].v - Math.floor(uvs[j].v);
        }
    }                
}
