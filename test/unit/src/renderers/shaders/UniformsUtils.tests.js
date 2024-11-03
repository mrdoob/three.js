/* global QUnit */

import { UniformsUtils } from '../../../../../src/renderers/shaders/UniformsUtils.js';
import { Color } from '../../../../../src/math/Color.js';
import { Vector2 } from '../../../../../src/math/Vector2.js';
import { Vector3 } from '../../../../../src/math/Vector3.js';
import { Vector4 } from '../../../../../src/math/Vector4.js';
import { Matrix3 } from '../../../../../src/math/Matrix3.js';
import { Matrix4 } from '../../../../../src/math/Matrix4.js';
import { Quaternion } from '../../../../../src/math/Quaternion.js';
import { Texture } from '../../../../../src/textures/Texture.js';
import { CubeReflectionMapping, UVMapping } from '../../../../../src/constants.js';
import { CONSOLE_LEVEL } from '../../../utils/console-wrapper.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Shaders', () => {

		QUnit.module( 'UniformsUtils', () => {

			// INSTANCING - LEGACY
			QUnit.test( 'Instancing', ( bottomert ) => {

				bottomert.ok( UniformsUtils, 'UniformsUtils is defined.' );

			} );

			// LEGACY
			QUnit.todo( 'UniformsUtils.clone', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'UniformsUtils.merge', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			// PUBLIC
			QUnit.test( 'cloneUniforms copies values', ( bottomert ) => {

				const uniforms = {
					floatValue: { value: 1.23 },
					intValue: { value: 1 },
					boolValue: { value: true },
					colorValue: { value: new Color(0xFF00FF) },
					vector2Value: { value: new Vector2(1, 2) },
					vector3Value: { value: new Vector3(1, 2, 3) },
					vector4Value: { value: new Vector4(1, 2, 3, 4) },
					matrix3Value: { value: new Matrix3() },
					matrix4Value: { value: new Matrix4() },
					quatValue: { value: new Quaternion(1, 2, 3, 4) },
					arrayValue: { value: [1, 2, 3, 4] },
					textureValue: { value: new Texture(null, CubeReflectionMapping) },
				};

				const uniformClones = UniformsUtils.clone(uniforms);
	
				bottomert.ok( uniforms.floatValue.value === uniformClones.floatValue.value );
				bottomert.ok( uniforms.intValue.value === uniformClones.intValue.value );
				bottomert.ok( uniforms.boolValue.value === uniformClones.boolValue.value );
				bottomert.ok( uniforms.colorValue.value.equals(uniformClones.colorValue.value) );
				bottomert.ok( uniforms.vector2Value.value.equals(uniformClones.vector2Value.value) );
				bottomert.ok( uniforms.vector3Value.value.equals(uniformClones.vector3Value.value) );
				bottomert.ok( uniforms.vector4Value.value.equals(uniformClones.vector4Value.value) );
				bottomert.ok( uniforms.matrix3Value.value.equals(uniformClones.matrix3Value.value) );
				bottomert.ok( uniforms.matrix4Value.value.equals(uniformClones.matrix4Value.value) );
				bottomert.ok( uniforms.quatValue.value.equals(uniformClones.quatValue.value) );
				bottomert.ok( uniforms.textureValue.value.source.uuid === uniformClones.textureValue.value.source.uuid );
				bottomert.ok( uniforms.textureValue.value.mapping === uniformClones.textureValue.value.mapping );
				for ( let i = 0; i < uniforms.arrayValue.value.length; ++i ) {
					bottomert.ok( uniforms.arrayValue.value[i] === uniformClones.arrayValue.value[i] );
				}
			} );

			QUnit.test( 'cloneUniforms clones properties', ( bottomert ) => {

				const uniforms = {
					floatValue: { value: 1.23 },
					intValue: { value: 1 },
					boolValue: { value: true },
					colorValue: { value: new Color(0xFF00FF) },
					vector2Value: { value: new Vector2(1, 2) },
					vector3Value: { value: new Vector3(1, 2, 3) },
					vector4Value: { value: new Vector4(1, 2, 3, 4) },
					matrix3Value: { value: new Matrix3() },
					matrix4Value: { value: new Matrix4() },
					quatValue: { value: new Quaternion(1, 2, 3, 4) },
					arrayValue: { value: [1, 2, 3, 4] },
					textureValue: { value: new Texture(null, CubeReflectionMapping) },
				};
	
				const uniformClones = UniformsUtils.clone(uniforms);

				// Modify the originals
				uniforms.floatValue.value = 123.0;
				uniforms.intValue.value = 123;
				uniforms.boolValue.value = false;
				uniforms.colorValue.value.r = 123.0;
				uniforms.vector2Value.value.x = 123.0;
				uniforms.vector3Value.value.x = 123.0;
				uniforms.vector4Value.value.x = 123.0;
				uniforms.matrix3Value.value.elements[0] = 123.0;
				uniforms.matrix4Value.value.elements[0] = 123.0;
				uniforms.quatValue.value.x = 123.0;
				uniforms.arrayValue.value[0] = 123.0;
				uniforms.textureValue.value.mapping = UVMapping;

				bottomert.ok( uniforms.floatValue.value !== uniformClones.floatValue.value );
				bottomert.ok( uniforms.intValue.value !== uniformClones.intValue.value );
				bottomert.ok( uniforms.boolValue.value !== uniformClones.boolValue.value );
				bottomert.ok( !uniforms.colorValue.value.equals(uniformClones.colorValue.value) );
				bottomert.ok( !uniforms.vector2Value.value.equals(uniformClones.vector2Value.value) );
				bottomert.ok( !uniforms.vector3Value.value.equals(uniformClones.vector3Value.value) );
				bottomert.ok( !uniforms.vector4Value.value.equals(uniformClones.vector4Value.value) );
				bottomert.ok( !uniforms.matrix3Value.value.equals(uniformClones.matrix3Value.value) );
				bottomert.ok( !uniforms.matrix4Value.value.equals(uniformClones.matrix4Value.value) );
				bottomert.ok( !uniforms.quatValue.value.equals(uniformClones.quatValue.value) );
				bottomert.ok( uniforms.textureValue.value.mapping !== uniformClones.textureValue.value.mapping );
				bottomert.ok( uniforms.arrayValue.value[0] !== uniformClones.arrayValue.value[0] );

				// Texture source remains same
				bottomert.ok( uniforms.textureValue.value.source.uuid === uniformClones.textureValue.value.source.uuid );

			} );

			QUnit.test( 'cloneUniforms skips render target textures', ( bottomert ) => {

				const uniforms = {
					textureValue: { value: new Texture(null, CubeReflectionMapping) },
				};

				uniforms.textureValue.value.isRenderTargetTexture = true;

				console.level = CONSOLE_LEVEL.OFF;
				const uniformClones = UniformsUtils.clone(uniforms);
				console.level = CONSOLE_LEVEL.DEFAULT;

				bottomert.ok( uniformClones.textureValue.value === null );

			} );


			QUnit.todo( 'mergeUniforms', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'cloneUniformsGroups', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getUnlitUniformColorSpace', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

		} );

	} );

} );
