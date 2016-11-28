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
 		//reloadModel(object, 0);
    clearScene();
 		//to do: improvement - setupLights() improve to use better lights
 		setupLights();
    loadFile(object);
    //to do: improvement - fix camera
    //resetCamera();
 	}

  function addSceneRoot(rootNode)
  {
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

  function loadFile (file)
  {
    //copied with changes to root node loading from:
    //https://github.com/mrdoob/three.js/blob/dev/editor/js/Loader.js
    var filename = file.name;
		var extension = filename.split( '.' ).pop().toLowerCase();

		var reader = new FileReader();
		reader.addEventListener( 'progress', function ( event ) {

			//var size = '(' + Math.floor( event.total / 1000 ).format() + ' KB)';
			//var progress = Math.floor( ( event.loaded / event.total ) * 100 ) + '%';
			//console.log( 'Loading', filename, size, progress );

		} );

    switch ( extension ) {

			case 'amf':

				reader.addEventListener( 'load', function ( event ) {

					var loader = new THREE.AMFLoader();
					var amfobject = loader.parse( event.target.result );

					//editor.execute( new AddObjectCommand( amfobject ) );
          addSceneRoot( amfobject );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'awd':

				reader.addEventListener( 'load', function ( event ) {

					var loader = new THREE.AWDLoader();
					var scene = loader.parse( event.target.result );

					//editor.execute( new SetSceneCommand( scene ) );
          addSceneRoot( scene );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'babylon':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					var json = JSON.parse( contents );

					var loader = new THREE.BabylonLoader();
					var scene = loader.parse( json );

					//editor.execute( new SetSceneCommand( scene ) );
          addSceneRoot( scene );

				}, false );
				reader.readAsText( file );

				break;

			case 'babylonmeshdata':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					var json = JSON.parse( contents );

					var loader = new THREE.BabylonLoader();

					var geometry = loader.parseGeometry( json );
					var material = new THREE.MeshStandardMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					//editor.execute( new AddObjectCommand( mesh ) );
          addSceneRoot( mesh );

				}, false );
				reader.readAsText( file );

				break;

			case 'ctm':

				reader.addEventListener( 'load', function ( event ) {

					var data = new Uint8Array( event.target.result );

					var stream = new CTM.Stream( data );
					stream.offset = 0;

					var loader = new THREE.CTMLoader();
					loader.createModel( new CTM.File( stream ), function( geometry ) {

						geometry.sourceType = "ctm";
						geometry.sourceFile = file.name;

						var material = new THREE.MeshStandardMaterial();

						var mesh = new THREE.Mesh( geometry, material );
						mesh.name = filename;

						//editor.execute( new AddObjectCommand( mesh ) );
            addSceneRoot( mesh );

					} );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'dae':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var loader = new THREE.ColladaLoader();
					var collada = loader.parse( contents );

					collada.scene.name = filename;

					//editor.execute( new AddObjectCommand( collada.scene ) );
          addSceneRoot( collada.scene );

				}, false );
				reader.readAsText( file );

				break;

			case 'fbx':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var loader = new THREE.FBXLoader();
					var object = loader.parse( contents );

					//editor.execute( new AddObjectCommand( object ) );
          addSceneRoot ( object );

				}, false );
				reader.readAsText( file );

				break;

			case 'gltf':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					var json = JSON.parse( contents );

					var loader = new THREE.GLTFLoader();
					loader.parse( json, function ( result ) {

						result.scene.name = filename;
						//editor.execute( new AddObjectCommand( result.scene ) );
            addSceneRoot ( result.scene );

					} );

				}, false );
				reader.readAsText( file );

				break;

			case 'js':
			case 'json':

			case '3geo':
			case '3mat':
			case '3obj':
			case '3scn':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					// 2.0

					if ( contents.indexOf( 'postMessage' ) !== - 1 ) {

						var blob = new Blob( [ contents ], { type: 'text/javascript' } );
						var url = URL.createObjectURL( blob );

						var worker = new Worker( url );

						worker.onmessage = function ( event ) {

							event.data.metadata = { version: 2 };
							handleJSON( event.data, file, filename );

						};

						worker.postMessage( Date.now() );

						return;

					}

					// >= 3.0

					var data;

					try {

						data = JSON.parse( contents );

					} catch ( error ) {

						alert( error );
						return;

					}

					handleJSON( data, file, filename );

				}, false );
				reader.readAsText( file );

				break;


			case 'kmz':

				reader.addEventListener( 'load', function ( event ) {

					var loader = new THREE.KMZLoader();
					var collada = loader.parse( event.target.result );

					collada.scene.name = filename;

					//editor.execute( new AddObjectCommand( collada.scene ) );
          addSceneRoot( collada.scene );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'md2':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.MD2Loader().parse( contents );
					var material = new THREE.MeshStandardMaterial( {
						morphTargets: true,
						morphNormals: true
					} );

					var mesh = new THREE.Mesh( geometry, material );
					mesh.mixer = new THREE.AnimationMixer( mesh );
					mesh.name = filename;

					//editor.execute( new AddObjectCommand( mesh ) );
          addSceneRoot( mesh );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'obj':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var object = new THREE.OBJLoader().parse( contents );
					object.name = filename;

					//editor.execute( new AddObjectCommand( object ) );
          addSceneRoot( object );

				}, false );
				reader.readAsText( file );

				break;

			case 'playcanvas':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					var json = JSON.parse( contents );

					var loader = new THREE.PlayCanvasLoader();
					var object = loader.parse( json );

					//editor.execute( new AddObjectCommand( object ) );
          addSceneRoot ( object );

				}, false );
				reader.readAsText( file );

				break;

			case 'ply':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.PLYLoader().parse( contents );
					geometry.sourceType = "ply";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshStandardMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					//editor.execute( new AddObjectCommand( mesh ) );
          addSceneRoot ( mesh );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'stl':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.STLLoader().parse( contents );
					geometry.sourceType = "stl";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshStandardMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					//editor.execute( new AddObjectCommand( mesh ) );
          addSceneRoot( mesh );

				}, false );

				if ( reader.readAsBinaryString !== undefined ) {

					reader.readAsBinaryString( file );

				} else {

					reader.readAsArrayBuffer( file );

				}

				break;

			/*
			case 'utf8':
				reader.addEventListener( 'load', function ( event ) {
					var contents = event.target.result;
					var geometry = new THREE.UTF8Loader().parse( contents );
					var material = new THREE.MeshLambertMaterial();
					var mesh = new THREE.Mesh( geometry, material );
					editor.execute( new AddObjectCommand( mesh ) );
				}, false );
				reader.readAsBinaryString( file );
				break;
			*/

			case 'vtk':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.VTKLoader().parse( contents );
					geometry.sourceType = "vtk";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshStandardMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					//editor.execute( new AddObjectCommand( mesh ) );
          addSceneRoot( mesh );

				}, false );
				reader.readAsText( file );

				break;

			case 'wrl':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var result = new THREE.VRMLLoader().parse( contents );

					//editor.execute( new SetSceneCommand( result ) );
          addSceneRoot ( result );

				}, false );
				reader.readAsText( file );

				break;

			default:

				alert( 'Unsupported file format (' + extension +  ').' );

				break;

		}
  }

  function handleJSON( data, file, filename ) {
    //copied from:
    //https://github.com/mrdoob/three.js/blob/dev/editor/js/Loader.js

		if ( data.metadata === undefined ) { // 2.0

			data.metadata = { type: 'Geometry' };

		}

		if ( data.metadata.type === undefined ) { // 3.0

			data.metadata.type = 'Geometry';

		}

		if ( data.metadata.formatVersion !== undefined ) {

			data.metadata.version = data.metadata.formatVersion;

		}

		switch ( data.metadata.type.toLowerCase() ) {

			case 'buffergeometry':

				var loader = new THREE.BufferGeometryLoader();
				var result = loader.parse( data );

				var mesh = new THREE.Mesh( result );

				editor.execute( new AddObjectCommand( mesh ) );

				break;

			case 'geometry':

				var loader = new THREE.JSONLoader();
				loader.setTexturePath( scope.texturePath );

				var result = loader.parse( data );

				var geometry = result.geometry;
				var material;

				if ( result.materials !== undefined ) {

					if ( result.materials.length > 1 ) {

						material = new THREE.MultiMaterial( result.materials );

					} else {

						material = result.materials[ 0 ];

					}

				} else {

					material = new THREE.MeshStandardMaterial();

				}

				geometry.sourceType = "ascii";
				geometry.sourceFile = file.name;

				var mesh;

				if ( geometry.animation && geometry.animation.hierarchy ) {

					mesh = new THREE.SkinnedMesh( geometry, material );

				} else {

					mesh = new THREE.Mesh( geometry, material );

				}

				mesh.name = filename;

				editor.execute( new AddObjectCommand( mesh ) );

				break;

			case 'object':

				var loader = new THREE.ObjectLoader();
				loader.setTexturePath( scope.texturePath );

				var result = loader.parse( data );

				if ( result instanceof THREE.Scene ) {

					editor.execute( new SetSceneCommand( result ) );

				} else {

					editor.execute( new AddObjectCommand( result ) );

				}

				break;

			case 'scene':

				// DEPRECATED

				var loader = new THREE.SceneLoader();
				loader.parse( data, function ( result ) {

					editor.execute( new SetSceneCommand( result.scene ) );

				}, '' );

				break;

			case 'app':

				editor.fromJSON( data );

				break;

		}

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
 			token = object.name.split('.');
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
 				//resetCamera();

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
      //to do: bug - fix camera clipping bug
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

 		addSceneRoot(rootNode);

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
