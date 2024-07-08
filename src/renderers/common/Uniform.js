import { Color } from '../../math/Color.js';
import { Matrix3 } from '../../math/Matrix3.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { Vector2 } from '../../math/Vector2.js';
import { Vector3 } from '../../math/Vector3.js';
import { Vector4 } from '../../math/Vector4.js';

class Uniform {

	constructor( name, value ) {

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

class NumberUniform extends Uniform {

	constructor( name, value = 0 ) {

		super( name, value );

		this.isNumberUniform = true;

		this.boundary = 4;
		this.itemSize = 1;

	}

}

class Vector2Uniform extends Uniform {

	constructor( name, value = new Vector2() ) {

		super( name, value );

		this.isVector2Uniform = true;

		this.boundary = 8;
		this.itemSize = 2;

	}

}

class Vector3Uniform extends Uniform {

	constructor( name, value = new Vector3() ) {

		super( name, value );

		this.isVector3Uniform = true;

		this.boundary = 16;
		this.itemSize = 3;

	}

}

class Vector4Uniform extends Uniform {

	constructor( name, value = new Vector4() ) {

		super( name, value );

		this.isVector4Uniform = true;

		this.boundary = 16;
		this.itemSize = 4;

	}

}

class ColorUniform extends Uniform {

	constructor( name, value = new Color() ) {

		super( name, value );

		this.isColorUniform = true;

		this.boundary = 16;
		this.itemSize = 3;

	}

}

class Matrix3Uniform extends Uniform {

	constructor( name, value = new Matrix3() ) {

		super( name, value );

		this.isMatrix3Uniform = true;

		this.boundary = 48;
		this.itemSize = 12;

	}

}

class Matrix4Uniform extends Uniform {

	constructor( name, value = new Matrix4() ) {

		super( name, value );

		this.isMatrix4Uniform = true;

		this.boundary = 64;
		this.itemSize = 16;

	}

}

export {
	NumberUniform,
	Vector2Uniform, Vector3Uniform, Vector4Uniform, ColorUniform,
	Matrix3Uniform, Matrix4Uniform
};
