*Inheritance: EventDispatcher → Texture →*

# CubeTexture

Creates a cube texture made up of six images.

## Code Example

```js
const loader = new THREE.CubeTextureLoader();
loader.setPath( 'textures/cube/pisa/' );
const textureCube = loader.load( [
	'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'
] );
const material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );
```

## Constructor

### new CubeTexture( images : Array.<Image>, mapping : number, wrapS : number, wrapT : number, magFilter : number, minFilter : number, format : number, type : number, anisotropy : number, colorSpace : string )

Constructs a new cube texture.

**images**

An array holding a image for each side of a cube.

Default is `[]`.

**mapping**

The texture mapping.

Default is `CubeReflectionMapping`.

**wrapS**

The wrapS value.

Default is `ClampToEdgeWrapping`.

**wrapT**

The wrapT value.

Default is `ClampToEdgeWrapping`.

**magFilter**

The mag filter value.

Default is `LinearFilter`.

**minFilter**

The min filter value.

Default is `LinearMipmapLinearFilter`.

**format**

The texture format.

Default is `RGBAFormat`.

**type**

The texture type.

Default is `UnsignedByteType`.

**anisotropy**

The anisotropy value.

Default is `Texture.DEFAULT_ANISOTROPY`.

**colorSpace**

The color space value.

Default is `NoColorSpace`.

## Properties

### .flipY : boolean

If set to `true`, the texture is flipped along the vertical axis when uploaded to the GPU.

Overwritten and set to `false` by default.

Default is `false`.

**Overrides:** [Texture#flipY](Texture.html#flipY)

### .images : Array.<Image>

Alias for [CubeTexture#image](CubeTexture.html#image).

### .isCubeTexture : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Source

[src/textures/CubeTexture.js](https://github.com/mrdoob/three.js/blob/master/src/textures/CubeTexture.js)