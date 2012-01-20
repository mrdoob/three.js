DirectionalLight - A directional light
--------------------------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: DirectionalLight( hex, intensity, distance )

    A directional light

    Part of scene graph

    Inherits from :class:`Light` :class:`Object3D`

    Affects :class:`MeshLambertMaterial` and :class:`MeshPhongMaterial`

    :param integer hex: light color
    :param float intensity: light intensity
    :param float distance: distance affected by light


.. ...............................................................................
.. rubric:: Attributes
.. ...............................................................................

.. attribute:: DirectionalLight.color

    Light :class:`Color`

.. attribute:: DirectionalLight.intensity

    Light intensity

    ``default 1.0``

.. attribute:: DirectionalLight.position

    Direction of the light is normalized vector from ``position`` to ``(0,0,0)``.

.. attribute:: DirectionalLight.distance

    Modulating directional light by distance not implemented in :class:`WebGLRenderer`


.. ...............................................................................
.. rubric:: Shadow attributes
.. ...............................................................................

.. attribute:: DirectionalLight.castShadow

    If set to `true` light will cast dynamic shadows

    Warning: this is expensive and requires tweaking to get shadows looking right.

    ``default false``

.. attribute:: DirectionalLight.onlyShadow

    If set to `true` light will only cast shadow but not contribute any lighting (as if intensity was 0 but cheaper to compute)

    ``default false``

.. attribute:: DirectionalLight.target

    :class:`Object3D` target used for shadow camera orientation

.. attribute:: DirectionalLight.shadowCameraNear

    Orthographic shadow camera frustum parameter

    ``default 50``

.. attribute:: DirectionalLight.shadowCameraFar

    Orthographic shadow camera frustum parameter

    ``default 5000``

.. attribute:: DirectionalLight.shadowCameraLeft

    Orthographic shadow camera frustum parameter

    ``default -500``

.. attribute:: DirectionalLight.shadowCameraRight

    Orthographic shadow camera frustum parameter

    ``default 500``

.. attribute:: DirectionalLight.shadowCameraTop

    Orthographic shadow camera frustum parameter

    ``default 500``

.. attribute:: DirectionalLight.shadowCameraBottom

    Orthographic shadow camera frustum parameter

    ``default -500``

.. attribute:: DirectionalLight.shadowCameraVisible

    Show debug shadow camera frustum

    ``default false``

.. attribute:: DirectionalLight.shadowBias

    Shadow map bias

    ``default 0``

.. attribute:: DirectionalLight.shadowDarkness

    Darkness of shadow casted by this light (``float`` from 0 to 1)

    ``default 0.5``

.. attribute:: DirectionalLight.shadowMapWidth

    Shadow map texture width in pixels

    ``default 512``

.. attribute:: DirectionalLight.shadowMapHeight

    Shadow map texture height in pixels

    ``default 512``


.. ...............................................................................
.. rubric:: Example
.. ...............................................................................

::

    // white directional light at half intensity shining from the top

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set( 0, 1, 0 );
    scene.add( directionalLight );
