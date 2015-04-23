// Copyright 2011 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License"); you
// may not use this file except in compliance with the License. You
// may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
// implied. See the License for the specific language governing
// permissions and limitations under the License.

#ifndef WEBGL_LOADER_OPTIMIZE_H_
#define WEBGL_LOADER_OPTIMIZE_H_

#include <math.h>
#include <stdlib.h>
#include <string.h>

#include "base.h"

// TODO: since most vertices are part of 6 faces, you can optimize
// this by using a small inline buffer.
typedef std::vector<int> FaceList;

// Linear-Speed Vertex Cache Optimisation, via:
// http://home.comcast.net/~tom_forsyth/papers/fast_vert_cache_opt.html
class VertexOptimizer {
 public:
  struct TriangleData {
    bool active;  // true iff triangle has not been optimized and emitted.
    // TODO: eliminate some wasted computation by using this cache.
    // float score;
  };

  VertexOptimizer(const QuantizedAttribList& attribs)
      : attribs_(attribs),
        per_vertex_(attribs_.size() / 8),
        next_unused_index_(0)
  {
    // The cache has an extra slot allocated to simplify the logic in
    // InsertIndexToCache.
    for (unsigned int i = 0; i < kCacheSize + 1; ++i) {
      cache_[i] = kUnknownIndex;
    }

    // Initialize per-vertex state.
    for (size_t i = 0; i < per_vertex_.size(); ++i) {
      VertexData& vertex_data = per_vertex_[i];
      vertex_data.cache_tag = kCacheSize;
      vertex_data.output_index = kMaxOutputIndex;
    }
  }

  void AddTriangles(const int* indices, size_t length,
                    WebGLMeshList* meshes) {
    std::vector<TriangleData> per_tri(length / 3);

    // Loop through the triangles, updating vertex->face lists.
    for (size_t i = 0; i < per_tri.size(); ++i) {
      per_tri[i].active = true;
      per_vertex_[indices[3*i + 0]].faces.push_back(i);
      per_vertex_[indices[3*i + 1]].faces.push_back(i);
      per_vertex_[indices[3*i + 2]].faces.push_back(i);
    }

    // TODO: with index bounds, no need to recompute everything.
    // Compute initial vertex scores.
    for (size_t i = 0; i < per_vertex_.size(); ++i) {
      VertexData& vertex_data = per_vertex_[i];
      vertex_data.cache_tag = kCacheSize;
      vertex_data.output_index = kMaxOutputIndex;
      vertex_data.UpdateScore();
    }

    // Prepare output.
    if (meshes->empty()) {
      meshes->push_back(WebGLMesh());
    }
    WebGLMesh* mesh = &meshes->back();

    // Consume indices, one triangle at a time.
    for (size_t c = 0; c < per_tri.size(); ++c) {
      const int best_triangle = FindBestTriangle(indices, per_tri);
      per_tri[best_triangle].active = false;

      // Iterate through triangle indices.
      for (size_t i = 0; i < 3; ++i) {
        const int index = indices[3*best_triangle + i];
        VertexData& vertex_data = per_vertex_[index];
        vertex_data.RemoveFace(best_triangle);
      
        InsertIndexToCache(index);
        const int cached_output_index = per_vertex_[index].output_index;
        // Have we seen this index before?
        if (cached_output_index != kMaxOutputIndex) {
          mesh->indices.push_back(cached_output_index);
          continue;
        }
        // The first time we see an index, not only do we increment
        // next_unused_index_ counter, but we must also copy the
        // corresponding attributes.  TODO: do quantization here?
        per_vertex_[index].output_index = next_unused_index_;
        for (size_t j = 0; j < 8; ++j) {
          mesh->attribs.push_back(attribs_[8*index + j]);
        }
        mesh->indices.push_back(next_unused_index_++);
      }
      // Check if there is room for another triangle.
      if (next_unused_index_ > kMaxOutputIndex - 3) {
        // Is it worth figuring out which other triangles can be added
        // given the verties already added? Then, perhaps
        // re-optimizing?
        next_unused_index_ = 0;
        meshes->push_back(WebGLMesh());
        mesh = &meshes->back();
        for (size_t i = 0; i <= kCacheSize; ++i) {
          cache_[i] = kUnknownIndex;
        }
        for (size_t i = 0; i < per_vertex_.size(); ++i) {
          per_vertex_[i].output_index = kMaxOutputIndex;
        }
      }
    }
  }
 private:
  static const int kUnknownIndex = -1;
  static const uint16 kMaxOutputIndex = 0xD800;
  static const size_t kCacheSize = 32;  // Does larger improve compression?

  struct VertexData {
    // Should this also update scores for incident triangles?
    void UpdateScore() {
      const size_t active_tris = faces.size();
      if (active_tris <= 0) {
        score = -1.f;
        return;
      }
      // TODO: build initial score table.
      if (cache_tag < 3) {
        // The most recent triangle should has a fixed score to
        // discourage generating nothing but really long strips. If we
        // want strips, we should use a different optimizer.
        const float kLastTriScore = 0.75f;
        score = kLastTriScore;
      } else if (cache_tag < kCacheSize) {
        // Points for being recently used.
        const float kScale = 1.f / (kCacheSize - 3);
        const float kCacheDecayPower = 1.5f;
        score = powf(1.f - kScale * (cache_tag - 3), kCacheDecayPower);
      } else {
        // Not in cache.
        score = 0.f;
      }

      // Bonus points for having a low number of tris still to use the
      // vert, so we get rid of lone verts quickly.
      const float kValenceBoostScale = 2.0f;
      const float kValenceBoostPower = 0.5f;
      // rsqrt?
      const float valence_boost = powf(active_tris, -kValenceBoostPower);
      score += valence_boost * kValenceBoostScale;
    }

    // TODO: this assumes that "tri" is in the list!
    void RemoveFace(int tri) {
      FaceList::iterator face = faces.begin();
      while (*face != tri) ++face;
      *face = faces.back();
      faces.pop_back();
    }

    FaceList faces;
    unsigned int cache_tag;  // kCacheSize means not in cache.
    float score;
    uint16 output_index;
  };

  int FindBestTriangle(const int* indices,
                       const std::vector<TriangleData>& per_tri) {
    float best_score = -HUGE_VALF;
    int best_triangle = -1;

    // The trick to making this algorithm run in linear time (with
    // respect to the vertices) is to only scan the triangles incident
    // on the simulated cache for the next triangle. It is an
    // approximation, but the score is heuristic. Anyway, most of the
    // time the best triangle will be found this way.
    for (size_t i = 0; i < kCacheSize; ++i) {
      if (cache_[i] == kUnknownIndex) {
        break;
      }
      const VertexData& vertex_data = per_vertex_[cache_[i]];
      for (size_t j = 0; j < vertex_data.faces.size(); ++j) {
        const int tri_index = vertex_data.faces[j];
        if (per_tri[tri_index].active) {
          const float score =
              per_vertex_[indices[3*tri_index + 0]].score +
              per_vertex_[indices[3*tri_index + 1]].score +
              per_vertex_[indices[3*tri_index + 2]].score;
          if (score > best_score) {
            best_score = score;
            best_triangle = tri_index;
          }
        }
      }
    }
    // TODO: keep a range of active triangles to make the slow scan a
    // little faster. Does this ever happen?
    if (best_triangle == -1) {
      // If no triangles can be found through the cache (e.g. for the
      // first triangle) go through all the active triangles and find
      // the best one.
      for (size_t i = 0; i < per_tri.size(); ++i) {
        if (per_tri[i].active) {
          const float score =
              per_vertex_[indices[3*i + 0]].score +
              per_vertex_[indices[3*i + 1]].score +
              per_vertex_[indices[3*i + 2]].score;
          if (score > best_score) {
            best_score = score;
            best_triangle = i;
          }
        }
      }
      CHECK(-1 != best_triangle);
    }
    return best_triangle;
  }

  // TODO: faster to update an entire triangle.
  // This also updates the vertex scores!
  void InsertIndexToCache(int index) {
    // Find how recently the vertex was used.
    const unsigned int cache_tag = per_vertex_[index].cache_tag;

    // Don't do anything if the vertex is already at the head of the
    // LRU list.
    if (cache_tag == 0) return;

    // Loop through the cache, inserting the index at the front, and
    // bubbling down to where the index was originally found. If the
    // index was not originally in the cache, then it claims to be at
    // the (kCacheSize + 1)th entry, and we use an extra slot to make
    // that case simpler.
    int to_insert = index;
    for (unsigned int i = 0; i <= cache_tag; ++i) {
      const int current_index = cache_[i];

      // Update cross references between the entry of the cache and
      // the per-vertex data.
      cache_[i] = to_insert;
      per_vertex_[to_insert].cache_tag = i;
      per_vertex_[to_insert].UpdateScore();
      
      // No need to continue if we find an empty entry.
      if (current_index == kUnknownIndex) {
        break;
      }
      
      to_insert = current_index;
    }
  }

  const QuantizedAttribList& attribs_;
  std::vector<VertexData> per_vertex_;
  int cache_[kCacheSize + 1];
  uint16 next_unused_index_;
};

#endif  // WEBGL_LOADER_OPTIMIZE_H_
