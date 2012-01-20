OrthographicCamera - Camera with orthographic projection
------------------------------------------------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: OrthographicCamera( left, right, top, bottom, near, far )

    Camera with orthographic projection

    Part of scene graph

    Inherits from :class:`Object3D` :class:`Camera`

    :param float left: left
    :param float right: right
    :param float top: top
    :param float bottom: bottom
    :param float near: near
    :param float far: far


.. ...............................................................................
.. rubric:: Attributes
.. ...............................................................................

.. attribute:: OrthographicCamera.left

    Camera frustum left plane

.. attribute:: OrthographicCamera.right

    Camera frustum right plane

.. attribute:: OrthographicCamera.top

    Camera frustum top plane

.. attribute:: OrthographicCamera.bottom

    Camera frustum bottom plane

.. attribute:: OrthographicCamera.near

    Camera frustum near plane

.. attribute:: OrthographicCamera.far

    Camera frustum far plane


.. ...............................................................................
.. rubric:: Method
.. ...............................................................................

.. function:: OrthographicCamera.updateProjectionMatrix()

    Updates camera's projection matrix. Must be called after change of parameters.


.. ...............................................................................
.. rubric:: Example
.. ...............................................................................

::

    var camera = new THREE.OrthographicCamera(  window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
    scene.add( camera );
