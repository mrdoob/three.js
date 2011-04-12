/**
 * @author mikael emtinger / http://gomo.se/
 *
 * parameters = {
 *  fov: <float>,
 *  aspect: <float>,
 *  near: <float>,
 *  far: <float>,
 *  target: <THREE.Object3D>,

 *  movementSpeed: <float>,
 *  lookSpeed: <float>,
 *  rollSpeed: <float>,

 *  autoForward: <bool>,


 *  domElement: <HTMLElement>,
 * }
 */

THREE.RollCamera = function ( fov, aspect, near, far ) {

	THREE.Camera.call( this, fov, aspect, near, far );

	this.forward = new THREE.Vector3( 0, 0, 1 );
	this.roll = 0;
	this.useTarget = false;
	this.matrixAutoUpdate = false;

	var xTemp = new THREE.Vector3();
	var yTemp = new THREE.Vector3();
	var zTemp = new THREE.Vector3();
	var rollMatrix = new THREE.Matrix4();


	// custom update

	this.update = function() {
	
		// clamp forward up / down
		
		if( this.forward.y > 0.9 ) {
			
			this.forward.y = 0.9;
			this.forward.normalize();
			
		} else if( this.forward.y < -0.9 ) {
			
			this.forward.y = -0.9;
			this.forward.normalize();
			
		}


		// construct rotation matrix
	
		zTemp.copy( this.forward );
		yTemp.set( 0, 1, 0 );
	
		xTemp.cross( yTemp, zTemp ).normalize();
		yTemp.cross( zTemp, xTemp ).normalize();
	
		this.matrix.n11 = xTemp.x; this.matrix.n12 = yTemp.x; this.matrix.n13 = zTemp.x;
		this.matrix.n21 = xTemp.y; this.matrix.n22 = yTemp.y; this.matrix.n23 = zTemp.y;
		this.matrix.n31 = xTemp.z; this.matrix.n32 = yTemp.z; this.matrix.n33 = zTemp.z;
		
		// save position and calculate camera matrix
		
	
		rollMatrix.identity();
		rollMatrix.n11 = Math.cos( this.roll ); rollMatrix.n12 = -Math.sin( this.roll );
		rollMatrix.n21 = Math.sin( this.roll ); rollMatrix.n22 =  Math.cos( this.roll );
	
	
		// multiply camera with rotation and set 
	
		this.matrix.multiplySelf( rollMatrix );
		this.matrixWorldNeedsUpdate = true;
	
		
		// set position
	
		this.matrix.n14 = this.position.x;
		this.matrix.n24 = this.position.y;
		this.matrix.n34 = this.position.z;
	
		
		
		// call supr

		this.supr.update.call( this );

	}
	
	this.translateX = function ( distance ) {
		
		this.position.x += this.matrix.n11 * distance;
		this.position.y += this.matrix.n21 * distance;
		this.position.z += this.matrix.n31 * distance;
		
	};
	
	this.translateY = function ( distance ) {
		
		this.position.x += this.matrix.n12 * distance;
		this.position.y += this.matrix.n22 * distance;
		this.position.z += this.matrix.n32 * distance;
		
	};

	this.translateZ = function ( distance ) {
	
		this.position.x -= this.matrix.n13 * distance;
		this.position.y -= this.matrix.n23 * distance;
		this.position.z -= this.matrix.n33 * distance;
	
	};
	

	this.rotateHorizontally = function ( amount ) {
		
		// please note that the amount is NOT degrees, but a scale value
		
		xTemp.set( this.matrix.n11, this.matrix.n21, this.matrix.n31 );
		xTemp.multiplyScalar( amount );

		this.forward.subSelf( xTemp );
		this.forward.normalize();
	
	}
	
	this.rotateVertically = function ( amount ) {
		
		// please note that the amount is NOT degrees, but a scale value
		
		yTemp.set( this.matrix.n12, this.matrix.n22, this.matrix.n32 );
		yTemp.multiplyScalar( amount );
		
		this.forward.addSelf( yTemp );
		this.forward.normalize();
	
	}

}


THREE.RollCamera.prototype = new THREE.Camera();
THREE.RollCamera.prototype.constructor = THREE.RollCamera;
THREE.RollCamera.prototype.supr = THREE.Camera.prototype;


