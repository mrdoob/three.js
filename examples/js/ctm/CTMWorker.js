importScripts( "lzma.js", "ctm.js" );

self.onmessage = function( event ) {

  self.postMessage( new CTM.File( new CTM.Stream( event.data ) ) );
  self.close();

}
