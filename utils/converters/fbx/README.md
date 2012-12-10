## convert-to-threejs

Utility for converting model files to the Three.js JSON format

## Supported Formats

* Fbx (.fbx) (versions 7.3, 7.2, 7.1, 7.0, 6.1, and 6.0) (non-binary)
* Collada (.dae) (1.5 and earlier) 
* Wavefront/Alias (.obj)
* 3D Studio Max (.3ds)

## Usage 

```
convert_to_threejs.py [source_file] [output_file] [options]

Options:
  -t, --triangulate     force quad geometry into triangles
  -p, --prefix          prefix object names in the output file
  -g, --geometry-only   output geometry only
  -c, --default-camera  include a default camera in the output scene
  -l, --defualt-light   include a default light in the output scene
  -x, --no-textures     don't include texture references in the output file
```

## Supported Features

* Object Hierarchies
* Lights (Ambient, Point, Directional)
* Cameras (Perspective, Ortho)
* Geometries (Triangles, Quads, Nurbs)
* Materials (Phong, Lambert)
* Textures (Diffuse, Emissive, Ambient, Specular, Normal, Bump)
* Multiple UV layers
* Multiple materials per mesh

## Current Limitations

* No animation support
* Only Lambert and Phong materials are supported
* Some camera properties are not converted correctly
* Some light properties are not converted correctly
* Some material properties are not converted correctly

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

### Python
* Requires Python 2.6 or 3.1 (The FBX SDK requires one of these versions)

``` bash
sudo apt-get install build-essential
wget http://www.python.org/ftp/python/2.6.8/Python-2.6.8.tar.bz2
tar jxf ./Python-2.6.8.tar.bz2
cd ./Python-2.6.8
./configure --prefix=/opt/python2.6.8 && make && make install
```
