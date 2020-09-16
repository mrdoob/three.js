import { Color, Matrix3, Matrix4, Vector2, Vector3, Vector4 } from '../../../../build/three.module.js';

class WebGPUUniform {

	constructor( name, value ) {

		this.name = name;
		this.value = value;

		this.byteLength = 0;
		this.itemSize = 0;
		this.value = null;

	}

	setValue( value ) {

		this.value = value;

	}

}

class FloatUniform extends WebGPUUniform {

	constructor( name, value = 0 ) {

		super( name, value );

		this.byteLength = 4;
		this.itemSize = 1;

		Object.defineProperty( this, 'isFloatUniform', { value: true } );

	}

}

class Vector2Uniform extends WebGPUUniform {

	constructor( name, value = new Vector2() ) {

		super( name, value );

		this.byteLength = 8;
		this.itemSize = 2;

		Object.defineProperty( this, 'isVector2Uniform', { value: true } );

	}

}

class Vector3Uniform extends WebGPUUniform {

	constructor( name, value = new Vector3() ) {

		super( name, value );

		this.byteLength = 12;
		this.itemSize = 3;

		Object.defineProperty( this, 'isVector3Uniform', { value: true } );

	}

}

class Vector4Uniform extends WebGPUUniform {

	constructor( name, value = new Vector4() ) {

		super( name, value );

		this.byteLength = 16;
		this.itemSize = 4;

		Object.defineProperty( this, 'isVector4Uniform', { value: true } );

	}

}

class ColorUniform extends WebGPUUniform {

	constructor( name, value = new Color() ) {

		super( name, value );

		this.byteLength = 12;
		this.itemSize = 3;

		Object.defineProperty( this, 'isColorUniform', { value: true } );

	}

}

class Matrix3Uniform extends WebGPUUniform {

	constructor( name, value = new Matrix3() ) {

		super( name, value );

		this.byteLength = 48; // (3 * 4) * 4 bytes
		this.itemSize = 12;

		Object.defineProperty( this, 'isMatrix3Uniform', { value: true } );

	}

}

class Matrix4Uniform extends WebGPUUniform {

	constructor( name, value = new Matrix4() ) {

		super( name, value );

		this.byteLength = 64;
		this.itemSize = 16;

		Object.defineProperty( this, 'isMatrix4Uniform', { value: true } );

	}

}

export { FloatUniform, Vector2Uniform, Vector3Uniform, Vector4Uniform, ColorUniform, Matrix3Uniform, Matrix4Uniform };
