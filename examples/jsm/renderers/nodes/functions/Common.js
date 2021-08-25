import FunctionNode from '../core/FunctionNode.js';

export const BoneMatrix = new FunctionNode( `
	mat4 getBoneMatrix( const in float i, const in texture2D boneTexture, const in sampler boneSampler, const in float boneTextureSize ) {
		float j = i * 4.0;
		float x = mod( j, float( boneTextureSize ) );
		float y = floor( j / float( boneTextureSize ) );
		float dx = 1.0 / float( boneTextureSize );
		float dy = 1.0 / float( boneTextureSize );
		y = dy * ( y + 0.5 );
		vec4 v1 = texture( sampler2D( boneTexture, boneSampler ), vec2( dx * ( x + 0.5 ), y ) );
		vec4 v2 = texture( sampler2D( boneTexture, boneSampler ), vec2( dx * ( x + 1.5 ), y ) );
		vec4 v3 = texture( sampler2D( boneTexture, boneSampler ), vec2( dx * ( x + 2.5 ), y ) );
		vec4 v4 = texture( sampler2D( boneTexture, boneSampler ), vec2( dx * ( x + 3.5 ), y ) );
		mat4 bone = mat4( v1, v2, v3, v4 );
		return bone;
	}`
);

export const SkinningPosition = new FunctionNode( `
	vec3 getSkinningPosition( const in vec4 index, const in vec4 weight, const in vec3 position, const in mat4 bindMatrix, const in mat4 bindMatrixInverse, const in texture2D boneTexture, const in sampler boneSampler, const in float boneTextureSize ) {
		mat4 boneMatX = getBoneMatrix( index.x, boneTexture, boneSampler, boneTextureSize );
		mat4 boneMatY = getBoneMatrix( index.y, boneTexture, boneSampler, boneTextureSize );
		mat4 boneMatZ = getBoneMatrix( index.z, boneTexture, boneSampler, boneTextureSize );
		mat4 boneMatW = getBoneMatrix( index.w, boneTexture, boneSampler, boneTextureSize );
		vec4 skinVertex = bindMatrix * vec4( position, 1.0 );
		vec4 skinned = vec4( 0.0 );
		skinned += boneMatX * skinVertex * weight.x;
		skinned += boneMatY * skinVertex * weight.y;
		skinned += boneMatZ * skinVertex * weight.z;
		skinned += boneMatW * skinVertex * weight.w;
		return ( bindMatrixInverse * skinned ).xyz;
	}`
).setIncludes( [ BoneMatrix ] );
