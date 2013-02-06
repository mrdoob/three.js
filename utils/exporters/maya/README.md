# Three.js Maya Export

Exports Maya models to Three.js' ASCII JSON format.  Currently supports exporting the following:

- Vertices
- Faces
- Normals
- UV sets
- Material indices
- Vertex colors

## Installation

Copy the scripts and plug-ins folders to the appropriate maya folder, where `maya-version` is your current version of Maya (eg. 2013-x64).

- Windows: `C:\Users\username\Documents\maya\maya-version`
- OSX: `~/Library/Preferences/Autodesk/maya/maya-version`
- Linux: `/usr/autodesk/userconfig/maya/maya-version`

After that, you need to activate the plugin.  In Maya, open `Window > Settings/Preferences > Plug-in Manager` and enable the checkboxes next to `threeJsFileTranslator.py`.

## Usage

Use the regular Export menus within Maya, select `Three.js`.