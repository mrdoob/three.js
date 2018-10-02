// instanced
#ifdef INSTANCED
    attribute vec3 instanceOffset;
    attribute float instanceScale;
#endif
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
    #include <uv_vertex>
    #include <skinbase_vertex>
    #ifdef USE_DISPLACEMENTMAP
        #include <beginnormal_vertex>
        #include <morphnormal_vertex>
        #include <skinnormal_vertex>
    #endif
    #include <begin_vertex>
    // instanced
    #ifdef INSTANCED
        transformed *= instanceScale;
        transformed = transformed + instanceOffset;
    #endif
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <displacementmap_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
}