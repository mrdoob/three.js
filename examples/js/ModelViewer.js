/**
* @author jsidd / https://github.com/jsidd
*/

if ( ! Detector.webgl ) {
  Detector.addGetWebGLMessage();
}

var camera, controls, scene, renderer, loader, fileType, loadedFile;

var fileName = "";

var fileInput = document.getElementById("selectedFile");

var params = {
  source: 'list',
  list: 'models/babylon/skull.babylon',
  url: 'models/collada/multimaterial.dae',
  file: function ()
  {
    fileInput.click();
  }
};

var list = [];

fileInput.addEventListener( 'change', function ( event ) {
  console.log(fileInput.files[ 0 ].name);
  loadedFile = fileInput.files[ 0 ];
  loadModelFromFile(loadedFile);
  //replaceDiv('selectedFileOut',"**selected file: "+fileInput.files[ 0 ].name + "**");
  fileInput.value ="";
} );

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

loadList('list',"webgl_loader_viewer.list");

var gui = new dat.GUI();

init();

animate();

function setupScene ( rootNode ) {
  //to do: improvement - setupLights() improve to use better lights
  var material = new THREE.MeshPhongMaterial( {
    color: 0xffffff
  } );

  setupLights();
  addSceneRoot( rootNode.clone() );
  if (fileType !== "wrl" && fileType !== "sea" && fileType !== "gltf" ) {
    resetCamera();
  }
  else {
    if (fileName === "duck.gltf")
    {
      console.log("duck.gltf");
      //removeCamera( scene );
      //setMeshMaterial ( scene, material );
      //controls.update();
      //debugPrint ( rootNode );
      //camera.position = new THREE.Vector3(0, 3, 5);
      //controls.update();
      //controls = new THREE.OrbitControls( camera );
    }
  }
};

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
  // necessary for pcd?
  scene.add(camera);
}

function toggleDiv(id) {
  var div = document.getElementById(id);
  div.style.display = (div.style.display === 'block') ? 'none' : 'block';
}

function loadList(id, url)
{
  console.log("loadList");
  var select = document.getElementById(id);
  var loader = new THREE.FileLoader( manager );
  loader.load( url, function ( text ) {

    console.log("load");
    console.log(text);
    var options = text.split('\n');
    //console.log(options);

    //http://stackoverflow.com/questions/18284869/populate-drop-down-list-box-with-values-from-array
    var i;

    for (i = 0; i < options.length; i++) {
      var opt = options[i];
      if (opt === "")
      break;
      list.push(opt);
      //select.appendChild(el);
    }

    gui.add( params, 'source', ['list','url','file'])
    .onChange(function(newValue) {
      if (newValue === 'list' )
      {
        loadModelFromList(params.list);
      }
      else if (newValue === 'url' )
      {
        loadModelFromURL(params.url);
      }
      else {
        if (loadedFile !== undefined) {
          loadModelFromFile(loadedFile);
        }
        else {
          alert("No file selected: click on file and select model");
        }
      }
    }).listen();
    gui.add( params, 'list', list ).onChange(function(newValue) {
      loadModelFromList(newValue);
    });
    gui.add( params, 'url').onChange(function(newValue) {
      loadModelFromURL(newValue);
    });
    gui.add( params, 'file');
    gui.open();

  }, onProgress, onError );
}

function clearDiv(id) {
  var div = document.getElementById(id);
  div.innerHTML = "";
}

function appendDiv(id, extra) {
  var div = document.getElementById(id);
  div.innerHTML = div.innerHTML + extra;
}

function replaceDiv(id, replace) {
  var div = document.getElementById(id);
  div.innerHTML = replace;
}

function debugPrint(text)
{
  //appendDiv('debug',text);
  console.log(text);
}

function clearScene() {
  //clearDiv('debug');
  scene.scale.x = scene.scale.y = scene.scale.z = 1.0;

  for( var i = scene.children.length - 1; i >= 0; i--){
    obj = scene.children[i];
    scene.remove(obj);
  }

  if (controls !== undefined) {
    controls.reset();
  }

}

function setupLights() {
  var ambient = new THREE.AmbientLight( 0x101030 );
  scene.add( ambient );

  var directionalLight = new THREE.DirectionalLight( 0xffeedd );
  directionalLight.position.set( 0, 0, 1 );
  scene.add( directionalLight );
}

function loadModelFromFile(file)
{
  params.source = 'file';
  fileType = file.name.split('.').pop().toLowerCase();
  clearScene();
  loader.loadFile( file, setupScene, onProgress, onError );
}

function loadModelFromList(path)
{
  params.source = 'list';
  fileType = path.split('.').pop().toLowerCase();
  fileName = path.split('/').pop().toLowerCase();
  clearScene();
  if (fileName === "mascot.tjs.sea")
  {
    loader.loadFromPath( path, "Camera007", setupScene, onProgress, onError );
  }
  else {
    loader.loadFromPath( path, "", setupScene, onProgress, onError );
  }
}

function loadModelFromURL(path)
{
  params.source = 'url';
  fileType = path.split('.').pop().toLowerCase();
  clearScene();
  if (fileName === "mascot.tjs.sea")
  {
    loader.loadFromPath( path, "Camera007", setupScene, onProgress, onError );
  }
  else {
    loader.loadFromPath( path, "", setupScene, onProgress, onError );
  }
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

function init() {

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

  //controls = new THREE.TrackballControls( camera );

  // scene

  scene = new THREE.Scene();

  // texture

  // var texture = new THREE.Texture();

  // var material = new THREE.MeshBasicMaterial( { color: 'red' } );

  // model
  var modelPath = 'models/babylon/skull.babylon';
  loader = new THREE.ModelViewerLoader( manager );
  loadModelFromList( modelPath );

  //

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  //

  controls = new THREE.OrbitControls( camera, renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );

}

function setMeshMaterial(node, replaceMaterial)
{
    for( var i = 0; i < node.children.length; i++)
    {
      console.log(node.children[i].type);
      if (node.children[i] instanceof THREE.Mesh)
      {
        node.children[i].material = replaceMaterial;
      }
      else
      {
        setMeshMaterial(node.children[i], replaceMaterial);
      }
    }
}


function removeCamera(node)
{
    for( var i = 0; i < node.children.length; i++)
    {
      console.log(node.children[i].type);
      if (node.children[i] instanceof THREE.PerspectiveCamera)
      {
        node.remove(node.children[i]);
      }
      else
      {
        removeCamera(node.children[i]);
      }
    }
}

function printNode(node, header, space)
{
  debugPrint(space+header+": "+node.type);
  var childCount = 0;
  space+="-";
  while(node.children.length>0)
  {
    childCount++;
    printNode(node.children.pop(),childCount,space);
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
