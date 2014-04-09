/**
 * @author Sean Griffin / http://twitter.com/sgrif
 * @author Michael Guerrero / http://realitymeltdown.com
 */

THREE.BoneHelper = function ( bone, jointBoxSize, scaleRatio ) {

  THREE.Object3D.call( this );

  this.scaleRatio = ( scaleRatio !== undefined ) ? scaleRatio : 1;
  this.bone = bone;

  var jointBoxSize = ( jointBoxSize !== undefined ) ? jointBoxSize : 1;
  var boxSize = jointBoxSize * this.scaleRatio;
  var boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
  var boxMaterial = new THREE.MeshBasicMaterial();

  this.cube = new THREE.Mesh(boxGeometry, boxMaterial);
  this.add(this.cube);

  this.axes = new THREE.AxisHelper( jointBoxSize * 3 );
  this.add( this.axes );

  if ( this.bone.parent instanceof THREE.Bone ) {

    var lineMaterial = new THREE.LineBasicMaterial();
    var lineGeometry = new THREE.Geometry();

    lineMaterial.vertexColors = true;

    lineGeometry.vertices.push( new THREE.Vector3() );
    lineGeometry.vertices.push( new THREE.Vector3() );
    lineGeometry.colors.push( new THREE.Color( 1, 1, 0 ) );
    lineGeometry.colors.push( new THREE.Color( 0, 0, 0 ) );

    this.line = new THREE.Line( lineGeometry, lineMaterial );
    this.add(this.line);

  }

  this.update();
};


THREE.BoneHelper.prototype = Object.create( THREE.Object3D.prototype );

THREE.BoneHelper.prototype.update = function () {

  if ( this.visible && this.bone.parent instanceof THREE.Bone ) {

    this.bone.skinMatrix.decompose( this.cube.position, this.cube.quaternion, this.cube.scale );
    this.cube.position.multiplyScalar( this.scaleRatio );

    this.axes.quaternion = this.cube.quaternion;
    this.axes.position = this.cube.position;
    this.axes.scale = this.cube.scale;

    this.line.geometry.vertices[0].setFromMatrixPosition( this.bone.skinMatrix );
    this.line.geometry.vertices[0].multiplyScalar( this.scaleRatio );

    this.line.geometry.vertices[1].setFromMatrixPosition( this.bone.parent.skinMatrix );
    this.line.geometry.vertices[1].multiplyScalar( this.scaleRatio );

    this.line.geometry.verticesNeedUpdate = true;

  }

};
