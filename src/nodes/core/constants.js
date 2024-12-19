/** @module NodeConstants **/

/**
 * Possible shader stages.
 *
 * @property {string} VERTEX The vertex shader stage.
 * @property {string} FRAGMENT The fragment shader stage.
 */
export const NodeShaderStage = {
	VERTEX: 'vertex',
	FRAGMENT: 'fragment'
};

/**
 * Update types of a node.
 *
 * @property {string} NONE The update method is not executed.
 * @property {string} FRAME The update method is executed per frame.
 * @property {string} RENDER The update method is executed per render. A frame might be produced by multiple render calls so this value allows more detailed updates than FRAME.
 * @property {string} OBJECT The update method is executed per {@link Object3D} that uses the node for rendering.
 */
export const NodeUpdateType = {
	NONE: 'none',
	FRAME: 'frame',
	RENDER: 'render',
	OBJECT: 'object'
};

/**
 * Data types of a node.
 *
 * @property {string} BOOLEAN Boolean type.
 * @property {string} INTEGER Integer type.
 * @property {string} FLOAT Float type.
 * @property {string} VECTOR2 Two-dimensional vector type.
 * @property {string} VECTOR3 Three-dimensional vector type.
 * @property {string} VECTOR4 Four-dimensional vector type.
 * @property {string} MATRIX2 2x2 matrix type.
 * @property {string} MATRIX3 3x3 matrix type.
 * @property {string} MATRIX4 4x4 matrix type.
 */
export const NodeType = {
	BOOLEAN: 'bool',
	INTEGER: 'int',
	FLOAT: 'float',
	VECTOR2: 'vec2',
	VECTOR3: 'vec3',
	VECTOR4: 'vec4',
	MATRIX2: 'mat2',
	MATRIX3: 'mat3',
	MATRIX4: 'mat4'
};

/**
 * Access types of a node. These are relevant for compute and storage usage.
 *
 * @property {string} READ_ONLY Read-only access
 * @property {string} WRITE_ONLY Write-only access.
 * @property {string} READ_WRITE Read and write access.
 */
export const NodeAccess = {
	READ_ONLY: 'readOnly',
	WRITE_ONLY: 'writeOnly',
	READ_WRITE: 'readWrite',
};

export const defaultShaderStages = [ 'fragment', 'vertex' ];
export const defaultBuildStages = [ 'setup', 'analyze', 'generate' ];
export const shaderStages = [ ...defaultShaderStages, 'compute' ];
export const vectorComponents = [ 'x', 'y', 'z', 'w' ];
