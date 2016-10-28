/**
 * @author mrdoob / http://mrdoob.com/
 * @author Bart McLeod / http://spaceweb.nl/
 */

/**
 *
 * @param manager
 * @param parser VRMLparser based on PEG.js grammar
 * @param VrmlParser.Renderer.ThreeJs renderer
 * @constructor
 */
THREE.VRMLLoader = function (parser, manager) {

  this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
  this.parser = parser;

};

THREE.VRMLLoader.prototype = {

  constructor: THREE.VRMLLoader,

  parse: function (data) {
    try {
      var tree = this.parser.parse(data);
      console.log(tree);
      return tree;
    } catch ( e ) {
      console.log('Exception with message ' + e.message);

      if ( undefined !== e.location ) {
        console.log('Exception at location start: offset: ' + e.location.start.offset + ' line: ' + e.location.start.line + ' column: ' + e.location.start.column);
        console.log('Exception at location end: offset: ' + e.location.end.offset + ' line: ' + e.location.end.line + ' column: ' + e.location.end.column);
      }

      return;
    }
  },

  load: function (url, onLoad, onProgress, onError) {

    var scope = this;

    var loader = new THREE.XHRLoader(this.manager);
    loader.load(url, function (text) {

      onLoad(scope.parse(text));

    }, onProgress, onError);

  },

  setCrossOrigin: function (value) {

    this.crossOrigin = value;

  },

};
