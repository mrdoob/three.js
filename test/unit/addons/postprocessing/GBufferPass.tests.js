import {
	BackSide, Color, DataTexture, DoubleSide, Mesh, MeshBasicMaterial, MeshStandardMaterial, Plane, Vector2, Vector3, LinearFilter, NearestFilter, NoBlending,
	OrthographicCamera, PlaneGeometry, RepeatWrapping, Scene, ShaderMaterial,
	WebGLRenderer, WebGLRenderTarget
} from 'three';
import { GBufferPass } from '../../../../examples/jsm/postprocessing/GBufferPass.js';
import { GTAOPass } from '../../../../examples/jsm/postprocessing/GTAOPass.js';
import { SSAOPass } from '../../../../examples/jsm/postprocessing/SSAOPass.js';
import { SAOPass } from '../../../../examples/jsm/postprocessing/SAOPass.js';
import { SSRPass } from '../../../../examples/jsm/postprocessing/SSRPass.js';
import { FullScreenQuad } from '../../../../examples/jsm/postprocessing/Pass.js';

QUnit.module( 'Addons', () => {

	QUnit.module( 'GBufferPass', () => {

		QUnit.test( 'normal maps, bump maps, displacement and local clipping use source settings', assert => {

			const renderer = new WebGLRenderer();
			renderer.setSize( 64, 64 );
			renderer.localClippingEnabled = true;
			const scene = new Scene();
			const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0.1, 10 );
			camera.position.z = 2;
			const normalMap = new DataTexture( new Uint8Array( [ 255, 128, 255, 255 ] ), 1, 1 );
			normalMap.needsUpdate = true;
			const displacementMap = new DataTexture( new Uint8Array( [ 255, 255, 255, 255 ] ), 1, 1 );
			displacementMap.needsUpdate = true;
			const source = new MeshStandardMaterial( { normalMap, displacementMap, displacementScale: 0.25 } );
			const geometry = new PlaneGeometry( 2, 2 );
			geometry.setAttribute( 'uv1', geometry.attributes.uv.clone() );
			scene.add( new Mesh( geometry, source ) );
			const pass = new GBufferPass( scene, camera, 64, 64 );
			const target = new WebGLRenderTarget( 64, 64 );
			const outputMaterial = new ShaderMaterial( {
				uniforms: {
					normal: { value: pass.normalTexture },
					depth: { value: pass.depthTexture },
					showDepth: { value: false }
				},
				vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4( position.xy, 0., 1. ); }',
				fragmentShader: `
					uniform sampler2D normal;
					uniform sampler2D depth;
					uniform bool showDepth;
					varying vec2 vUv;
					void main() {
						gl_FragColor = showDepth ? vec4( vec3( texture2D( depth, vUv ).r ), 1. ) : texture2D( normal, vUv );
					}`
			} );
			const quad = new FullScreenQuad( outputMaterial );
			const pixel = new Uint8Array( 4 );

			function read( showDepth, x = 32 ) {

				pass.render( renderer );
				outputMaterial.uniforms.showDepth.value = showDepth;
				renderer.setRenderTarget( target );
				quad.render( renderer );
				renderer.readRenderTargetPixels( target, x, 32, 1, 1, pixel );
				return Array.from( pixel );

			}

			const normal = read( false );
			assert.true( Math.abs( normal[ 0 ] - 218 ) <= 1 && Math.abs( normal[ 2 ] - 218 ) <= 1, 'tangent normal map is encoded in view space' );
			const cached = pass._getMaterial( source );
			const version = cached.version;
			source.normalScale.set( 0, 0 );
			assert.deepEqual( read( false ), [ 128, 128, 255, 255 ], 'normalScale changes update the normal buffer' );
			assert.strictEqual( cached.version, version, 'uniform change does not invalidate the shader' );
			normalMap.channel = 1;
			assert.deepEqual( read( false ), [ 128, 128, 255, 255 ], 'normal-map UV channel change is supported' );
			assert.true( cached.version > version, 'UV channel change invalidates the shader' );
			const changedVersion = cached.version;
			source.needsUpdate = true;
			read( false );
			assert.true( cached.version > changedVersion, 'source material invalidation reaches the cached override' );
			const bumpMap = new DataTexture( new Uint8Array( [ 0, 0, 0, 255, 255, 255, 255, 255 ] ), 2, 1 );
			bumpMap.magFilter = bumpMap.minFilter = LinearFilter;
			bumpMap.needsUpdate = true;
			source.normalMap = null;
			source.bumpMap = bumpMap;
			source.bumpScale = 16;
			const bump = read( false );
			assert.true( bump[ 0 ] < 100 && bump[ 2 ] > 220, 'bump-map gradient perturbs the normal buffer' );
			const bumpVersion = cached.version;
			source.bumpScale = 0;
			assert.deepEqual( read( false ), [ 128, 128, 255, 255 ], 'bumpScale changes update the normal buffer' );
			assert.strictEqual( cached.version, bumpVersion, 'bumpScale change does not invalidate the shader' );
			assert.true( Math.abs( read( true )[ 0 ] - 43 ) <= 1, 'depth includes displacementScale' );
			source.displacementBias = 0.25;
			assert.true( Math.abs( read( true )[ 0 ] - 36 ) <= 1, 'depth includes changed displacementBias' );
			source.clippingPlanes = [ new Plane( new Vector3( 1, 0, 0 ), 0 ) ];
			const left = read( true, 16 )[ 0 ];
			const right = read( true, 48 )[ 0 ];
			assert.true( ( left === 255 && right < 255 ) || ( right === 255 && left < 255 ), 'local clipping removes depth on one side' );

			pass.dispose();
			target.dispose();
			outputMaterial.dispose();
			quad.dispose();
			geometry.dispose();
			source.dispose();
			normalMap.dispose();
			bumpMap.dispose();
			displacementMap.dispose();
			renderer.dispose();

		} );

		QUnit.test( 'alpha-tested beauty and geometry coverage, cache and restoration', assert => {

			const renderer = new WebGLRenderer();
			renderer.setSize( 64, 64 );
			renderer.setClearColor( 0x000000 );
			const scene = new Scene();
			const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0.1, 10 );
			camera.position.z = 2;
			const pixels = new Uint8Array( [
				255, 255, 255, 0, 255, 0, 255, 255,
				255, 255, 255, 255, 255, 255, 255, 128
			] );
			const map = new DataTexture( pixels, 2, 2 );
			map.magFilter = map.minFilter = NearestFilter;
			map.wrapS = map.wrapT = RepeatWrapping;
			map.needsUpdate = true;
			const alphaMap = map.clone();
			alphaMap.channel = 1;
			alphaMap.repeat.set( 2, 1 );
			alphaMap.offset.set( 0.25, 0 );
			alphaMap.rotation = Math.PI / 2;
			alphaMap.needsUpdate = true;
			const geometry = new PlaneGeometry( 1.8, 1.8, 2, 1 );
			const uv1 = geometry.attributes.uv.clone();
			for ( let i = 0; i < uv1.count; i ++ ) uv1.setXY( i, 1 - uv1.getY( i ), uv1.getX( i ) );
			geometry.setAttribute( 'uv1', uv1 );
			const source = new MeshBasicMaterial( { map, alphaTest: 0.5, side: DoubleSide, blending: NoBlending } );
			const solid = new MeshBasicMaterial( { side: DoubleSide } );
			const mesh = new Mesh( geometry, source );
			scene.add( mesh );
			const wallMaterial = new MeshBasicMaterial( { color: 0x000000 } );
			const wallGeometry = new PlaneGeometry( 3, 3 );
			const wall = new Mesh( wallGeometry, wallMaterial );
			wall.position.z = - 0.4;
			wall.rotation.y = 0.2;
			scene.add( wall );
			const pass = new GBufferPass( scene, camera, 64, 64 );
			const gtao = new GTAOPass( scene, camera, 64, 64, {
				depthTexture: pass.depthTexture,
				normalTexture: pass.normalTexture
			} );
			assert.strictEqual( gtao.normalRenderTarget, undefined, 'external GBuffer avoids a second prepass target' );
			assert.strictEqual( gtao.gtaoMaterial.uniforms.tNormal.value, pass.normalTexture, 'GTAO consumes generated normals' );
			assert.strictEqual( gtao.gtaoMaterial.uniforms.tDepth.value, pass.depthTexture, 'GTAO consumes generated depth' );
			let disposed = 0;
			pass.normalTexture.addEventListener( 'dispose', () => disposed ++ );
			pass.depthTexture.addEventListener( 'dispose', () => disposed ++ );
			gtao.dispose();
			assert.strictEqual( disposed, 0, 'consumer leaves the producer buffers alive' );
			const target = new WebGLRenderTarget( 64, 64 );
			const beauty = new Uint8Array( 64 * 64 * 4 );
			const prepass = new Uint8Array( beauty.length );
			const depthMaterial = new ShaderMaterial( {
				uniforms: {
					depth: { value: pass.depthTexture },
					normal: { value: pass.normalTexture }
				},
				vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4( position.xy, 0., 1. ); }',
				// The foreground depth is 0.192; the tilted wall lies beyond 0.2.
				fragmentShader: `
					uniform sampler2D depth;
					uniform sampler2D normal;
					varying vec2 vUv;
					void main() {
						float d = texture2D( depth, vUv ).r;
						float n = texture2D( normal, vUv ).r;
						gl_FragColor = vec4( d < 0.2 ? 1. : 0., abs( n - 0.5 ) < 0.01 ? 1. : 0., 0., 1. );
					}`
			} );
			const quad = new FullScreenQuad( depthMaterial );

			function compareCoverage( label ) {

				renderer.setRenderTarget( target );
				renderer.render( scene, camera );
				renderer.readRenderTargetPixels( target, 0, 0, 64, 64, beauty );
				pass.render( renderer );
				renderer.setRenderTarget( target );
				quad.render( renderer );
				renderer.readRenderTargetPixels( target, 0, 0, 64, 64, prepass );
				let mismatches = 0;
				let normalMismatches = 0;
				let covered = 0;
				for ( let i = 0; i < beauty.length; i += 4 ) {

					if ( ( beauty[ i ] > 0 ) !== ( prepass[ i ] > 0 ) ) mismatches ++;
					if ( prepass[ i ] !== prepass[ i + 1 ] ) normalMismatches ++;
					if ( prepass[ i ] > 0 ) covered ++;

				}

				assert.strictEqual( mismatches, 0, label );
				assert.strictEqual( normalMismatches, 0, 'depth and normal agree at cutout boundaries' );
				assert.true( covered > 0 && covered < 58 * 58, `${ label }: contains both covered and discarded pixels ( ${ covered } covered )` );

			}

			compareCoverage( 'base-map alpha' );
			map.repeat.set( 2, 1 );
			map.offset.set( 0.15, 0.25 );
			map.rotation = 0.3;
			compareCoverage( 'base-map texture transform' );
			source.map = null;
			source.alphaMap = alphaMap;
			source.needsUpdate = true;
			compareCoverage( 'transformed alphaMap on UV1' );
			source.map = map;
			source.opacity = 0.75;
			source.needsUpdate = true;
			compareCoverage( 'combined map alpha, alphaMap and opacity' );
			alphaMap.channel = 0;
			source.needsUpdate = true;
			compareCoverage( 'texture UV channel changed in place' );
			alphaMap.matrixAutoUpdate = false;
			alphaMap.matrix.setUvTransform( 0.2, 0.1, 1, 2, 0.5, 0.5, 0.5 );
			compareCoverage( 'explicit texture matrix' );
			mesh.rotation.y = Math.PI;
			compareCoverage( 'double-sided back face' );
			source.side = BackSide;
			compareCoverage( 'back-side orientation' );
			geometry.addGroup( 0, 6, 0 );
			geometry.addGroup( 6, 6, 1 );
			const grouped = [ solid, source ];
			mesh.material = grouped;
			compareCoverage( 'mixed solid/cutout groups' );
			assert.strictEqual( mesh.material, grouped, 'original material array restored' );
			mesh.material = [ solid, undefined ];
			compareCoverage( 'undefined group material is skipped' );
			mesh.material = grouped;

			// All shared-buffer consumers must preserve the generated normals, including at holes.
			const copyMaterial = new ShaderMaterial( {
				uniforms: { normal: { value: pass.normalTexture } },
				vertexShader: depthMaterial.vertexShader,
				fragmentShader: 'uniform sampler2D normal; varying vec2 vUv; void main() { gl_FragColor = texture2D( normal, vUv ); }'
			} );
			const copyQuad = new FullScreenQuad( copyMaterial );
			pass.render( renderer );
			renderer.setRenderTarget( target );
			copyQuad.render( renderer );
			renderer.readRenderTargetPixels( target, 0, 0, 64, 64, prepass );
			const inputs = { depthTexture: pass.depthTexture, normalTexture: pass.normalTexture };
			const ssao = new SSAOPass( scene, camera, 64, 64, 16, inputs );
			ssao.output = SSAOPass.OUTPUT.Normal;
			const sao = new SAOPass( scene, camera, new Vector2( 64, 64 ), inputs );
			sao.params.output = SAOPass.OUTPUT.Normal;
			const ssr = new SSRPass( { renderer, scene, camera, width: 64, height: 64, ...inputs } );
			ssr.output = SSRPass.OUTPUT.Normal;
			for ( const consumer of [ ssao, sao, ssr ] ) {

				consumer._renderOverride = () => {

					throw new Error( 'unexpected internal prepass' );

				};

				assert.false( consumer._renderGBuffer, `${ consumer.constructor.name } uses the shared prepass` );
				assert.strictEqual( consumer.depthTexture, pass.depthTexture, `${ consumer.constructor.name } uses the same depth` );
				consumer.render( renderer, target, target );
				renderer.readRenderTargetPixels( target, 0, 0, 64, 64, beauty );
				assert.deepEqual( beauty, prepass, `${ consumer.constructor.name } normal output preserves cutout boundaries` );
				consumer.dispose();

			}

			copyMaterial.dispose();
			copyQuad.dispose();

			const cached = pass._getMaterial( source );
			const count = renderer.info.programs.length;
			for ( let i = 0; i < 5; i ++ ) pass.render( renderer );
			assert.strictEqual( pass._getMaterial( source ), cached, 'override reused' );
			assert.strictEqual( renderer.info.programs.length, count, 'no shader churn after warmup' );
			source.alphaTest = 0.6;
			assert.strictEqual( pass._getMaterial( source ).alphaTest, 0.6, 'threshold change propagated' );
			source.alphaTest = 0;
			source.transparent = true;
			assert.false( pass._getMaterial( source ).visible, 'blended transparency is not alpha-tested' );

			const originalRender = renderer.render;
			mesh.material = source;
			const transparent = new MeshBasicMaterial( { transparent: true, opacity: 0.5 } );
			const transparentMesh = new Mesh( geometry, transparent );
			scene.add( transparentMesh );
			renderer.render = () => {

				assert.false( transparentMesh.material.visible, 'blended surfaces do not enter the GBuffer' );

			};

			pass.render( renderer );
			assert.strictEqual( transparentMesh.material, transparent, 'blended material restored' );
			mesh.material = grouped;
			const override = new MeshBasicMaterial();
			scene.overrideMaterial = override;
			renderer.shadowMap.enabled = true;
			const background = new Color( 0x123456 );
			scene.background = background;
			renderer.setClearColor( 0x654321, 0.25 );
			renderer.render = () => {

				assert.false( renderer.shadowMap.enabled, 'prepass does not update shadow maps' );
				throw new Error( 'render failure' );

			};

			assert.throws( () => pass.render( renderer ), /render failure/ );
			assert.strictEqual( mesh.material, grouped, 'materials restored after render failure' );
			assert.strictEqual( scene.overrideMaterial, override, 'scene override restored after render failure' );
			assert.true( renderer.autoClear, 'renderer autoClear restored after render failure' );
			assert.true( renderer.shadowMap.enabled, 'shadow rendering restored after render failure' );
			assert.strictEqual( renderer.getRenderTarget(), target, 'render target restored after render failure' );
			assert.strictEqual( scene.background, background, 'background restored after render failure' );
			assert.true( renderer.getClearColor( new Color() ).equals( new Color( 0x654321 ) ), 'clear color restored after render failure' );
			assert.strictEqual( renderer.getClearAlpha(), 0.25, 'clear alpha restored after render failure' );
			renderer.render = originalRender;
			source.dispose();
			assert.false( pass._materialCache.has( source ), 'source disposal releases override' );

			const normal = pass.normalTexture;
			const depth = pass.depthTexture;
			pass.setSize( 32, 48 );
			assert.strictEqual( pass.normalTexture, normal, 'resize retains the normal texture identity' );
			assert.strictEqual( pass.depthTexture, depth, 'resize retains the depth texture identity' );
			assert.deepEqual( [ pass._renderTarget.width, pass._renderTarget.height ], [ 32, 48 ], 'producer resizes its buffers' );
			pass.render( renderer );
			assert.deepEqual( [ pass.depthTexture.image.width, pass.depthTexture.image.height ], [ 32, 48 ], 'rendered depth attachment matches the resized normals' );
			pass.dispose();
			assert.strictEqual( pass._materialCache.size, 0, 'producer disposal clears cached materials' );
			solid.dispose();
			transparent.dispose();
			wallMaterial.dispose();
			wallGeometry.dispose();
			override.dispose();
			geometry.dispose();
			map.dispose();
			alphaMap.dispose();
			target.dispose();
			depthMaterial.dispose();
			quad.dispose();
			renderer.dispose();

		} );

	} );

} );
