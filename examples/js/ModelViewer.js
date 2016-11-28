/**
 * @author jsidd / https://github.com/jsidd
 */
 
 	if ( ! Detector.webgl ) {
 		Detector.addGetWebGLMessage();
 	}

 	var camera, controls, scene, renderer;

 	init();

 	animate();

 	function binarryToStr( data ) {

 		var text = "";
 		var charArray = new Uint8Array( data );
 		for ( var i = 0; i < data.byteLength; i ++ ) {

 			text += String.fromCharCode( charArray[ i ] );

 		}
 		return text;
 	}

 	function resetCamera() {
 		// to do: improvement - resetCamera() does not always result in best view
 		// http://stackoverflow.com/questions/11766163/smart-centering-and-scaling-after-model-import-in-three-js
 		// fit camera to object
 		var bBox = new THREE.Box3().setFromObject(scene);
 		var height = bBox.getSize().y;
 		var dist = height / (2 * Math.tan(camera.fov * Math.PI / 360));
 		var pos = scene.position;

 		// fudge factor so the object doesn't take up the whole view
 		camera.position.set(pos.x, pos.y, dist * 3);
 		camera.lookAt(pos);
 	}

 	function toggleDiv(id) {
 		var div = document.getElementById(id);
 		div.style.display = (div.style.display === 'block') ? 'none' : 'block';
 	}

 	function clearDiv(id) {
 		var div = document.getElementById(id);
 		div.innerHTML = "";
 	}

 	function appendDiv(id, extra) {
 		var div = document.getElementById(id);
 		div.innerHTML = div.innerHTML + extra;
 	}

 	function debugPrint(text)
 	{
 		appendDiv('debug',text);
 	}

 	function clearScene() {
 		clearDiv('debug');
 		camera.position.z = 250;
 		scene.scale.x = scene.scale.y = scene.scale.z = 1.0;

 		for( var i = scene.children.length - 1; i >= 0; i--){
 			obj = scene.children[i];
 			scene.remove(obj);
 		}
 	}

 	function setupLights() {
 		var ambient = new THREE.AmbientLight( 0x101030 );
 		scene.add( ambient );

 		var directionalLight = new THREE.DirectionalLight( 0xffeedd );
 		directionalLight.position.set( 0, 0, 1 );
 		scene.add( directionalLight );
 	}

 	function loadModelFromFile(object)
 	{
 		reloadModel(object, 0);
 	}

 	function reloadModel(object, flgIsPath)
 	{
 		controls.reset();
 		loadModel(object, flgIsPath);
 	}

 	function loadModel(object, flgIsPath)
 	{
 		var token, fileName, fileType;

 		if (flgIsPath === 1)
 		{
 			token = object.split('.');
 		}
 		else
 		{
 			token = object.name.split('.')
 		}

 		fileType = token[token.length-1].toLowerCase();

 		if (fileType === "json")
 		{
 			if (token[token.length-2] === "assimp")
 				fileType = "assimp.json";
  		}

 		if (flgIsPath === 1)
 		{
 			token = object.split('/');
 			fileName = token[token.length-1];
 		}
 		else {
 			fileName = object.name;
 		}

 		var onProgress = function ( xhr ) {
 			if ( xhr.lengthComputable ) {
 				var percentComplete = xhr.loaded / xhr.total * 100;
 				console.log( Math.round(percentComplete, 2) + '% loaded');
 			}
 		};

 		var onError = function ( xhr ) {
 			console.log("There was an error.")
 		};

 		var manager = new THREE.LoadingManager();
 		manager.onProgress = function ( item, loaded, total ) {

 			console.log( item, loaded, total );

 		};

 		var loader = selectLoader(fileType, manager);

 		if (fileType === "dae" )
 		{
 			loader.options.convertUpAxis = true;
 		}
 		else if (fileType === "pcd"){
 			//do something to invert upside down
 		}

 		clearScene();

 		//to do: improvement - setupLights() improve to use better lights
 		setupLights();

 		//to do: improvement - loader.load() note: sea loader does not use onload function - loader.load 2nd param

 		//if flgIsPath is 1, then object is a filepath
 		//otherwise object is a file object that needs to be read
 		if (flgIsPath === 1)
 		{
 			loader.load( object , function ( data ) {

 				debugPrint(object+"<br>");
 				OnLoadScene(data, fileType, fileName);
 				resetCamera();

 				}, onProgress, onError );
 		}
 		else {
 			var reader = new FileReader();
 			reader.addEventListener( 'progress', onProgress);
 			reader.addEventListener('error', onError);
 			reader.addEventListener( 'load', function ( event ) {
 			var data, json;
 			if (fileType === "babylon" || fileType === "gltf"
 				|| fileType === "assimp.json"	|| fileType === "json")
 			{
 				json = JSON.parse(event.target.result);
 				console.log(json);
 				data = loader.parse(json);
 				console.log(data);
 			}
 			else if (fileType === "pcd")
 			{
 				//data = binarryToStr(event.target.result);
 			}
 			else {
 				data = loader.parse( event.target.result);
 			}

 			OnLoadScene(data, fileType, fileName);
 			resetCamera();
 			}
 		);
 		if (fileType === "awd")
 		{
 			reader.readAsArrayBuffer(object);
 		}
 		else if (fileType === "pcd") {

 			//reader.readAsBinaryString(object);
 		}
 		else {
 			reader.readAsText(object);
 		}

 	}
 		//to do: improvement - post loader.load() fixes - handle camera for these files automaticaly
 		if (fileName==="mascot.tjs.sea")
 		{
 			camera.position.z = 2000;
 		}
 		else if (fileName==="house.wrl")
 		{
 			camera.position.z = 30;
 		}
 		else if (fileName==="kawada-hironx.dae"){
 			camera.position.z = 3;
 		}
 		else if (fileName==="duck.gltf"){
 			camera.position.z = 6;
 		}
 		else if (fileName==="Zaghetto.pcd")
 		{
 			//to do: improvement - Zaghetto.pcd need to flip pcd model upside down as needed
 			//to do: improvement - Zaghetto.pcd find correct camera settings
 		}
 	}

 	function init() {

 		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
 		//camera.position.z = 100;
 		camera.position.z = 250;

 		//controls = new THREE.TrackballControls( camera );

 		// scene

 		scene = new THREE.Scene();

 		// texture

 		var texture = new THREE.Texture();

 		var material = new THREE.MeshBasicMaterial( { color: 'red' } );

 		// model
 		var model = 'models/babylon/skull.babylon';
 		loadModel(model, 1);

 		//

 		renderer = new THREE.WebGLRenderer();
 		renderer.setPixelRatio( window.devicePixelRatio );
 		renderer.setSize( window.innerWidth, window.innerHeight );
 		document.body.appendChild( renderer.domElement );

 		//

 		controls = new THREE.OrbitControls( camera, renderer.domElement );

 		window.addEventListener( 'resize', onWindowResize, false );

 	}

 	function printNode(node, header, space)
 	{
 		debugPrint(space+header+": "+node.type+"<br>");
 		var childCount = 0;
 		space+="-";
 		while(node.children.length>0)
 		{
 			childCount++;
 			printNode(node.children.pop(),childCount,space);
 		}
 	}

 	function OnLoadScene(rootNode, objType, objName)
 	{
 		if (objType === "dae" || objType === "gltf" || objType === "sea")
 		{
 			rootNode = rootNode.scene;
 			//scene.scale.x = scene.scale.y = scene.scale.z = 0.05;
 		}

 		printNode(rootNode.clone(),"root","");

 		if (!(rootNode instanceof THREE.Scene))
 		{
 			scene.add(rootNode);
 		}
 		else {
 			while(rootNode.children.length > 0)
 			{
 				scene.add(rootNode.children.pop());
 			}
 		}

 	}

 	//to do: improvement - selectLoader()/OnLoadScene() add support for Geometry Loaders
 	//right now only supports Mesh Loaders
 	function selectLoader(ext, mgr) {
 		switch(ext)
 		{
 			case "wrl":
 				console.log("wrl");
 				return new THREE.VRMLLoader();
 			case "sea":
 				console.log("sea");
 				return new THREE.SEA3D({
 					autoPlay : false, // Auto play animations
 					container : scene // Container to add models
 				} );
 			case "pcd":
 				console.log("pcd");
 				return new THREE.PCDLoader();
 			case "assimp.json":
 				console.log("assimp.json");
 				return new THREE.AssimpJSONLoader( mgr );
 			case "babylon":
 				console.log("babylon");
 				return new THREE.BabylonLoader( mgr );
 			case "obj":
 				console.log("obj");
 				return new THREE.OBJLoader( mgr );
 			case "awd":
 				console.log("awd");
 				return new THREE.AWDLoader( mgr );
 			case "dae":
 				console.log("dae");
 				return new THREE.ColladaLoader( mgr );
 			case "fbx":
 				console.log("fbx");
 				return new THREE.FBXLoader( mgr );
 			case "gltf":
 				console.log("gltf");
 				return new THREE.GLTFLoader( mgr );
 			case "json":
 				console.log("json");
 				return new THREE.ObjectLoader( mgr);
 			default:
 				return null;
 		}
 	}

 	function onWindowResize() {

 		camera.aspect = window.innerWidth / window.innerHeight;
 		camera.updateProjectionMatrix();

 		renderer.setSize( window.innerWidth, window.innerHeight );

 		//controls.handleResize();

 	}

 	//

 	function animate() {

 		requestAnimationFrame( animate );
 		render();

 	}

 	function render() {

 		controls.update();
 		renderer.render( scene, camera );

 	}
