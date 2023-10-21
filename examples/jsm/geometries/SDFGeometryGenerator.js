/**
 * @author santiago / @glitch_life
 * wrapper of https://www.npmjs.com/package/isosurface by https://github.com/mikolalysenko
 *
 * Returns BufferGeometry from SDF
 */

import {
	BufferAttribute,
	BufferGeometry,
	FloatType,
	Mesh,
	OrthographicCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	Vector2,
	WebGLRenderTarget
} from 'three';

import { surfaceNet } from './../libs/surfaceNet.js';

class SDFGeometryGenerator {

	constructor( renderer ) {

		this.renderer = renderer;

	}

	generate( res = 64, distFunc = 'float dist( vec3 p ){ return length(p) - 0.5; }', bounds = 1 ) {

		let w, h;
		if ( res == 8 ) [ w, h ] = [ 32, 16 ];
		else if ( res == 16 ) [ w, h ] = [ 64, 64 ];
		else if ( res == 32 ) [ w, h ] = [ 256, 128 ];
		else if ( res == 64 ) [ w, h ] = [ 512, 512 ];
		else if ( res == 128 ) [ w, h ] = [ 2048, 1024 ];
		else if ( res == 256 ) [ w, h ] = [ 4096, 4096 ];
		else if ( res == 512 ) [ w, h ] = [ 16384, 8096 ];
		else if ( res == 1024 ) [ w, h ] = [ 32768, 32768 ];
		else throw new Error( 'THREE.SDFGeometryGenerator: Resolution must be in range 8 < res < 1024 and must be ^2' );

		const maxTexSize = this.renderer.capabilities.maxTextureSize;

		if ( w > maxTexSize || h > maxTexSize ) throw new Error( 'THREE.SDFGeometryGenerator: Your device does not support this resolution ( ' + res + ' ), decrease [res] param.' );

		const [ tilesX, tilesY ] = [ ( w / res ), ( h / res ) ];

		const sdfCompute = `
			varying vec2 vUv;
			uniform float tileNum;
			uniform float bounds;
			[#dist#]
			void main()	{ gl_FragColor=vec4( ( dist( vec3( vUv, tileNum ) * 2.0 * bounds - vec3( bounds ) ) < 0.00001 ) ? 1.0 : 0.0 ); }
		`;

		const sdfRT = this.computeSDF( w, h, tilesX, tilesY, bounds, sdfCompute.replace( '[#dist#]', distFunc ) );

		const read = new Float32Array( w * h * 4 );
		this.renderer.readRenderTargetPixels( sdfRT, 0, 0, w, h, read );
		sdfRT.dispose();

		//

		const mesh = surfaceNet( [ res, res, res ], ( x, y, z ) => {

			x = ( x + bounds ) * ( res / ( bounds * 2 ) );
			y = ( y + bounds ) * ( res / ( bounds * 2 ) );
			z = ( z + bounds ) * ( res / ( bounds * 2 ) );
			let p = ( x + ( z % tilesX ) * res ) + y * w + ( Math.floor( z / tilesX ) * res * w );
			p *= 4;
			return ( read[ p + 3 ] > 0 ) ? - 0.000000001 : 1;

		}, [[ - bounds, - bounds, - bounds ], [ bounds, bounds, bounds ]] );

		const ps = [], ids = [];
		const geometry = new BufferGeometry();
		mesh.positions.forEach( p => {

			ps.push( p[ 0 ], p[ 1 ], p[ 2 ] );

		} );
		mesh.cells.forEach( p => ids.push( p[ 0 ], p[ 1 ], p[ 2 ] ) );
		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( ps ), 3 ) );
		geometry.setIndex( ids );

		return geometry;

	}

	computeSDF( width, height, tilesX, tilesY, bounds, shader ) {

		const rt = new WebGLRenderTarget( width, height, { type: FloatType } );
		const scn = new Scene();
		const cam = new OrthographicCamera();
		const tiles = tilesX * tilesY;
		let currentTile = 0;

		Object.assign( cam, { left: width / - 2, right: width / 2, top: height / 2, bottom: height / - 2 } ).updateProjectionMatrix();
		cam.position.z = 2;

		const tileSize = width / tilesX;
		const geometry = new PlaneGeometry( tileSize, tileSize );

		while ( currentTile ++ < tiles ) {

			const c = currentTile - 1;
			const [ px, py ] = [ ( tileSize ) / 2 + ( c % tilesX ) * ( tileSize ) - width / 2, ( tileSize ) / 2 + Math.floor( c / tilesX ) * ( tileSize ) - height / 2 ];
			const compPlane = new Mesh( geometry, new ShaderMaterial( {
				uniforms: {
					res: { value: new Vector2( width, height ) },
					tileNum: { value: c / ( tilesX * tilesY - 1 ) },
					bounds: { value: bounds }
				},
				vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
				fragmentShader: shader
			} ) );
			compPlane.position.set( px, py, 0 );
			scn.add( compPlane );

		}

		this.renderer.setRenderTarget( rt );
		this.renderer.render( scn, cam );
		this.renderer.setRenderTarget( null );

		//

		geometry.dispose();

		scn.traverse( function ( object ) {

			if ( object.material !== undefined ) object.material.dispose();

		} );

		return rt;

	}

}

export { SDFGeometryGenerator };
