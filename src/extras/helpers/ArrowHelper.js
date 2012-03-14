/**
 * @author WestLangley / https://github.com/WestLangley
 * @author zz85 / https://github.com/zz85
 */
THREE.ArrowHelper = function (origin, dir, scale, color) {

    THREE.Object3D.call( this );

    // line
    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push( new THREE.Vertex() );
    lineGeometry.vertices.push( new THREE.Vertex( new THREE.Vector3( 0, 1, 0 ) ) );
    line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color : color } ) );
    this.add( line );
    
    // tip
    var coneGeometry = new THREE.CylinderGeometry( 0, 0.05, 0.25, 5, 1 );
    cone = new THREE.Mesh( coneGeometry, new THREE.MeshBasicMaterial( { color : color } ) );
    cone.position.set( 0, 1, 0 );
    this.add( cone );
    
    // position
    this.position = origin;
    
    this.orientate(dir);
    
    this.scale.set( scale, scale, scale );

};

THREE.ArrowHelper.prototype = new THREE.Object3D();
THREE.ArrowHelper.prototype.constructor = THREE.ArrowHelper;

THREE.ArrowHelper.prototype.orientate = function(dir) {
      // orientation - object matrix
    var axis = new THREE.Vector3( 0, 1, 0 ).crossSelf( dir );
    var radians = Math.acos( new THREE.Vector3( 0, 1, 0 ).dot( dir.normalize() ) );
    var rotationMatrix = new THREE.Matrix4();
    rotationMatrix.setRotationAxis( axis.normalize(), radians );
    this.matrix.multiplySelf( rotationMatrix );
    
    // orientation - euler rotation vector
    this.rotation.getRotationFromMatrix( this.matrix, this.scale );
};