/**
 * @author Don McCurdy / https://github.com/donmccurdy
 */

QUnit.module( "LoadingManager" );

QUnit.test( "setResourceTransform", function( assert ) {

  var manager = new THREE.LoadingManager();
  var suffix = '?transformed=true';

  manager.setResourceTransform( function ( url ) {

    return url + suffix;

  } );

  var url = 'https://foo.bar/baz';
  var resolvedURL = manager.resolveResourceURL( url );
  assert.equal( resolvedURL, url + suffix, 'URL transform is applied' );

});
