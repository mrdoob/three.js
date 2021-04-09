( function () {

	/**
 * Focus shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */
	const FocusShader = {
		uniforms: {
			'tDiffuse': {
				value: null
			},
			'screenWidth': {
				value: 1024
			},
			'screenHeight': {
				value: 1024
			},
			'sampleDistance': {
				value: 0.94
			},
			'waveFactor': {
				value: 0.00125
			}
		},
		vertexShader: `varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
		fragmentShader: `uniform float screenWidth;
		uniform float screenHeight;
		uniform float sampleDistance;
		uniform float waveFactor;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 color, org, tmp, add;
			float sample_dist, f;
			vec2 vin;
			vec2 uv = vUv;

			add = color = org = texture2D( tDiffuse, uv );

			vin = ( uv - vec2( 0.5 ) ) * vec2( 1.4 );
			sample_dist = dot( vin, vin ) * 2.0;

			f = ( waveFactor * 100.0 + sample_dist ) * sampleDistance * 4.0;

			vec2 sampleSize = vec2(	1.0 / screenWidth, 1.0 / screenHeight ) * vec2( f );

			add += tmp = texture2D( tDiffuse, uv + vec2( 0.111964, 0.993712 ) * sampleSize );
			if( tmp.b < color.b ) color = tmp;

			add += tmp = texture2D( tDiffuse, uv + vec2( 0.846724, 0.532032 ) * sampleSize );
			if( tmp.b < color.b ) color = tmp;

			add += tmp = texture2D( tDiffuse, uv + vec2( 0.943883, -0.330279 ) * sampleSize );
			if( tmp.b < color.b ) color = tmp;

			add += tmp = texture2D( tDiffuse, uv + vec2( 0.330279, -0.943883 ) * sampleSize );
			if( tmp.b < color.b ) color = tmp;

			add += tmp = texture2D( tDiffuse, uv + vec2( -0.532032, -0.846724 ) * sampleSize );
			if( tmp.b < color.b ) color = tmp;

			add += tmp = texture2D( tDiffuse, uv + vec2( -0.993712, -0.111964 ) * sampleSize );
			if( tmp.b < color.b ) color = tmp;

			add += tmp = texture2D( tDiffuse, uv + vec2( -0.707107, 0.707107 ) * sampleSize );
			if( tmp.b < color.b ) color = tmp;

			color = color * vec4( 2.0 ) - ( add / vec4( 8.0 ) );
			color = color + ( add / vec4( 8.0 ) - color ) * ( vec4( 1.0 ) - vec4( sample_dist * 0.5 ) );

			gl_FragColor = vec4( color.rgb * color.rgb * vec3( 0.95 ) + color.rgb, 1.0 );

		}`
	};

	THREE.FocusShader = FocusShader;

} )();
