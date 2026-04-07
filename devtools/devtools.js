try {

	chrome.devtools.panels.create(
		'Three.js',
		null,
		'panel/panel.html'
	);

} catch ( error ) {

	console.error( 'Failed to create Three.js panel:', error );

}
