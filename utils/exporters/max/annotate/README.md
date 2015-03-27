## annotate

Utility to split THREE.js model (exported from 3D Studio Max) with single animation into seperate parts based on frame ranges.

## Description

This utility refactors THREE.js JSON model files that were exported using `ThreeJSAnimationExporter.ms` plugin to maintain few animations instead of a single "Action" animation. List of resulting animation names and frame ranges has to be provided.

## Supported Formats

* THREE.js JSON (.js)

## Usage 

```
annotate.py [-h] [-u] -i FILE -o FILE range [range ...]

Split THREE.js model animation into seperate parts.

positional arguments:
  range       range in format "name=frame..frame"

optional arguments:
  -h, --help  show this help message and exit
  -u, --gui   run in GUI
  -i FILE     input file name
  -o FILE     output file name

example:
  annotate.py -i model.js -o model.new.js idle=1..10 walk=11..20
```

## Current Limitations

* No known limitations

## Dependencies

* Python 2.7 or 3.1
* **Requires THREE.js >= r71 for output animation to work properly.**

## Optional dependencies

* PyQt4
* argparseui

## Example usage

```
./annotate.py -i model.js -o model.new.js idle=1..10 walk=1..20
```

```
// ...
this.animation = new THREE.Animation(
    mesh,
    geometry.animations.walk,
    THREE.AnimationHandler.CATMULLROM
);
// ...
```

## Contribution

I highly encourage you to participate in the development of this utility.
Author: Andrew Dunai
