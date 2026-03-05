# Transpiler

A class that transpiles shader code from one language into another.

`Transpiler` can only be used to convert GLSL into TSL right now. It is intended to support developers when they want to migrate their custom materials from the current to the new node-based material system.

## Import

Transpiler is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import Transpiler from 'three/addons/transpiler/Transpiler.js';
```

## Constructor

### new Transpiler( decoder : GLSLDecoder, encoder : TSLEncoder )

Constructs a new transpiler.

**decoder**

The GLSL decoder.

**encoder**

The TSL encoder.

## Properties

### .decoder : GLSLDecoder

The GLSL decoder. This component parse GLSL and produces a language-independent AST for further processing.

### .encoder : TSLEncoder

The TSL encoder. It takes the AST and emits TSL code.

### .linker : Linker

The linker. It processes the AST and resolves variable and function references, ensuring that all dependencies are properly linked.

## Methods

### .parse( source : string ) : string

Parses the given GLSL source and returns TSL syntax.

**source**

The GLSL source.

**Returns:** The TSL code.

## Source

[examples/jsm/transpiler/Transpiler.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/transpiler/Transpiler.js)