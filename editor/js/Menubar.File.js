/*

TITLE: 
  Menubar.File.JS

AUTHOR: Seagat2011
  mrdoob / http://mrdoob.com/

VERSION: 
  Major.Minor.Release.Build
  1.0.0.0

REVISION HISTORY:
  -added setInterval() which allows multiple file export @Seagat2011 09.01.17 https://github.com/Seagat2011
  -replaced module JSZip() with files[] (of Array type) (mainly for testing of multifile downloader) @Seagat2011 09.01.17 https://github.com/Seagat2011  
  
STYLEGUIDE: 
  http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
    
REFERENCES:
  N/A

DESCRIPTION: 
  ThreeJS Editor Menu > File

INPUT:
  N/A

OUTPUT:
  exports Menubar.File
  
SCRIPT TYPE: 
  ThreeJS Editor Menu > File shell
  
*/
Menubar.File = function ( editor ) {
  var container = new UI.Panel();
  container.setClass( 'menu' );
  var title = new UI.Panel();
  title.setClass( 'title' );
  title.setTextContent( 'File' );
  container.add( title );
  var options = new UI.Panel();
  options.setClass( 'options' );
  container.add( options );
  // New
  var option = new UI.Row();
  option.setClass( 'option' );
  option.setTextContent( 'New' );
  option.onClick( function () {
    if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {
      editor.clear();
    }
  } );
  options.add( option );
  //
  options.add( new UI.HorizontalRule() );
  // Import
  var fileInput = document.createElement( 'input' );
  fileInput.type = 'file';
  fileInput.addEventListener( 'change', function ( event ) {
    editor.loader.loadFile( fileInput.files[ 0 ] );
  } );
  var option = new UI.Row();
  option.setClass( 'option' );
  option.setTextContent( 'Import' );
  option.onClick( function () {
    fileInput.click();
  } );
  options.add( option );
  //
  options.add( new UI.HorizontalRule() );
  // Export Geometry
  var option = new UI.Row();
  option.setClass( 'option' );
  option.setTextContent( 'Export Geometry' );
  option.onClick( function () {
    var object = editor.selected;
    if ( object === null ) {
      alert( 'No object selected.' );
      return;
    }
    var geometry = object.geometry;
    if ( geometry === undefined ) {
      alert( 'The selected object doesn\'t have geometry.' );
      return;
    }
    var output = JSON_stringify( geometry.toJSON() );
    saveString( output, 'geometry.json' );
  } );
  options.add( option );
  // Export Object
  var option = new UI.Row();
  option.setClass( 'option' );
  option.setTextContent( 'Export Object' );
  option.onClick( function () {
    var object = editor.selected;
    if ( object === null ) {
      alert( 'No object selected' );
      return;
    }
    var output = JSON_stringify( object.toJSON() );
    saveString( output, 'model.json' );
  } );
  options.add( option );
  // Export Scene
  var option = new UI.Row();
  option.setClass( 'option' );
  option.setTextContent( 'Export Scene' );
  option.onClick( function () {
    var output = JSON_stringify( editor.scene.toJSON() );
    saveString( output, 'scene.json' );
  } );
  options.add( option );
  // Export OBJ
  var option = new UI.Row();
  option.setClass( 'option' );
  option.setTextContent( 'Export OBJ' );
  option.onClick( function () {
    var object = editor.selected;
    if ( object === null ) {
      alert( 'No object selected.' );
      return;
    }
    var exporter = new THREE.OBJExporter();
    saveString( exporter.parse( object ), 'model.obj' );
  } );
  options.add( option );
  // Export STL
  var option = new UI.Row();
  option.setClass( 'option' );
  option.setTextContent( 'Export STL' );
  option.onClick( function () {
    var exporter = new THREE.STLExporter();
    saveString( exporter.parse( editor.scene ), 'model.stl' );
  } );
  options.add( option );
  //
  options.add( new UI.HorizontalRule() );
  // Publish
  
  var option = new UI.Row();
  option.setClass( 'option' );
  option.setTextContent( 'Publish' );
  option.onClick( function () {
    var files = [];
    files.add = function(_name,_blob,_tojson){
      this.push({_name:_name,_blob:_blob,_tojson:_tojson||false});
    }
    //
    var output = editor.toJSON();
    output.metadata.type = 'App';
    delete output.history;
    var vr = output.project.vr;
    output = JSON_stringify( output );
    files.add( 'app.json',output,true );
    //
    var manager = new THREE.LoadingManager( function () {
      this;
    } );
    var loader = new THREE.FileLoader( manager );
    loader.load( 'js/libs/app/index.html', function ( content ) {
      var includes = [];
      if ( vr ) {
        includes.push( '<script src="js/VRControls.js"></script>' );
        includes.push( '<script src="js/VREffect.js"></script>' );
        includes.push( '<script src="js/WebVR.js"></script>' );
      }
      content = content.replace( '<!-- includes -->', includes.join( '\n\t\t' ) );
      files.add( 'index.html',content );
    } );
    loader.load( 'js/libs/app.js', function ( content ) {
      files.add( 'app.js', content );
    } );
    loader.load( '../build/three.min.js', function ( content ) {
      files.add( 'three.min.js', content );
    } );
    if ( vr ) {
      loader.load( '../examples/js/controls/VRControls.js', function ( content ) {
        files.add( 'VRControls.js', content );
      } );
      loader.load( '../examples/js/effects/VREffect.js', function ( content ) {
        files.add( 'VREffect.js', content );
      } );
      loader.load( '../examples/js/WebVR.js', function ( content ) {
        files.add( 'WebVR.js', content );
      } );
    }
    a = setInterval(function(){
      if(files.length){
        saveString( files[0].tojson?JSON_stringify(files[0]._blob):files[0]._blob,files[0]._name );
        console.log(files[0]._name," - download complete")
        files.shift();
      }
      else{
        clearInterval(a);
        console.log("Downloads complete")
      }
    },150)
  } );
  options.add( option );
  
  // Export as WebGL //
  
  var option = new UI.Row();
  option.setClass( 'option' );
  option.setTextContent( 'Export as WebGL' );
  option.onClick( function () {  
  });
  options.add( option );
  
  // Export as WebGL (optimized) //
  var option = new UI.Row();
  option.setClass( 'option' );
  option.setTextContent( 'Export as optimized WebGL' );
  option.onClick( function () {  
  });
  options.add( option );
  
  // Publish (Dropbox)
  var option = new UI.Row();
  option.setClass( 'option' );
  option.setTextContent( 'Publish (Dropbox)' );
  option.onClick( function () {
    var parameters = {
      files: [
        { 'url': 'data:text/plain;base64,' + window.btoa( "Hello, World" ), 'filename': 'app/test.txt' }
      ]
    };
    Dropbox.save( parameters );
  } );
  options.add( option );
  
  function saveString( text, filename ) {
    save( new Blob( [ text ], { type: 'text/plain' } ), filename );
  }
  
  function save( blob, filename ) { // Firefox workaround, see #6594 //
    g_link.href = URL.createObjectURL( blob );
    g_link.download = filename || 'data.json';
    g_link.click();
  }
  
  function JSON_stringify( text,re ){
    re || (re = /[\n\t]+([\d\.e\-\[\]]+)/g);
    try {    
      text = JSON.stringify( text, null, '\t' );
      text = text.replace( re, '$1' );
    } catch ( e ) {
      text = JSON.stringify( text,2,2 );
    }
    return text;
  }
  return container;
};
