/**
 * @author dmarcos - diego.marcos@gmail.com
 *
 * Reusable cursor for threejs scenes
 *
 */

THREE.Cursor = function ( object, renderer ) {

  var scope = this;
  this.object = object;

  var top = Math.tan( THREE.Math.degToRad( object.fov * 0.5 ) ) * object.near;
  var bottom = - top;
  var left = object.aspect * bottom;
  var right = object.aspect * top;
  var near = object.near;
  var far = object.far;

  var cursorPosition = new THREE.Vector3();

  this.pointerLocked = false;
  this.camera = new THREE.OrthographicCamera( left, right, top, bottom, near, far );
  this.scene = new THREE.Scene();
  this.renderer = renderer;

  this.domElement = ( renderer !== undefined ) ? renderer.domElement : document;
  this.domElement.style.cursor = 'none';
  this.mouseVector = new THREE.Vector3(0, 0, 0);

  this.raycaster = new THREE.Raycaster();
  this.pivot = new THREE.Object3D();
  this.cursor = new THREE.Mesh(
    new THREE.SphereGeometry( 0.01, 0.01, 0.01 ),
    new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.DoubleSide } )
  );
  //this.pivot.add( this.cursor );
  this.scene.add( this.cursor );
  this.cursor.position.z = -50;

  this.update = function() {
    var autoClear;
    if ( this.pointerLocked === false ) {
      this.cursor.position.x = this.mouseVector.x;
      this.cursor.position.y = -this.mouseVector.y;
      autoClear = this.renderer.autoClear;
      this.renderer.autoClear = false;
      this.renderer.render( this.scene, this.camera );
      this.renderer.autoClear = autoClear;
    }
  };

  function onMouseMove( e ) {

    var movementX = e.movementX ||
        e.mozMovementX ||
        e.webkitMovementX || 0;

    var movementY = e.movementY ||
        e.mozMovementY ||
        e.webkitMovementY || 0;

    // It converts from screen to camera coordinates
    var mouseX = ( e.clientX / window.innerWidth ) * 2 - 1;
    var mouseY = ( e.clientY / window.innerHeight ) * 2 - 1;

    // cursor position in camera coordinates
   	cursorPosition.copy( scope.cursor.position );
    cursorPosition.project( scope.camera );

    scope.mouseVector.set( mouseX, mouseY, cursorPosition.z );
    scope.mouseVector.unproject( scope.camera );

  }

  function pointerLockChanged() {

  	var pointerLocked =
  		document.pointerLockElement === scope.domElement ||
  		document.mozPointerLockElement === scope.domElement ||
  		document.webkitPointerLockElement === scope.domElement;

    if ( pointerLocked === true ) {
    	scope.scene.remove( scope.cursor );
    	scope.object.add( scope.cursor );
    	scope.cursor.scale.set( 50, 50, 50 );
      scope.pointerLocked = true;
    } else {
    	scope.object.remove( scope.cursor );
    	scope.scene.add( scope.cursor );
    	scope.cursor.scale.set( 1, 1, 1 );
    	scope.pointerLocked = false;
    }

  }

  this.domElement.addEventListener( 'mousemove', onMouseMove );
  document.addEventListener( 'pointerlockchange', pointerLockChanged, false );
  document.addEventListener( 'mozpointerlockchange', pointerLockChanged, false );
  document.addEventListener( 'webkitpointerlockchange', pointerLockChanged, false );

};