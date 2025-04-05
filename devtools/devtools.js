try {

	chrome.devtools.panels.create(
		'Three.js',
		null,
		'panel/panel.html',
		function ( panel ) {

			console.log( 'Three.js DevTools panel created' );

		}
	);

} catch ( error ) {

	console.error( 'Failed to create Three.js panel:', error );

}
