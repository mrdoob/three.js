/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { UniformsUtils } from '../../../../../src/renderers/shaders/UniformsUtils';
import { Color } from '../../../../../src/math/Color';
import { Vector2 } from '../../../../../src/math/Vector2';
import { Vector3 } from '../../../../../src/math/Vector3';
import { Vector4 } from '../../../../../src/math/Vector4';
import { Matrix3 } from '../../../../../src/math/Matrix3';
import { Matrix4 } from '../../../../../src/math/Matrix4';
import { Texture } from '../../../../../src/textures/Texture';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Shaders', () => {

		QUnit.module( 'UniformsUtils', () => {

			QUnit.test( "clone", ( assert ) => {

				// single values

				let uniforms = {
					singlePrimitive: { value: 0 },
					singleColor: { value: new Color( 0xff0000 ) },
					singleVector2: { value: new Vector2( 1, 1 ) },
					singleVector3: { value: new Vector3( 1, 1, 1 ) },
					singleVector4: { value: new Vector4( 1, 1, 1, 1 ) },
					singleMatrix3: { value: new Matrix3().set( 1, 1, 1, 1, 1, 1, 1, 1, 1 ) },
					singleMatrix4: { value: new Matrix4().set( 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ) },
					singleTexture: { value: new Texture() },
				};

				let clonedUniforms = UniformsUtils.clone( uniforms );

				assert.ok( clonedUniforms.singlePrimitive.value === uniforms.singlePrimitive.value, "Passed!" );
				assert.ok( clonedUniforms.singleColor.value.isColor, "Passed!" );
				assert.ok( clonedUniforms.singleColor.value.equals( uniforms.singleColor.value ), "Passed!" );
				assert.ok( clonedUniforms.singleVector2.value.isVector2, "Passed!" );
				assert.ok( clonedUniforms.singleVector2.value.equals( uniforms.singleVector2.value ), "Passed!" );
				assert.ok( clonedUniforms.singleVector3.value.isVector3, "Passed!" );
				assert.ok( clonedUniforms.singleVector3.value.equals( uniforms.singleVector3.value ), "Passed!" );
				assert.ok( clonedUniforms.singleVector4.value.isVector4, "Passed!" );
				assert.ok( clonedUniforms.singleVector4.value.equals( uniforms.singleVector4.value ), "Passed!" );
				assert.ok( clonedUniforms.singleMatrix3.value.isMatrix3, "Passed!" );
				assert.ok( clonedUniforms.singleMatrix3.value.equals( uniforms.singleMatrix3.value ), "Passed!" );
				assert.ok( clonedUniforms.singleMatrix4.value.isMatrix4, "Passed!" );
				assert.ok( clonedUniforms.singleMatrix4.value.equals( uniforms.singleMatrix4.value ), "Passed!" );
				assert.ok( clonedUniforms.singleTexture.value.isTexture, "Passed!" );

				// array of values

				uniforms = {
					arrayPrimitive: { value: [ 1, 2, 3 ] },
					arrayColor: { value: [ new Color( 0xff0000 ), new Color( 0x00ff00 ), new Color( 0x0000ff ) ] },
					arrayVector2: { value: [ new Vector2( 1, 1 ), new Vector2( 2, 2 ), new Vector2( 3, 3 ) ] },
					arrayVector3: { value: [ new Vector3( 1, 1, 1 ), new Vector3( 2, 2, 2 ), new Vector3( 3, 3, 3 ) ] },
					arrayVector4: { value: [ new Vector4( 1, 1, 1, 1 ), new Vector4( 2, 2, 2, 2 ), new Vector4( 3, 3, 3, 3 ) ] },
					arrayMatrix3: { value: [
						new Matrix3().set( 1, 1, 1, 1, 1, 1, 1, 1, 1 ),
						new Matrix3().set( 2, 2, 2, 2, 2, 2, 2, 2, 2 ),
						new Matrix3().set( 3, 3, 3, 3, 3, 3, 3, 3, 3 ),
					] },
					arrayMatrix4: { value: [
						new Matrix4().set( 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ),
						new Matrix4().set( 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2 ),
						new Matrix4().set( 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3 )
					] },
					arrayTexture: { value: [ new Texture(), new Texture(), new Texture() ] }
				};

				clonedUniforms = UniformsUtils.clone( uniforms );

				assert.ok( Array.isArray( clonedUniforms.arrayPrimitive.value ), "Passed!" );
				assert.ok( equals( clonedUniforms.arrayPrimitive.value, uniforms.arrayPrimitive.value ), "Passed!" );
				assert.ok( Array.isArray( clonedUniforms.arrayColor.value ), "Passed!" );
				assert.ok( equals( clonedUniforms.arrayColor.value, uniforms.arrayColor.value ), "Passed!" );
				assert.ok( Array.isArray( clonedUniforms.arrayVector2.value ), "Passed!" );
				assert.ok( equals( clonedUniforms.arrayVector2.value, uniforms.arrayVector2.value ), "Passed!" );
				assert.ok( Array.isArray( clonedUniforms.arrayVector3.value ), "Passed!" );
				assert.ok( equals( clonedUniforms.arrayVector3.value, uniforms.arrayVector3.value ), "Passed!" );
				assert.ok( Array.isArray( clonedUniforms.arrayVector4.value ), "Passed!" );
				assert.ok( equals( clonedUniforms.arrayVector4.value, uniforms.arrayVector4.value ), "Passed!" );
				assert.ok( Array.isArray( clonedUniforms.arrayMatrix3.value ), "Passed!" );
				assert.ok( equals( clonedUniforms.arrayMatrix3.value, uniforms.arrayMatrix3.value ), "Passed!" );
				assert.ok( Array.isArray( clonedUniforms.arrayMatrix4.value ), "Passed!" );
				assert.ok( equals( clonedUniforms.arrayMatrix4.value, uniforms.arrayMatrix4.value ), "Passed!" );
				assert.ok( Array.isArray( clonedUniforms.arrayTexture.value ), "Passed!" );

			} );

		} );

	} );

} );

function equals( a, b ) {

	for ( let i = 0, l = a.length; i < l; i ++ ) {

		if ( typeof a[ i ] === 'object' ) {

			if ( a[ i ].equals( b[ i ] ) === false ) return false;

		} else {

			if ( a[ i ] !== b[ i ] ) return false;

		}

	}

	return true;

}
