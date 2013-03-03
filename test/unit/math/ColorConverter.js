module( "ColorConverter" );

test( "fromHSV/toHSV", function(){
	var c1 = new THREE.Color();
	var c2 = new THREE.Color().setHSL( 0.25, 0.5, 0.75 );
	var hsv = THREE.ColorConverter.toHSV( c2 );
	THREE.ColorConverter.setHSV( c1, hsv.h, hsv.s, hsv.v );
	ok( c1.equals( c2 ), "Ok" );
});


