/**
 * @author arodic / https://github.com/arodic
 */

THREE.TransformControlsPlane = function () {

  'use strict';

  THREE.Mesh.call( this,
    new THREE.PlaneBufferGeometry( 1000, 1000, 2, 2 ),
    new THREE.MeshBasicMaterial( { visible: false, wireframe: true, side: THREE.DoubleSide, transparent: true, opacity: 0.1 } )
  );

	this.type = 'TransformControlsPlane';

  var unitX = new THREE.Vector3( 1, 0, 0 );
  var unitY = new THREE.Vector3( 0, 1, 0 );
  var unitZ = new THREE.Vector3( 0, 0, 1 );

	var dirVector = new THREE.Vector3();
	var alignVector = new THREE.Vector3();
  var tempMatrix = new THREE.Matrix4();
  var camRotation = new THREE.Euler();

  this.update = function( rotation, eye ) {

    var axis = this.parent.axis;
    var mode = this.parent.mode;

    unitX.set( 1, 0, 0 ).applyEuler( rotation );
    unitY.set( 0, 1, 0 ).applyEuler( rotation );
    unitZ.set( 0, 0, 1 ).applyEuler( rotation );

    alignVector.copy( unitY );

    switch ( mode ) {
      case 'translate':
      case 'scale':
      switch ( axis ) {
        case 'X':
          alignVector.copy( eye ).cross( unitX );
          dirVector.copy( unitX ).cross( alignVector );
          break;
        case 'Y':
          alignVector.copy( eye ).cross( unitY );
          dirVector.copy( unitY ).cross( alignVector );
          break;
        case 'Z':
          alignVector.copy( eye ).cross( unitZ );
          dirVector.copy( unitZ ).cross( alignVector );
          break;
        case 'XY':
          dirVector.copy( unitZ );
          break;
        case 'YZ':
          dirVector.copy( unitX );
          break;
        case 'XZ':
          dirVector.copy( unitY );
          break;
        case 'XYZ':
        case 'E':
          dirVector.set( 0,0,0 );
          break;
        }
        break;
      case 'rotate':
      default:
        switch ( axis ) {
          // case 'X':
          //   dirVector.copy( unitX );
          //   break;
          // case 'Y':
          //   dirVector.copy( unitY );
          //   break;
          // case 'Z':
          //   dirVector.copy( unitZ );
          //   break;
          default:
            dirVector.set( 0,0,0 );
            break;
        }
        break;
    }

    if ( dirVector.length() === 0 ) {

      var camRotation = new THREE.Euler();
    	// camRotation.setFromRotationMatrix( _tempMatrix.extractRotation( camera.matrixWorld ) );
    	camRotation.setFromRotationMatrix( this.parent.camera.matrixWorld );
      this.quaternion.setFromEuler( camRotation );

    } else {

      tempMatrix.lookAt( this.position, dirVector, alignVector );

      this.quaternion.setFromRotationMatrix( tempMatrix );

    }

    this.updateMatrixWorld();

  };

};

THREE.TransformControlsPlane.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {

  constructor: THREE.TransformControlsPlane,

  isTransformControlsPlane: true

} );
