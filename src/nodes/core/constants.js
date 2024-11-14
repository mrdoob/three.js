export const NodeShaderStage = {
	VERTEX: 'vertex',
	FRAGMENT: 'fragment'
};

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
