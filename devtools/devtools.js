/* global chrome */

try {

	chrome.devtools.panels.create(
		'Three.js',
		null,
		'panel/panel.html',
		function () {

			console.log( 'Three.js DevTools panel created' );

		}
	);

} catch ( error ) {

	console.error( 'Failed to create Three.js panel:', error );

}
