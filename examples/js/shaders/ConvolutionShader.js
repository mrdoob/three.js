( function () {

	/**
 * Convolution shader
 * ported from o3d sample to WebGL / GLSL
 * http://o3d.googlecode.com/svn/trunk/samples/convolution.html
 */

	const ConvolutionShader = {
		defines: {
			'KERNEL_SIZE_FLOAT': '25.0',
			'KERNEL_SIZE_INT': '25'
		},
		uniforms: {
			'tDiffuse': {
				value: null
			},
			'uImageIncrement': {
				value: new THREE.Vector2( 0.001953125, 0.0 )
			},
			'cKernel': {
				value: []
			}
		},
		vertexShader: `uniform vec2 uImageIncrement;

		varying vec2 vUv;

		void main() {

			vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
		fragmentShader: `uniform float cKernel[ KERNEL_SIZE_INT ];

		uniform sampler2D tDiffuse;
		uniform vec2 uImageIncrement;

		varying vec2 vUv;

		void main() {

			vec2 imageCoord = vUv;
			vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );

			for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {

				sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];
				imageCoord += uImageIncrement;

			}

			gl_FragColor = sum;

		}`,
		buildKernel: function ( sigma ) {

			// We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.
			const kMaxKernelSize = 25;
			let kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;
			if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;
			const halfWidth = ( kernelSize - 1 ) * 0.5;
			const values = new Array( kernelSize );
			let sum = 0.0;

			for ( let i = 0; i < kernelSize; ++ i ) {

				values[ i ] = gauss( i - halfWidth, sigma );
				sum += values[ i ];

			} // normalize the kernel


			for ( let i = 0; i < kernelSize; ++ i ) values[ i ] /= sum;

			return values;

		}
	};

	function gauss( x, sigma ) {

		return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

	}

	THREE.ConvolutionShader = ConvolutionShader;

} )();
