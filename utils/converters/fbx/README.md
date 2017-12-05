## convert-to-threejs

Utility for converting model files to the Three.js JSON format

## Supported Formats

* Fbx (.fbx)
* Collada (.dae) 
* Wavefront/Alias (.obj)
* 3D Studio Max (.3ds)

## Usage 

```
convert_to_threejs.py [source_file] [output_file] [options]

Options:
  -t, --triangulate       force non-triangle geometry into triangles
  -x, --ignore-textures   don't include texture references in output file
  -u, --force-prefix      prefix all object names in output file to ensure uniqueness
  -f, --flatten-scene     merge all geometries and apply node transforms
  -c, --add-camera        include default camera in output scene
  -l, --add-light         include default light in output scene
  -p, --pretty-print      prefix all object names in output file
```

## Current Limitations

* No animation support
* Only Lambert and Phong materials are supported
* Some camera properties are not converted correctly
* Some light properties are not converted correctly
* Some material properties are not converted correctly
* Textures must be put in asset's folder, and use relative path in the material

## Dependencies

### FBX SDK
* Requires Autodesk FBX SDK Python 2013.3 bindings. 

```
You can download the python bindings from the Autodesk website: 
  http://usa.autodesk.com/fbx/
```

```
Don't forget the visit the FBX SDK documentation website:
  http://docs.autodesk.com/FBX/2013/ENU/FBX-SDK-Documentation/cpp_ref/index.html
```

*Note:* If you use the OSX installer, it will install the Python packages into the following folder.

```
/Applications/Autodesk/FBX Python SDK/[VERSION]/lib/
```

If the tool still can't find the FBX SDK, you may need to copy the `fbx.so`, `FbxCommon.py` and `sip.so` files into your site_packages folder. 

If you don't know your site_packages folder, run `python` from shell and paste this:

```py
import site; site.getsitepackages()
```

### Python
* Requires Python 2.6, 2.7 or 3.1 (The FBX SDK requires one of these versions)

``` bash
sudo apt-get install build-essential
wget http://www.python.org/ftp/python/2.6.8/Python-2.6.8.tar.bz2
tar jxf ./Python-2.6.8.tar.bz2
cd ./Python-2.6.8
./configure --prefix=/opt/python2.6.8 && make && make install
```
