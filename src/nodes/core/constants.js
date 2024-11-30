
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

export const NodeAccess = {
	READ_ONLY: 'readOnly',
	WRITE_ONLY: 'writeOnly',
	READ_WRITE: 'readWrite',
};

export const defaultShaderStages = [ 'fragment', 'vertex' ];
export const defaultBuildStages = [ 'setup', 'analyze', 'generate' ];
export const shaderStages = [ ...defaultShaderStages, 'compute' ];
export const vectorComponents = [ 'x', 'y', 'z', 'w' ];
