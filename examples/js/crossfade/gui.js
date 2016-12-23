var transitionParams = {
	"useTexture": true,
	"transition": 0.5,
	"transitionSpeed": 2.0,
	"texture": 5,
	"loopTexture": true,
	"animateTransition": true,
	"textureThreshold": 0.3
};

function initGUI() {
	
	var gui = new dat.GUI();

	gui.add( transitionParams, "useTexture" ).onChange( function( value ) {
		
		transition.useTexture( value );
		
	} );
	
	gui.add( transitionParams, 'loopTexture' );
	
	gui.add( transitionParams, 'texture', { Perlin: 0, Squares: 1, Cells: 2, Distort: 3, Gradient: 4, Radial: 5 } ).onChange( function( value ) {
		
		transition.setTexture( value );
		
	} ).listen();
		
	gui.add( transitionParams, "textureThreshold", 0, 1, 0.01 ).onChange( function( value ) {
		
		transition.setTextureThreshold( value );
		
	} );

	gui.add( transitionParams, "animateTransition" );
	gui.add( transitionParams, "transition", 0, 1, 0.01 ).listen();
	gui.add( transitionParams, "transitionSpeed", 0.5, 5, 0.01 );
	
}
