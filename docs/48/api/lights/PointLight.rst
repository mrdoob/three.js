PointLight - A point light
--------------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: PointLight( hex, intensity, distance )

    A point light

    Part of scene graph

    Inherits from :class:`Light` :class:`Object3D`

    Affects :class:`MeshLambertMaterial` and :class:`MeshPhongMaterial`

    :param integer hex: light color
    :param float intensity: light intensity
    :param float distance: distance affected by light


.. ...............................................................................
.. rubric:: Attributes
.. ...............................................................................

.. attribute:: PointLight.color

    Light :class:`Color`

.. attribute:: PointLight.intensity

    Light intensity

    ``default 1.0``

.. attribute:: PointLight.position

    Position of the light

.. attribute:: PointLight.distance

    If non-zero, light will attenuate linearly from maximum intensity at light ``position`` down to zero at ``distance``


.. ...............................................................................
.. rubric:: Example
.. ...............................................................................

::

    // red point light shining from the front

    var pointLight = new THREE.PointLight( 0xff0000 );
    pointLight.position.set( 0, 0, 10 );
    scene.add( pointLight );
