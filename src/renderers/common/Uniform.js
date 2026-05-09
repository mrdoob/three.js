import { Color } from '../../math/Color.js';
import { Matrix2 } from '../../math/Matrix2.js';
import { Matrix3 } from '../../math/Matrix3.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { Vector2 } from '../../math/Vector2.js';
import { Vector3 } from '../../math/Vector3.js';
import { Vector4 } from '../../math/Vector4.js';

/**
 * Abstract base class for uniforms.
 *
 * @abstract
 * @private
 */
class Uniform {

	/**
	 * Constructs a new uniform.
	 *
	 * @param {string} name - The uniform's name.
	 * @param {any} value - The uniform's value.
	 */
	constructor( name, value ) {

		/**
		 * The uniform's name.
		 *
		 * @type {string}
		 */
		this.name = name;

		/**
		 * The uniform's value.
		 *
		 * @type {any}
		 */
		this.value = value;

		/**
		 * Used to build the uniform buffer according to the STD140 layout.
		 * Derived uniforms will set this property to a data type specific
		 * value.
		 *
		 * @type {number}
		 */
		this.boundary = 0;

		/**
		 * The item size. Derived uniforms will set this property to a data
		 * type specific value.
		 *
		 * @type {number}
		 */
		this.itemSize = 0;

		/**
		 * This property is set by {@link UniformsGroup} and marks
		 * the start position in the uniform buffer.
		 *
		 * @type {number}
		 */
		this.offset = 0;

		/**
		 * This property is set by {@link UniformsGroup} and marks
		 * the index position in the uniform array.
		 *
		 * @type {number}
		 */
		this.index = - 1;

	}

	/**
	 * Sets the uniform's value.
	 *
	 * @param {any} value - The value to set.
	 */
	setValue( value ) {

		this.value = value;

	}

	/**
	 * Returns the uniform's value.
	 *
	 * @return {any} The value.
	 */
	getValue() {

		return this.value;

	}

}

/**
 * Represents a Number uniform.
 *
 * @private
 * @augments Uniform
 */
class NumberUniform extends Uniform {

	/**
	 * Constructs a new Number uniform.
	 *
	 * @param {string} name - The uniform's name.
	 * @param {number} value - The uniform's value.
	 */
	constructor( name, value = 0 ) {

		super( name, value );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isNumberUniform = true;

		this.boundary = 4;
		this.itemSize = 1;

	}

}

/**
 * Represents a Vector2 uniform.
 *
 * @private
 * @augments Uniform
 */
class Vector2Uniform extends Uniform {

	/**
	 * Constructs a new Number uniform.
	 *
	 * @param {string} name - The uniform's name.
	 * @param {Vector2} value - The uniform's value.
	 */
	constructor( name, value = new Vector2() ) {

		super( name, value );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isVector2Uniform = true;

		this.boundary = 8;
		this.itemSize = 2;

	}

}

/**
 * Represents a Vector3 uniform.
 *
 * @private
 * @augments Uniform
 */
class Vector3Uniform extends Uniform {

	/**
	 * Constructs a new Number uniform.
	 *
	 * @param {string} name - The uniform's name.
	 * @param {Vector3} value - The uniform's value.
	 */
	constructor( name, value = new Vector3() ) {

		super( name, value );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isVector3Uniform = true;

		this.boundary = 16;
		this.itemSize = 3;

	}

}

/**
 * Represents a Vector4 uniform.
 *
 * @private
 * @augments Uniform
 */
class Vector4Uniform extends Uniform {

	/**
	 * Constructs a new Number uniform.
	 *
	 * @param {string} name - The uniform's name.
	 * @param {Vector4} value - The uniform's value.
	 */
	constructor( name, value = new Vector4() ) {

		super( name, value );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isVector4Uniform = true;

		this.boundary = 16;
		this.itemSize = 4;

	}

}

/**
 * Represents a Color uniform.
 *
 * @private
 * @augments Uniform
 */
class ColorUniform extends Uniform {

	/**
	 * Constructs a new Number uniform.
	 *
	 * @param {string} name - The uniform's name.
	 * @param {Color} value - The uniform's value.
	 */
	constructor( name, value = new Color() ) {

		super( name, value );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isColorUniform = true;

		this.boundary = 16;
		this.itemSize = 3;

	}

}

/**
 * Represents a Matrix2 uniform.
 *
 * @private
 * @augments Uniform
 */
class Matrix2Uniform extends Uniform {

	/**
	 * Constructs a new Number uniform.
	 *
	 * @param {string} name - The uniform's name.
	 * @param {Matrix2} value - The uniform's value.
	 */
	constructor( name, value = new Matrix2() ) {

		super( name, value );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isMatrix2Uniform = true;

		this.boundary = 8;
		this.itemSize = 4;

	}

}


/**
 * Represents a Matrix3 uniform.
 *
 * @private
 * @augments Uniform
 */
class Matrix3Uniform extends Uniform {

	/**
	 * Constructs a new Number uniform.
	 *
	 * @param {string} name - The uniform's name.
	 * @param {Matrix3} value - The uniform's value.
	 */
	constructor( name, value = new Matrix3() ) {

		super( name, value );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isMatrix3Uniform = true;

		this.boundary = 48;
		this.itemSize = 12;

	}

}

/**
 * Represents a Matrix4 uniform.
 *
 * @private
 * @augments Uniform
 */
class Matrix4Uniform extends Uniform {

	/**
	 * Constructs a new Number uniform.
	 *
	 * @param {string} name - The uniform's name.
	 * @param {Matrix4} value - The uniform's value.
	 */
	constructor( name, value = new Matrix4() ) {

		super( name, value );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isMatrix4Uniform = true;

		this.boundary = 64;
		this.itemSize = 16;

	}

}

export {
	NumberUniform,
	Vector2Uniform, Vector3Uniform, Vector4Uniform, ColorUniform,
	Matrix2Uniform, Matrix3Uniform, Matrix4Uniform
};
