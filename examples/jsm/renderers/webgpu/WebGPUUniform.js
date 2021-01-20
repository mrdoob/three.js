import { Color, Matrix3, Matrix4, Vector2, Vector3, Vector4 } from '../../../../build/three.module.js';

class WebGPUUniform {

	constructor( name, value = null ) {

		this.name = name;
		this.value = value;

		this.boundary = 0; // used to build the uniform buffer according to the STD140 layout
		this.itemSize = 0;

		this.offset = 0; // this property is set by WebGPUUniformsGroup and marks the start position in the uniform buffer

	}

	setValue( value ) {

		this.value = value;

	}

	getValue() {

		return this.value;

	}

}

class FloatUniform extends WebGPUUniform {

	constructor( name, value = 0 ) {

		super( name, value );

		this.boundary = 4;
		this.itemSize = 1;

		Object.defineProperty( this, 'isFloatUniform', { value: true } );

	}

	getValue() {

		return this.nodeUniform.value;

	}

}

class Vector2Uniform extends WebGPUUniform {

	constructor( name, value = new Vector2() ) {

		super( name, value );

		this.boundary = 8;
		this.itemSize = 2;

		Object.defineProperty( this, 'isVector2Uniform', { value: true } );

	}

}

class Vector3Uniform extends WebGPUUniform {

	constructor( name, value = new Vector3() ) {

		super( name, value );

		this.boundary = 16;
		this.itemSize = 3;

		Object.defineProperty( this, 'isVector3Uniform', { value: true } );

	}

}

class Vector4Uniform extends WebGPUUniform {

	constructor( name, value = new Vector4() ) {

		super( name, value );

		this.boundary = 16;
		this.itemSize = 4;

		Object.defineProperty( this, 'isVector4Uniform', { value: true } );

	}

}

class ColorUniform extends WebGPUUniform {

	constructor( name, value = new Color() ) {

		super( name, value );

		this.boundary = 16;
		this.itemSize = 3;

		Object.defineProperty( this, 'isColorUniform', { value: true } );

	}

}

class Matrix3Uniform extends WebGPUUniform {

	constructor( name, value = new Matrix3() ) {

		super( name, value );

		this.boundary = 48;
		this.itemSize = 12;

		Object.defineProperty( this, 'isMatrix3Uniform', { value: true } );

	}

}

class Matrix4Uniform extends WebGPUUniform {

	constructor( name, value = new Matrix4() ) {

		super( name, value );

		this.boundary = 64;
		this.itemSize = 16;

		Object.defineProperty( this, 'isMatrix4Uniform', { value: true } );

	}

}

export { FloatUniform, Vector2Uniform, Vector3Uniform, Vector4Uniform, ColorUniform, Matrix3Uniform, Matrix4Uniform };
