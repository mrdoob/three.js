AmbientLight - An ambient light
-------------------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: AmbientLight( hex )

    An ambient light

    Inherits from :class:`Light` :class:`Object3D`

    Affects :class:`MeshLambertMaterial` and :class:`MeshPhongMaterial`

    :param integer hex: light color


.. ...............................................................................
.. rubric:: Attributes
.. ...............................................................................

.. attribute:: AmbientLight.color

    Light :class:`Color`

    Material's ambient color gets multiplied by this color.


.. ...............................................................................
.. rubric:: Example
.. ...............................................................................

::

    var ambientLight = new THREE.AmbientLight( 0x333333 );
    scene.add( ambientLight );
