# FilmShader

## Import

FilmShader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { FilmShader } from 'three/addons/shaders/FilmShader.js';
```

## Properties

### .FilmShader : ShaderMaterial~Shader (inner, constant)

Film grain shader that adds animated noise to the image, with an optional grayscale conversion.

Used by [FilmPass](FilmPass.html).

## Source

[examples/jsm/shaders/FilmShader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/FilmShader.js)