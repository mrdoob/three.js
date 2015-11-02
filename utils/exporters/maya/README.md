# Three.js Maya Export

Exports Maya models to Three.js' JSON format.  Currently supports exporting the following:

- Vertices
- Faces
- Normals
- UV sets
- Shaders/Materials
- Per-Face material indices
- Diffuse Maps
- Specular Maps
- Bump/Normal Maps
- Bones
- Skins (configurable influences per vertex)
- Skeletal animation
- Morph Target/Vertex Cache animation
- Multiple Characters per scene

## Installation

Install [pymel](http://download.autodesk.com/global/docs/maya2014/en_us/PyMel/install.html).
Though the docs are way out of date, the process described still works as of
2014.

Copy the scripts and plug-ins folders to the appropriate maya folder, where `maya-version` is your current version of Maya (eg. 2013-x64).

- Windows: `C:\Users\username\Documents\maya\maya-version`
- OSX: `~/Library/Preferences/Autodesk/maya/maya-version`
- Linux: `/usr/autodesk/userconfig/maya/maya-version`

After that, you need to activate the plugin.  In Maya, open `Window > Settings/Preferences > Plug-in Manager` and enable the checkboxes next to `threeJsFileTranslator.py`.

## Usage

Use the regular Export menus within Maya, select `Three.js`.
