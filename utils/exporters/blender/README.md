# Three.js Blender Import/Export

Imports and exports Three.js' ASCII JSON format.

Assumes Blender version 2.60.

## Installation

Copy the io_mesh_threejs folder to the scripts/addons folder. If it doesn't exist, create it. The full path is OS-dependent (see below).

Once that is done, you need to activate the plugin. Open Blender preferences, look for
Addons, search for `three`, enable the checkbox next to the `Import-Export: three.js format` entry.

Goto Usage.

### Windows

Should look like this:

    C:\Users\USERNAME\AppData\Roaming\Blender Foundation\Blender\2.60\scripts\addons

### OSX

Depends on where blender.app is. Assuming you copied it to your Applications folder:

    /Applications/Blender/blender.app/Contents/MacOS/2.60/scripts/addons

### Linux

By default, this should look like:

    /home/USERNAME/.blender/2.60/scripts/addons

## Usage

Use the regular Import and Export menu within Blender, select `Three.js (js)`.

