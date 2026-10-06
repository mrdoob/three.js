import { DepthTexture, PerspectiveCamera, Scene, Texture } from 'three';
import { GTAOPass } from '../../../../examples/jsm/postprocessing/GTAOPass.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Postprocessing', () => {

		QUnit.module( 'GTAOPass', () => {

			QUnit.test( 'Combined depth and normal texture is rejected without changing inputs', ( assert ) => {

				const pass = new GTAOPass( new Scene(), new PerspectiveCamera(), 16, 16 );
				const depthTexture = pass.depthTexture;
				const normalTexture = pass.normalTexture;
				const combinedTexture = new Texture();

				assert.throws( () => pass.setGBuffer( combinedTexture, combinedTexture ), /separate textures/ );
				assert.strictEqual( pass.depthTexture, depthTexture );
				assert.strictEqual( pass.normalTexture, normalTexture );
				assert.true( pass._renderGBuffer );

				pass.dispose();
				combinedTexture.dispose();

			} );

			QUnit.test( 'Separate textures and depth-only inputs remain supported', ( assert ) => {

				const pass = new GTAOPass( new Scene(), new PerspectiveCamera(), 16, 16 );
				const depthTexture = new DepthTexture( 16, 16 );
				const normalTexture = new Texture();

				pass.setGBuffer( depthTexture, normalTexture );

				assert.false( pass._renderGBuffer );
				assert.strictEqual( pass.gtaoMaterial.uniforms.tDepth.value, depthTexture );
				assert.strictEqual( pass.gtaoMaterial.uniforms.tNormal.value, normalTexture );
				assert.strictEqual( pass.pdMaterial.uniforms.tDepth.value, depthTexture );
				assert.strictEqual( pass.pdMaterial.uniforms.tNormal.value, normalTexture );

				pass.setGBuffer( depthTexture );

				assert.strictEqual( pass.gtaoMaterial.defines.NORMAL_VECTOR_TYPE, 0 );
				assert.strictEqual( pass.pdMaterial.defines.NORMAL_VECTOR_TYPE, 0 );
				assert.strictEqual( pass.gtaoMaterial.uniforms.tNormal.value, undefined );
				assert.strictEqual( pass.pdMaterial.uniforms.tNormal.value, undefined );

				pass.dispose();
				depthTexture.dispose();
				normalTexture.dispose();

			} );

		} );

	} );

} );
