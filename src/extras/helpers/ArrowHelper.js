/**
 * @author WestLangley / https://github.com/WestLangley
 * @author zz85 / https://github.com/zz85
 */
 
THREE.ArrowHelper = function ( origin, dir, length, hex ) {

    THREE.Object3D.call( this );

    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push( new THREE.Vertex() );
    lineGeometry.vertices.push( new THREE.Vertex( new THREE.Vector3( 0, 1, 0 ) ) );
    
    line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color : hex } ) );
    this.add( line );
    
    var coneGeometry = new THREE.CylinderGeometry( 0, 0.05, 0.25, 5, 1 );
    
    cone = new THREE.Mesh( coneGeometry, new THREE.MeshBasicMaterial( { color : hex } ) );
    cone.position.set( 0, 1, 0 );
    this.add( cone );
    
    this.position = origin;
    
    this.setDirection( dir );
    
    this.setLength( length );

};

THREE.ArrowHelper.prototype = new THREE.Object3D();
THREE.ArrowHelper.prototype.constructor = THREE.ArrowHelper;

THREE.ArrowHelper.prototype.setDirection = function( dir ) {

    var axis = new THREE.Vector3( 0, 1, 0 ).crossSelf( dir );
    
    var radians = Math.acos( new THREE.Vector3( 0, 1, 0 ).dot( dir.clone().normalize() ) );
    
    this.matrix = new THREE.Matrix4().setRotationAxis( axis.normalize(), radians );
            
    this.rotation.getRotationFromMatrix( this.matrix, this.scale );
    
};

THREE.ArrowHelper.prototype.setLength = function( length ) {

    this.scale.set( length, length, length );

};

THREE.ArrowHelper.prototype.setColor = function( hex ) {

    this.children[0].material.color.setHex( hex );
    this.children[1].material.color.setHex( hex );

};



