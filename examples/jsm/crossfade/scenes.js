function generateGeometry( objectType, numObjects ) {

	function applyVertexColors( geometry, color ) {

		var position = geometry.attributes.position;
		var colors = [];

		for ( var i = 0; i < position.count; i ++ ) {

			colors.push( color.r, color.g, color.b );

		}

		geometry.addAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

	}

	var geometries = [];

	var matrix = new Matrix4();
	var position = new Vector3();
	var rotation = new Euler();
	var quaternion = new Quaternion();
	var scale = new Vector3();
	var color = new Color();

	for ( var i = 0; i < numObjects; i ++ ) {

		position.x = Math.random() * 10000 - 5000;
		position.y = Math.random() * 6000 - 3000;
		position.z = Math.random() * 8000 - 4000;

		rotation.x = Math.random() * 2 * Math.PI;
		rotation.y = Math.random() * 2 * Math.PI;
		rotation.z = Math.random() * 2 * Math.PI;
		quaternion.setFromEuler( rotation, false );

		scale.x = Math.random() * 200 + 100;

		var geometry;

		if ( objectType === 'cube' ) {

			geometry = new BoxBufferGeometry( 1, 1, 1 );
			geometry = geometry.toNonIndexed(); // merging needs consistent buffer geometries
			scale.y = Math.random() * 200 + 100;
			scale.z = Math.random() * 200 + 100;
			color.setRGB( 0, 0, 0.1 + 0.9 * Math.random() );

		} else if ( objectType === 'sphere' ) {

			geometry = new IcosahedronBufferGeometry( 1, 1 );
			scale.y = scale.z = scale.x;
			color.setRGB( 0.1 + 0.9 * Math.random(), 0, 0 );

		}

		// give the geom's vertices a random color, to be displayed
		applyVertexColors( geometry, color );

		matrix.compose( position, quaternion, scale );
		geometry.applyMatrix( matrix );

		geometries.push( geometry );

	}

	return BufferGeometryUtils.mergeBufferGeometries( geometries );

}

function Scene( type, numObjects, cameraZ, fov, rotationSpeed, clearColor ) {

	this.clearColor = clearColor;

	this.camera = new PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, 10000 );
	this.camera.position.z = cameraZ;

	// Setup scene
	this.scene = new Scene();
	this.scene.add( new AmbientLight( 0x555555 ) );

	var light = new SpotLight( 0xffffff, 1.5 );
	light.position.set( 0, 500, 2000 );
	this.scene.add( light );

	this.rotationSpeed = rotationSpeed;

	var defaultMaterial = new MeshPhongMaterial( { color: 0xffffff, flatShading: true, vertexColors: VertexColors } );
	this.mesh = new Mesh( generateGeometry( type, numObjects ), defaultMaterial );
	this.scene.add( this.mesh );

	var renderTargetParameters = { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBFormat, stencilBuffer: false };
	this.fbo = new WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );

	this.render = function ( delta, rtt ) {

		this.mesh.rotation.x += delta * this.rotationSpeed.x;
		this.mesh.rotation.y += delta * this.rotationSpeed.y;
		this.mesh.rotation.z += delta * this.rotationSpeed.z;

		renderer.setClearColor( this.clearColor );

		if ( rtt ) {

			renderer.setRenderTarget( this.fbo );
			renderer.clear();
			renderer.render( this.scene, this.camera );

		} else {

			renderer.setRenderTarget( null );
			renderer.render( this.scene, this.camera );

		}

	};

}

export {  };
