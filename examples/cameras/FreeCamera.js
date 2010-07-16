/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.FreeCamera = function ( x, y, z ) {

	THREE.Camera.call( this, x, y, z );

	this.rotation = new THREE.Vector3( 0, 0, 0 );

	this.moveZ = function ( amount ) {

		direction.set( this.matrix.n11, this.target.position, this.position );
		depth = direction.length();

		direction.normalize();

		vector.copy( direction );
		vector.multiplyScalar( amount );

		direction.multiplyScalar( depth );

		this.position.addSelf( vector );
		this.target.position.add( this.position, direction );

	};

	this.updateMatrix = function () {

		this.matrix.identity();

		this.matrix.multiplySelf( THREE.Matrix4.translationMatrix( this.position.x, this.position.y, this.position.z ) );
		this.matrix.multiplySelf( THREE.Matrix4.rotationXMatrix( this.rotation.x ) );
		this.matrix.multiplySelf( THREE.Matrix4.rotationYMatrix( this.rotation.y ) );
		this.matrix.multiplySelf( THREE.Matrix4.rotationZMatrix( this.rotation.z ) );
	};

	/*
	var depth = 0;
	var vector = new THREE.Vector3();
	var direction = new THREE.Vector3();

	this.moveX = function ( amount ) {

		direction.sub( this.target.position, this.position );
		depth = direction.length();

		direction.normalize();

		vector.copy( this.up );
		vector.crossSelf( direction );
		vector.multiplyScalar( amount );

		direction.multiplyScalar( depth );

		this.position.subSelf( vector );
		this.target.position.add( this.position, direction );

	};

	this.moveZ = function ( amount ) {

		direction.sub( this.target.position, this.position );
		depth = direction.length();

		direction.normalize();

		vector.copy( direction );
		vector.multiplyScalar( amount );

		direction.multiplyScalar( depth );

		this.position.addSelf( vector );
		this.target.position.add( this.position, direction );

	};

	this.rotateX = function( amount ) { // pitch

		amount *= Math.PI / 180;

		vector.x = direction.x;
		vector.y = ( direction.y * Math.cos( amount ) ) - ( direction.z * Math.sin( amount ) );
		vector.z = ( direction.y * Math.sin( amount ) ) + ( direction.z * Math.cos( amount ) );

		direction.copy( vector );

		vector.set( direction.x, direction.y, direction.z );
		vector.multiplyScalar( 400 );

		this.target.position.copy( this.position );
		this.target.position.addSelf( vector );

	};

	this.rotateY = function( amount ) { // yaw

		amount *= Math.PI / 180;

		direction.sub( this.position, this.target.position );
		depth = direction.length();

		direction.normalize();

		vector.x = ( direction.z * Math.sin( amount ) ) + ( direction.x * Math.cos( amount ) );
		vector.y = direction.y;
		vector.z = ( direction.z * Math.cos( amount ) ) - ( direction.x * Math.sin( amount ) );

		direction.copy( vector );
		direction.multiplyScalar( depth );

		this.target.position.sub( this.position, direction );

	};

	this.rotateZ = function( amount ) { // roll

		amount *= Math.PI / 180;

		vector.x = ( this.up.x * Math.cos( amount ) ) - ( this.up.y * Math.sin( amount ) );
		vector.y = ( this.up.x * Math.sin( amount ) ) + ( this.up.y * Math.cos( amount ) );
		vector.z = this.up.z;

		this.up.copy( vector );

	};
	*/
};

THREE.FreeCamera.prototype = new THREE.Camera();
THREE.FreeCamera.prototype.constructor = THREE.FreeCamera;
