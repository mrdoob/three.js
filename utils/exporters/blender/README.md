# Three.js Blender Export

Exports Three.js' ASCII JSON format.

## IMPORTANT

The exporter (r69 and earlier) has been completely replaced. Please ensure you have removed the io_three_mesh addon from your Blender addons directory before installing the current addon (io_three).

## Installation

Copy the io_three folder to the scripts/addons folder. If it doesn't exist, create it. The full path is OS-dependent (see below).

Once that is done, you need to activate the plugin. Open Blender preferences, look for
Addons, search for `three`, enable the checkbox next to the `Import-Export: Three.js Format` entry.

Goto Usage.

### Windows

Should look like this:

    C:\Program Files\Blender Foundation\Blender\2.7X\scripts\addons
    
OR (for 2.6)
    
    C:\Users\USERNAME\AppData\Roaming\Blender Foundation\Blender\2.6X\scripts\addons

### OSX

Depends on where blender.app is. Assuming you copied it to your Applications folder:

    /Applications/blender.app/Contents/Resources/2.7X/scripts/addons
    
OR (for 2.6)

    /Applications/blender.app/Contents/MacOS/2.6X/scripts/addons

### Linux

By default, this should look like:

    /home/USERNAME/.config/blender/2.6X/scripts/addons

For Ubuntu users who installed Blender 2.68 via apt-get, this is the location:

    /usr/lib/blender/scripts/addons
    

## Usage

Activate the Import-Export addon under "User Preferences" > "Addons" and then use the regular Export menu within Blender, select `Three.js (json)`.


## Enabling msgpack
To enable msgpack compression copy the msgpack to scripts/modules.


## Importer
Currently there is no import functionality available.
