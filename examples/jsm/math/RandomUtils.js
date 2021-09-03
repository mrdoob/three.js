function onUnitSphere( vec ) {

	// Derived from https://mathworld.wolfram.com/SpherePointPicking.html

	const u = ( Math.random() - 0.5 ) * 2;
	const t = Math.random() * Math.PI * 2;
	const f = Math.sqrt( 1 - u ** 2 );

	vec.x = f * Math.cos( t );
	vec.y = f * Math.sin( t );
	vec.z = u;

	return vec;

}


export { onUnitSphere };
