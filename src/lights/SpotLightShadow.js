/**
 * @author mrdoob / http://mrdoob.com/
<<<<<<< HEAD
 *  @author MasterJames / http://master-domain.com
 */

THREE.SpotLightShadow = function ( camera, owner ) {

	THREE.LightShadow.call( this, camera );

	if(owner === undefined) console.log("THREE.SpotLightShadow requires owner to auto-adjust shadow angle");
	else {

		owner._angle = owner.angle;

		delete owner.angle;

		Object.defineProperty( owner, "angle", {

			set: function ( radians ) {

				this._angle = radians;

				this.shadow.camera.fov = ( THREE.Math.radToDeg( radians ) * 2 );

				this.shadow.camera.updateProjectionMatrix();

			},

			get: function () { return this._angle; }

		} );
	}

};

THREE.SpotLightShadow.prototype = Object.create( THREE.LightShadow.prototype );

THREE.SpotLightShadow.prototype.constructor = THREE.SpotLightShadow;


=======
 */

THREE.SpotLightShadow = function () {

	THREE.LightShadow.call( this, new THREE.PerspectiveCamera( 50, 1, 0.5, 500 ) );

};

THREE.SpotLightShadow.prototype = {

	constructor: THREE.SpotLightShadow,

	update: function ( light ) {

		var fov = THREE.Math.radToDeg( 2 * light.angle );
		var aspect = this.mapSize.width / this.mapSize.height;
		var far = light.distance || 500;

		var camera = this.camera;

		if ( fov !== camera.fov || aspect !== camera.aspect || far !== camera.far ) {

			camera.fov = fov;
			camera.aspect = aspect;
			camera.far = far;
			camera.updateProjectionMatrix();

		}

	}

};
>>>>>>> refs/remotes/mrdoob/dev
