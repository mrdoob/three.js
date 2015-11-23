function initScene(width, height) {
	console.log('initScene', width, height);

	camera = new THREE.PerspectiveCamera( 60, width / height, 1, 1000 );
	camera.position.z = 600;

	scene = new THREE.Scene();

	// materials

	var phongMaterial = new THREE.MeshPhongMaterial( {
		color: 0xffffff,
		specular: 0x222222,
		shininess: 150,
		vertexColors: THREE.NoColors,
		shading: THREE.SmoothShading
	} );

	var phongMaterialBox = new THREE.MeshPhongMaterial( {
		color: 0xffffff,
		specular: 0x111111,
		shininess: 100,
		vertexColors: THREE.NoColors,
		shading: THREE.FlatShading
	} );

	var phongMaterialBoxBottom = new THREE.MeshPhongMaterial( {
		color: 0x666666,
		specular: 0x111111,
		shininess: 100,
		vertexColors: THREE.NoColors,
		shading: THREE.FlatShading
	} );

	var phongMaterialBoxLeft = new THREE.MeshPhongMaterial( {
		color: 0x990000,
		specular: 0x111111,
		shininess: 100,
		vertexColors: THREE.NoColors,
		shading: THREE.FlatShading
	} );

	var phongMaterialBoxRight = new THREE.MeshPhongMaterial( {
		color: 0x0066ff,
		specular: 0x111111,
		shininess: 100,
		vertexColors: THREE.NoColors,
		shading: THREE.FlatShading
	} );

	var mirrorMaterialFlat = new THREE.MeshPhongMaterial( {
		color: 0x000000,
		specular: 0xff8888,
		shininess: 10000,
		vertexColors: THREE.NoColors,
		shading: THREE.FlatShading
	} );
	mirrorMaterialFlat.mirror = true;
	mirrorMaterialFlat.reflectivity = 1;

	var mirrorMaterialFlatDark = new THREE.MeshPhongMaterial( {
		color: 0x000000,
		specular: 0xaaaaaa,
		shininess: 10000,
		vertexColors: THREE.NoColors,
		shading: THREE.FlatShading
	} );
	mirrorMaterialFlatDark.mirror = true;
	mirrorMaterialFlatDark.reflectivity = 1;

	var mirrorMaterialSmooth = new THREE.MeshPhongMaterial( {
		color: 0xffaa00,
		specular: 0x222222,
		shininess: 10000,
		vertexColors: THREE.NoColors,
		shading: THREE.SmoothShading
	} );
	mirrorMaterialSmooth.mirror = true;
	mirrorMaterialSmooth.reflectivity = 0.3;

	var glassMaterialFlat = new THREE.MeshPhongMaterial( {
		color: 0x000000,
		specular: 0x00ff00,
		shininess: 10000,
		vertexColors: THREE.NoColors,
		shading: THREE.FlatShading
	} );
	glassMaterialFlat.glass = true;
	glassMaterialFlat.reflectivity = 0.5;

	var glassMaterialSmooth = new THREE.MeshPhongMaterial( {
		color: 0x000000,
		specular: 0xffaa55,
		shininess: 10000,
		vertexColors: THREE.NoColors,
		shading: THREE.SmoothShading
	} );
	glassMaterialSmooth.glass = true;
	glassMaterialSmooth.reflectivity = 0.25;
	glassMaterialSmooth.refractionRatio = 0.6;

	// geometries

	var torusGeometry = new THREE.TorusKnotGeometry( 150 );
	var sphereGeometry = new THREE.SphereGeometry( 100, 16, 8 );
	var planeGeometry = new THREE.BoxGeometry( 600, 5, 600 );
	var boxGeometry = new THREE.BoxGeometry( 100, 100, 100 );

	// TorusKnot

	//torus = new THREE.Mesh( torusGeometry, phongMaterial );
	//scene.add( torus );

	// Sphere

	sphere = new THREE.Mesh( sphereGeometry, phongMaterial );
	sphere.scale.multiplyScalar( 0.5 );
	sphere.position.set( -50, -250+5, -50 );
	scene.add( sphere );

	sphere2 = new THREE.Mesh( sphereGeometry, mirrorMaterialSmooth );
	sphere2.scale.multiplyScalar( 0.5 );
	sphere2.position.set( 175, -250+5, -150 );
	scene.add( sphere2 );

	// Box

	box = new THREE.Mesh( boxGeometry, mirrorMaterialFlat );
	box.position.set( -175, -250+2.5, -150 );
	box.rotation.y = 0.5;
	scene.add( box );

	// Glass

	glass = new THREE.Mesh( sphereGeometry, glassMaterialSmooth );
	glass.scale.multiplyScalar( 0.5 );
	glass.position.set( 75, -250+5, -75 );
	glass.rotation.y = 0.5;
	scene.add( glass );

	// bottom

	plane = new THREE.Mesh( planeGeometry, phongMaterialBoxBottom );
	plane.position.set( 0, -300+2.5, -300 );
	scene.add( plane );

	// top

	plane = new THREE.Mesh( planeGeometry, phongMaterialBox );
	plane.position.set( 0, 300-2.5, -300 );
	scene.add( plane );

	// back

	plane = new THREE.Mesh( planeGeometry, phongMaterialBox );
	plane.rotation.x = 1.57;
	plane.position.set( 0, 0, -300 );
	scene.add( plane );

	plane = new THREE.Mesh( planeGeometry, mirrorMaterialFlatDark );
	plane.rotation.x = 1.57;
	plane.position.set( 0, 0, -300+10 );
	plane.scale.multiplyScalar( 0.85 );
	scene.add( plane );

	// left

	plane = new THREE.Mesh( planeGeometry, phongMaterialBoxLeft );
	plane.rotation.z = 1.57;
	plane.position.set( -300, 0, -300 );
	scene.add( plane );

	// right

	plane = new THREE.Mesh( planeGeometry, phongMaterialBoxRight );
	plane.rotation.z = 1.57;
	plane.position.set( 300, 0, -300 );
	scene.add( plane );

	// light

	var intensity = 70000;

	var light = new THREE.PointLight( 0xffaa55, intensity );
	light.position.set( -200, 100, 100 );
	light.physicalAttenuation = true;
	scene.add( light );

	var light = new THREE.PointLight( 0x55aaff, intensity );
	light.position.set( 200, 100, 100 );
	light.physicalAttenuation = true;
	scene.add( light );

	var light = new THREE.PointLight( 0xffffff, intensity * 1.5 );
	light.position.set( 0, 0, 300 );
	light.physicalAttenuation = true;
	scene.add( light );

	renderer = new THREE.RaytracingRenderer();
	renderer.setSize( width, height );

}