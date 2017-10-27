/**
 * @author Don McCurdy / https://github.com/donmccurdy
 */

QUnit.module( 'LoadingManager' );

QUnit.test( 'setURLModifier', function( assert ) {

	var manager = new THREE.LoadingManager();
	var suffix = '?transformed=true';

	manager.setURLModifier( function ( url ) {

		return url + suffix;

	} );

	var url = 'https://foo.bar/baz';
	var resolvedURL = manager.resolveURL( url );
	assert.equal( resolvedURL, url + suffix, 'URL transform is applied' );

});
