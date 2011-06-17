/**
 * @author mr.doob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author greggman / http://games.greggman.com/
 */

THREE.Camera = function ( fov, aspect, near, far, target ) {

	THREE.Object3D.call( this );

	this.fov = fov || 50;
	this.aspect = aspect || 1;
	this.near = near || 0.1;
	this.far = far || 2000;

	this.target = target || new THREE.Object3D();
	this.useTarget = true;

	this.matrixWorldInverse = new THREE.Matrix4();
	this.projectionMatrix = null;

	this.updateProjectionMatrix();

};

THREE.Camera.prototype = new THREE.Object3D();
THREE.Camera.prototype.constructor = THREE.Camera;
THREE.Camera.prototype.supr = THREE.Object3D.prototype;


THREE.Camera.prototype.translate = function ( distance, axis ) {

	this.matrix.rotateAxis( axis );

	axis.multiplyScalar( distance )

	this.position.addSelf( axis );
	this.target.position.addSelf( axis );

};


THREE.Camera.prototype.updateProjectionMatrix = function () {

	if ( this.fullWidth ) {

		var aspect = this.fullWidth / this.fullHeight;
		var top = Math.tan( this.fov * Math.PI / 360 ) * this.near;
		var bottom = -top;
		var left = aspect * bottom;
		var right = aspect * top;
		var width = Math.abs( right - left );
		var height = Math.abs( top - bottom );

		this.projectionMatrix = THREE.Matrix4.makeFrustum(
			left + this.x * width / this.fullWidth,
			left + ( this.x + this.width ) * width / this.fullWidth,
			top - ( this.y + this.height ) * height / this.fullHeight,
			top - this.y * height / this.fullHeight,
			this.near,
			this.far );

	} else {

		this.projectionMatrix = THREE.Matrix4.makePerspective( this.fov, this.aspect, this.near, this.far );

	}

};

/**
 * Sets an offset in a larger frustum. This is useful for multi-window or
 * multi-monitor/multi-machine setups.
 *
 * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
 * the monitors are in grid like this
 *
 *   +---+---+---+
 *   | A | B | C |
 *   +---+---+---+
 *   | D | E | F |
 *   +---+---+---+
 *
 * then for monitor each monitor you would call it like this
 *
 *   var w = 1920;
 *   var h = 1080;
 *   var fullWidth = w * 3;
 *   var fullHeight = h * 2;
 *
 *   --A--
 *   camera.setOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
 *   --B--
 *   camera.setOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
 *   --C--
 *   camera.setOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
 *   --D--
 *   camera.setOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
 *   --E--
 *   camera.setOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
 *   --F--
 *   camera.setOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
 *
 *   Note there is no reason monitors have to be the same size or in a grid.
 */

THREE.Camera.prototype.setViewOffset = function( fullWidth, fullHeight, x, y, width, height ) {

	this.fullWidth = fullWidth;
	this.fullHeight = fullHeight;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	this.updateProjectionMatrix();

};

THREE.Camera.prototype.update = function ( parentMatrixWorld, forceUpdate, camera ) {

	if ( this.useTarget ) {

		// local

		this.matrix.lookAt( this.position, this.target.position, this.up );
		this.matrix.setPosition( this.position );


		// global

		if( parentMatrixWorld ) {

			this.matrixWorld.multiply( parentMatrixWorld, this.matrix );

		} else {

			this.matrixWorld.copy( this.matrix );

		}

		THREE.Matrix4.makeInvert( this.matrixWorld, this.matrixWorldInverse );

		forceUpdate = true;

	} else {

		this.matrixAutoUpdate && this.updateMatrix();

		if ( forceUpdate || this.matrixWorldNeedsUpdate ) {

			if ( parentMatrixWorld ) {

				this.matrixWorld.multiply( parentMatrixWorld, this.matrix );

			} else {

				this.matrixWorld.copy( this.matrix );

			}

			this.matrixWorldNeedsUpdate = false;
			forceUpdate = true;

			THREE.Matrix4.makeInvert( this.matrixWorld, this.matrixWorldInverse );

		}

	}

	// update children

	for ( var i = 0; i < this.children.length; i ++ ) {

		this.children[ i ].update( this.matrixWorld, forceUpdate, camera );

	}

};
