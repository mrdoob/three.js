PerspectiveCamera - Camera with perspective projection
---------------------------------------------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: PerspectiveCamera( fov, aspect, near, far )

    Camera with perspective projection

    Part of scene graph

    Inherits from :class:`Object3D` :class:`Camera`

    :param float fov: field of view
    :param float aspect: aspect ratio
    :param float near: near
    :param float far: far


.. ...............................................................................
.. rubric:: Attributes
.. ...............................................................................

.. attribute:: PerspectiveCamera.fov

    Camera frustum vertical field of view

.. attribute:: PerspectiveCamera.aspect

    Camera frustum aspect ratio

.. attribute:: PerspectiveCamera.near

    Camera frustum near plane

.. attribute:: PerspectiveCamera.far

    Camera frustum far plane

.. ...............................................................................
.. rubric:: Multi-view attributes
.. ...............................................................................

.. attribute:: PerspectiveCamera.fullWidth
.. attribute:: PerspectiveCamera.fullHeight
.. attribute:: PerspectiveCamera.x
.. attribute:: PerspectiveCamera.y
.. attribute:: PerspectiveCamera.width
.. attribute:: PerspectiveCamera.height


.. ...............................................................................
.. rubric:: Methods
.. ...............................................................................

.. function:: PerspectiveCamera.updateProjectionMatrix()

    Updates camera's projection matrix. Must be called after change of parameters.

.. function:: PerspectiveCamera.setLens ( focalLength, frameSize )

    Uses focal length (in mm) to estimate and set FOV
    35mm (fullframe) camera is used if frame size is not specified.

    Formula based on http://www.bobatkins.com/photography/technical/field_of_view.html

    :param float focalLength: focal length
    :param float frameSize: frame size

.. function:: PerspectiveCamera.setViewOffset ( fullWidth, fullHeight, x, y, width, height )

    Sets an offset in a larger frustum. This is useful for multi-window or
    multi-monitor/multi-machine setups.

    For example, if you have 3x2 monitors and each monitor is 1920x1080 and
    the monitors are in grid like this:

    +---+---+---+
    | A | B | C |
    +---+---+---+
    | D | E | F |
    +---+---+---+

    then for each monitor you would call it like this:

    ::

        var w = 1920;
        var h = 1080;
        var fullWidth = w * 3;
        var fullHeight = h * 2;

        // --A--
        camera.setOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
        //--B--
        camera.setOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
        //--C--
        camera.setOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
        //--D--
        camera.setOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
        //--E--
        camera.setOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
        //--F--
        camera.setOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );

    Note there is no reason monitors have to be the same size or in a grid.

    :param float fullWidth: full width of multi-view setup
    :param float fullHeight: full height of multi-view setup
    :param float x: x-offset of subcamera
    :param float y: y-offset of subcamera
    :param float width: width of subcamera
    :param float height: height of subcamera


.. ...............................................................................
.. rubric:: Example
.. ...............................................................................

::

    var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    scene.add( camera );
