# Three.js Maya Export

Exports Maya models to Three.js' JSON format.  Currently supports exporting the following:

- Vertices
- Faces
- Normals
- UV sets
- Shaders/Materials
- Per-Face material indices
- Color/Diffuse Maps
- Specular Maps
- Bump/Normal Maps
- Bones
- Skins (configurable influences per vertex)
- Skeletal animation
- Morph Target/Vertex Cache animation
- Multiple Characters per scene

## Installation

(Maya 2016 suggested)

**Please note this plugin will not work with Maya LT, as it does not support PyMel.**

Install [pymel](http://download.autodesk.com/global/docs/maya2014/en_us/PyMel/install.html) if necessary – Maya 2015 and newer will already include this for you. If you need to install PyMel manually, you can clone the latest from the [LumaPictures/pymel](https://github.com/LumaPictures/pymel) repository.

Copy the scripts and plug-ins folders to the appropriate maya folder, where `maya-version` is your current version of Maya (eg. 2013-x64).

- Windows: `C:\Users\username\Documents\maya\maya-version`
- OSX: `~/Library/Preferences/Autodesk/maya/maya-version`
- Linux: `/usr/autodesk/userconfig/maya/maya-version`

After that, you need to activate the plugin.  In Maya, open `Windows > Settings/Preferences > Plug-in Manager` and enable the checkboxes next to `threeJsFileTranslator.py`.

![menu](http://i.imgur.com/XPsq77Q.png)

![plugin](http://i.imgur.com/Bvlj8l6.png)

## Usage

Use the regular Export menus within Maya, select `Three.js`.

## Notes

Export Selected will not export bones or animations. That is only supported in Export All.

The Maya "Color" Maps are exported as the diffuseColor and mapDiffuse attributes in JSON. The Maya "Diffuse" Maps do NOT export. 

It is recommended to do one character per scene if you are planning to export animations. All geometry will be merged together in the JSON during an export all.

## Trouble Shooting

If you are getting errors while exporting there are a couple things you can try that may help.

- Triangulate all objects before exporting. I have encountered geometry that will not export until I do this. 

- Freeze Transforms. If you've scaled your objects any amount before exporting you'll need to freeze transforms to ensure the normals are exported properly. 
