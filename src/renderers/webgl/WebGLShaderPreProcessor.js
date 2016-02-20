/**
* @author bhouston / http://clara.io
*/

THREE.WebGLShaderPreProcessor = {};

THREE.WebGLShaderPreProcessor.compile = function() {

  var regexInclude = /[ ]*#include[ ]+["<]([\w\d.]*)[">]/;

  return function( code, includeResolver ) {

    includeResolver = includeResolver || THREE.WebGLShaderPreProcessor.defaultIncludeResolver;

    var lines = code.split( '\n' );
    var newLines = [];
    while( lines.length > 0 ) {
      var line = lines.shift();

      var matcheInclude = regexInclude.exec(line);
      if( matcheInclude ) {
        var includeFileName = matcheInclude[1];
        var includeChunk = includeResolver( includeFileName );
        if( ! includeChunk ) throw new Error( "can not find include file for line: " + line );
        var includeLines = includeChunk.split( '\n' );
        while( includeLines.length > 0 ) {
          lines.unshift( includeLines.pop() );
        }
      }
      else {
        newLines.push( line );
      }
    }
    return newLines.join( '\n' );
  };

}();

THREE.WebGLShaderPreProcessor.defaultIncludeResolver = function( fileName ) {

  return THREE.ShaderChunk[ fileName ];

};
