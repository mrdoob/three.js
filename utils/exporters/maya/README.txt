
Maya THREE.js exporter supporting static and animated meshes. The exporter is composed of
two files: threeJsFileTranslator.py and ThreeJsExportScript.mel. Place the Python file in
the Maya plug-ins/ folder. Place the MEL script in the Maya scripts/ folder. From Maya load
the exporter from the plug-ins window.

Original Author: Chris Lewis, clewis1@c.ringling.edu

Modified by Black Tower Entertainment, LLC (4/2/14)
    Douglas Morrison, doug@blacktowerentertainment.com 
    Alexander Dines, alex@blacktowerentertainment.com
 
Exports Maya models to Three.js' ASCII JSON format.  Currently supports exporting the following:

- Vertices
- Faces
- Normals
- UV sets
- Material indices
- Vertex colors
- Bones
- Animations
- Skin Weights and Indices

## Installation

Copy the scripts and plug-ins folders to the appropriate maya folder, where `maya-version` is your current version of Maya (eg. 2013-x64).

- Windows: `C:\Users\username\Documents\maya\maya-version`
- OSX: `~/Library/Preferences/Autodesk/maya/maya-version`
- Linux: `/usr/autodesk/userconfig/maya/maya-version`

After that, you need to activate the plugin.  In Maya, open `Window > Settings/Preferences > Plug-in Manager` and enable the checkboxes next to `threeJsFileTranslator.py`.

## Usage

Use the regular Export menus within Maya, select `Three.js`.

