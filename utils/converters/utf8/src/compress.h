// Copyright 2012 Google Inc. All Rights Reserved.
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

#ifndef WEBGL_LOADER_COMPRESS_H_
#define WEBGL_LOADER_COMPRESS_H_

#include <math.h>

#include "base.h"
#include "bounds.h"
#include "stream.h"
#include "utf8.h"

namespace webgl_loader {

void AttribsToQuantizedAttribs(const AttribList& interleaved_attribs,
                               const BoundsParams& bounds_params,
                               QuantizedAttribList* quantized_attribs) {
  quantized_attribs->resize(interleaved_attribs.size());
  for (size_t i = 0; i < interleaved_attribs.size(); i += 8) {
    for (size_t j = 0; j < 8; ++j) {
      quantized_attribs->at(i + j) = Quantize(interleaved_attribs[i + j],
                                              bounds_params.mins[j],
                                              bounds_params.scales[j],
                                              bounds_params.outputMaxes[j]);
    }
  }
}

uint16 ZigZag(int16 word) {
  return (word >> 15) ^ (word << 1);
}

void CompressAABBToUtf8(const Bounds& bounds,
                        const BoundsParams& total_bounds,
                        ByteSinkInterface* utf8) {
  const int maxPosition = (1 << 14) - 1;  // 16383;
  uint16 mins[3] = { 0 };
  uint16 maxes[3] = { 0 };
  for (int i = 0; i < 3; ++i) {
    float total_min = total_bounds.mins[i];
    float total_scale = total_bounds.scales[i];
    mins[i] = Quantize(bounds.mins[i], total_min, total_scale, maxPosition);
    maxes[i] = Quantize(bounds.maxes[i], total_min, total_scale, maxPosition);
  }
  for (int i = 0; i < 3; ++i) {
    Uint16ToUtf8(mins[i], utf8);
  }
  for (int i = 0; i < 3; ++i) {
    Uint16ToUtf8(maxes[i] - mins[i], utf8);
  }
}

void CompressIndicesToUtf8(const OptimizedIndexList& list,
                           ByteSinkInterface* utf8) {
  // For indices, we don't do delta from the most recent index, but
  // from the high water mark. The assumption is that the high water
  // mark only ever moves by one at a time. Foruntately, the vertex
  // optimizer does that for us, to optimize for per-transform vertex
  // fetch order.
  uint16 index_high_water_mark = 0;
  for (size_t i = 0; i < list.size(); ++i) {
    const int index = list[i];
    CHECK(index >= 0);
    CHECK(index <= index_high_water_mark);
    CHECK(Uint16ToUtf8(index_high_water_mark - index, utf8));
    if (index == index_high_water_mark) {
      ++index_high_water_mark;
    }
  }
}

void CompressQuantizedAttribsToUtf8(const QuantizedAttribList& attribs,
                                    ByteSinkInterface* utf8) {
  for (size_t i = 0; i < 8; ++i) {
    // Use a transposed representation, and delta compression.
    uint16 prev = 0;
    for (size_t j = i; j < attribs.size(); j += 8) {
      const uint16 word = attribs[j];
      const uint16 za = ZigZag(static_cast<int16>(word - prev));
      prev = word;
      CHECK(Uint16ToUtf8(za, utf8));
    }
  }
}

class EdgeCachingCompressor {
 public:
  // Assuming that the vertex cache optimizer LRU is 32 vertices, we
  // expect ~64 triangles, and ~96 edges.
  static const size_t kMaxLruSize = 96;
  static const int kLruSentinel = -1;

  EdgeCachingCompressor(const QuantizedAttribList& attribs,
                        OptimizedIndexList& indices)
      : attribs_(attribs),
        indices_(indices),
        deltas_(attribs.size()),
        index_high_water_mark_(0),
        lru_size_(0) {
    memset(last_attrib_, 0, sizeof(last_attrib_));
  }

  // Work in progress. Does not remotely work.
  void CompressWithLRU(ByteSinkInterface* utf8) {
    size_t match_indices[3];
    size_t match_winding[3];
    for (size_t i = 0; i < indices_.size(); i += 3) {
      const uint16* triangle = &indices_[i];
      // Try to find edge matches to cheaply encode indices and employ
      // parallelogram prediction.
      const size_t num_matches = LruEdge(triangle,
                                         match_indices, match_winding);
      switch (num_matches) {
        case 0: 
          LruEdgeZero(triangle);
          // No edges match, so use simple predictor.
          continue;
        case 1: 
          LruEdgeOne(triangle[match_winding[1]], 
                     triangle[match_winding[2]], match_indices[0]);
          break;
        case 2: 
          LruEdgeTwo(triangle[match_winding[2]], 
                     match_indices[0], match_indices[1]); 
          break;
        case 3: 
          LruEdgeThree(match_indices[0], match_indices[1], match_indices[2]);
          break;
        default:
          DumpDebug();
          CHECK(false);
      }
    }
  }

  // Instead of using an LRU cache of edges, simply scan the history
  // for matching edges.
  void Compress(ByteSinkInterface* utf8) {
    // TODO: do this pre-quantization.
    // Normal prediction.
    const size_t num_attribs = attribs_.size() / 8;
    std::vector<int> crosses(3 * num_attribs);
    for (size_t i = 0; i < indices_.size(); i += 3) {
      // Compute face cross products.
      const uint16 i0 = indices_[i + 0];
      const uint16 i1 = indices_[i + 1];
      const uint16 i2 = indices_[i + 2];
      int e1[3], e2[3], cross[3];
      e1[0] = attribs_[8*i1 + 0] - attribs_[8*i0 + 0];
      e1[1] = attribs_[8*i1 + 1] - attribs_[8*i0 + 1];
      e1[2] = attribs_[8*i1 + 2] - attribs_[8*i0 + 2];
      e2[0] = attribs_[8*i2 + 0] - attribs_[8*i0 + 0];
      e2[1] = attribs_[8*i2 + 1] - attribs_[8*i0 + 1];
      e2[2] = attribs_[8*i2 + 2] - attribs_[8*i0 + 2];
      cross[0] = e1[1] * e2[2] - e1[2] * e2[1];
      cross[1] = e1[2] * e2[0] - e1[0] * e2[2];
      cross[2] = e1[0] * e2[1] - e1[1] * e2[0];
      // Accumulate face cross product into each vertex.
      for (size_t j = 0; j < 3; ++j) {
        crosses[3*i0 + j] += cross[j];
        crosses[3*i1 + j] += cross[j];
        crosses[3*i2 + j] += cross[j];
      }
    }
    // Compute normal residues.
    for (size_t idx = 0; idx < num_attribs; ++idx) {
      float pnx = crosses[3*idx + 0];
      float pny = crosses[3*idx + 1];
      float pnz = crosses[3*idx + 2];
      const float pnorm = 511.0 / sqrt(pnx*pnx + pny*pny + pnz*pnz);
      pnx *= pnorm;
      pny *= pnorm;
      pnz *= pnorm;

      float nx = attribs_[8*idx + 5] - 511;
      float ny = attribs_[8*idx + 6] - 511;
      float nz = attribs_[8*idx + 7] - 511;
      const float norm = 511.0 / sqrt(nx*nx + ny*ny + nz*nz);
      nx *= norm;
      ny *= norm;
      nz *= norm;

      const uint16 dx = ZigZag(nx - pnx);
      const uint16 dy = ZigZag(ny - pny);
      const uint16 dz = ZigZag(nz - pnz);

      deltas_[5*num_attribs + idx] = dx;
      deltas_[6*num_attribs + idx] = dy;
      deltas_[7*num_attribs + idx] = dz;
    }
    for (size_t triangle_start_index = 0; 
         triangle_start_index < indices_.size(); triangle_start_index += 3) {
      const uint16 i0 = indices_[triangle_start_index + 0];
      const uint16 i1 = indices_[triangle_start_index + 1];
      const uint16 i2 = indices_[triangle_start_index + 2];
      // To force simple compression, set |max_backref| to 0 here
      // and in loader.js.
      // |max_backref| should be configurable and communicated.
      const uint16 max_backref = triangle_start_index < kMaxLruSize ?
          triangle_start_index : kMaxLruSize;
      // Scan the index list for matching edges.
      uint16 backref = 0;
      for (; backref < max_backref; backref += 3) {
        const size_t candidate_start_index = triangle_start_index - backref;
        const uint16 j0 = indices_[candidate_start_index + 0];
        const uint16 j1 = indices_[candidate_start_index + 1];
        const uint16 j2 = indices_[candidate_start_index + 2];
        // Compare input and candidate triangle edges in a
        // winding-sensitive order. Matching edges must reference
        // vertices in opposite order, and the first check sees if the
        // triangles are in strip order. If necessary, re-order the
        // triangle in |indices_| so that the matching edge appears
        // first.
        if (j1 == i1 && j2 == i0) {
          ParallelogramPredictor(backref, j0, triangle_start_index);
          break;
        } else if (j1 == i0 && j2 == i2) {
          indices_[triangle_start_index + 0] = i2;
          indices_[triangle_start_index + 1] = i0;
          indices_[triangle_start_index + 2] = i1;
          ParallelogramPredictor(backref, j0, triangle_start_index);
          break;
        } else if (j1 == i2 && j2 == i1) {
          indices_[triangle_start_index + 0] = i1;
          indices_[triangle_start_index + 1] = i2;
          indices_[triangle_start_index + 2] = i0;
          ParallelogramPredictor(backref, j0, triangle_start_index);
          break;
        } else if (j2 == i1 && j0 == i0) {
          ParallelogramPredictor(backref + 1, j1, triangle_start_index);
          break;
        } else if (j2 == i0 && j0 == i2) {
          indices_[triangle_start_index + 0] = i2;
          indices_[triangle_start_index + 1] = i0;
          indices_[triangle_start_index + 2] = i1;
          ParallelogramPredictor(backref + 1, j1, triangle_start_index);
          break;
        } else if (j2 == i2 && j0 == i1) {
          indices_[triangle_start_index + 0] = i1;
          indices_[triangle_start_index + 1] = i2;
          indices_[triangle_start_index + 2] = i0;
          ParallelogramPredictor(backref + 1, j1, triangle_start_index);
          break;
        } else if (j0 == i1 && j1 == i0) {
          ParallelogramPredictor(backref + 2, j2, triangle_start_index);
          break;
        } else if (j0 == i0 && j1 == i2) {
          indices_[triangle_start_index + 0] = i2;
          indices_[triangle_start_index + 1] = i0;
          indices_[triangle_start_index + 2] = i1;
          ParallelogramPredictor(backref + 2, j2, triangle_start_index);
          break;
        } else if (j0 == i2 && j1 == i1) {
          indices_[triangle_start_index + 0] = i1;
          indices_[triangle_start_index + 1] = i2;
          indices_[triangle_start_index + 2] = i0;
          ParallelogramPredictor(backref + 2, j2, triangle_start_index);
          break;
        }
      }
      if (backref == max_backref) {
        SimplePredictor(max_backref, triangle_start_index);
      }
    }
    // Emit as UTF-8.
    for (size_t i = 0; i < deltas_.size(); ++i) {
      if (!Uint16ToUtf8(deltas_[i], utf8)) {
        // TODO: bounds-dependent texcoords are still busted :(
        Uint16ToUtf8(0, utf8);
      }
    }
    for (size_t i = 0; i < codes_.size(); ++i) {
      CHECK(Uint16ToUtf8(codes_[i], utf8));
    }
  }

  const QuantizedAttribList& deltas() const { return deltas_; }

  const OptimizedIndexList& codes() const { return codes_; }

  void DumpDebug(FILE* fp = stdout) {
    for (size_t i = 0; i < lru_size_; ++i) {
      fprintf(fp, PRIuS ": %d\n", i, edge_lru_[i]);
    }
  }

 private:
  // The simple predictor is slightly (maybe 5%) more effective than
  // |CompressQuantizedAttribsToUtf8|. Instead of delta encoding in
  // attribute order, we use the last referenced attribute as the
  // predictor.
  void SimplePredictor(size_t max_backref, size_t triangle_start_index) {
    const uint16 i0 = indices_[triangle_start_index + 0];
    const uint16 i1 = indices_[triangle_start_index + 1];
    const uint16 i2 = indices_[triangle_start_index + 2];
    if (HighWaterMark(i0, max_backref)) {
      // Would it be faster to do the dumb delta, in this case?
      EncodeDeltaAttrib(i0, last_attrib_);
    }
    if (HighWaterMark(i1)) {
      EncodeDeltaAttrib(i1, &attribs_[8*i0]);
    }
    if (HighWaterMark(i2)) {
      // We get a little frisky with the third vertex in the triangle.
      // Instead of simply using the previous vertex, use the average
      // of the first two.
      for (size_t j = 0; j < 8; ++j) {
        int average = attribs_[8*i0 + j];
        average += attribs_[8*i1 + j];
        average /= 2;
        last_attrib_[j] = average;
      }
      EncodeDeltaAttrib(i2, last_attrib_);
      // The above doesn't add much. Consider the simpler:
      // EncodeDeltaAttrib(i2, &attribs_[8*i1]);
    }
  }

  void EncodeDeltaAttrib(size_t index, const uint16* predicted) {
    const size_t num_attribs = attribs_.size() / 8;
    for (size_t i = 0; i < 5; ++i) {
      const int delta = attribs_[8*index + i] - predicted[i];
      const uint16 code = ZigZag(delta);
      deltas_[num_attribs*i + index] = code;
    }
    UpdateLastAttrib(index);
  }

  void ParallelogramPredictor(uint16 backref_edge,
                              size_t backref_vert,
                              size_t triangle_start_index) {
    codes_.push_back(backref_edge);  // Encoding matching edge.
    const uint16 i2 = indices_[triangle_start_index + 2];
    if (HighWaterMark(i2)) {  // Encode third vertex.
      // Parallelogram prediction for the new vertex.
      const uint16 i0 = indices_[triangle_start_index + 0];
      const uint16 i1 = indices_[triangle_start_index + 1];
      const size_t num_attribs = attribs_.size() / 8;
      for (size_t j = 0; j < 5; ++j) {
        const uint16 orig = attribs_[8*i2 + j]; 
        int delta = attribs_[8*i0 + j];
        delta += attribs_[8*i1 + j];
        delta -= attribs_[8*backref_vert + j];
        last_attrib_[j] = orig;
        const uint16 code = ZigZag(orig - delta);
        deltas_[num_attribs*j + i2] = code;
      }
    }
  }

  // Returns |true| if |index_high_water_mark_| is incremented, otherwise
  // returns |false| and automatically updates |last_attrib_|. 
  bool HighWaterMark(uint16 index, uint16 start_code = 0) {
    codes_.push_back(index_high_water_mark_ - index + start_code);
    if (index == index_high_water_mark_) {
      ++index_high_water_mark_;
      return true;
    } else {
      UpdateLastAttrib(index);
    }
    return false;
  }

  void UpdateLastAttrib(uint16 index) {
    for (size_t i = 0; i < 8; ++i) {
      last_attrib_[i] = attribs_[8*index + i];
    }
  }

  // Find edge matches of |triangle| referenced in |edge_lru_|
  // |match_indices| stores where the matches occur in |edge_lru_|
  // |match_winding| stores where the matches occur in |triangle|
  size_t LruEdge(const uint16* triangle,
                 size_t* match_indices,
                 size_t* match_winding) {
    const uint16 i0 = triangle[0];
    const uint16 i1 = triangle[1];
    const uint16 i2 = triangle[2];
    // The primary thing is to find the first matching edge, if
    // any. If we assume that our mesh is mostly manifold, then each
    // edge is shared by at most two triangles (with the indices in
    // opposite order), so we actually want to eventually remove all
    // matching edges. However, this means we have to continue
    // scanning the array to find all matching edges, not just the
    // first. The edges that don't match will then pushed to the
    // front.
    size_t num_matches = 0;
    for (size_t i = 0; i < lru_size_ && num_matches < 3; ++i) {
      const int edge_index = edge_lru_[i];
      // |winding| is a tricky detail used to dereference the edge to
      // yield |e0| and |e1|, since we must handle the edge that wraps
      // the last and first vertex. For now, just implement this in a
      // straightforward way using a switch, but since this code would
      // actually also need to run in the decompressor, we must
      // optimize it.
      const int winding = edge_index % 3;
      uint16 e0, e1;
      switch (winding) {
        case 0:
          e0 = indices_[edge_index + 1];
          e1 = indices_[edge_index + 2];
          break;
        case 1:
          e0 = indices_[edge_index + 2];
          e1 = indices_[edge_index];
          break;
        case 2:
          e0 = indices_[edge_index];
          e1 = indices_[edge_index + 1];
          break;
        default:
          DumpDebug();
          CHECK(false);
      }

      // Check each edge of the input triangle against |e0| and
      // |e1|. Note that we reverse the winding of the input triangle.
      // TODO: does this properly handle degenerate input?
      if (e0 == i1 && e1 == i0) {
        match_winding[num_matches] = 2;
        match_indices[++num_matches] = i;
      } else if (e0 == i2 && e1 == i1) {
        match_winding[num_matches] = 0;
        match_indices[++num_matches] = i;
      } else if (e0 == i0 && e1 == i2) {
        match_winding[num_matches] = 1;
        match_indices[++num_matches] = i;
      }
    }
    switch (num_matches) {
      case 1:
        match_winding[1] = (match_winding[0] + 1) % 3;  // Fall through.
      case 2:
        match_winding[2] = 3 - match_winding[1] - match_winding[0];
      default: ;  // Do nothing.
    }
    return num_matches;
  }

  // If no edges were found in |triangle|, then simply push the edges
  // onto |edge_lru_|.
  void LruEdgeZero(const uint16* triangle) {
    // Shift |edge_lru_| by three elements. Note that the |edge_lru_|
    // array has at least three extra elements to make this simple.
    lru_size_ += 3;
    if (lru_size_ > kMaxLruSize) lru_size_ = kMaxLruSize;
    memmove(edge_lru_ + 3, edge_lru_, lru_size_ * sizeof(int));
    // Push |triangle| to front of |edge_lru_|
    edge_lru_[0] = triangle[0];
    edge_lru_[1] = triangle[1];
    edge_lru_[2] = triangle[2];
  }

  // Remove one edge and add two.
  void LruEdgeOne(size_t i0, size_t i1, size_t match_index) {
    CHECK(match_index < lru_size_);
    // Shift |edge_lru_| by one element, starting with |match_index| + 1.
    memmove(edge_lru_ + match_index + 2, edge_lru_ + match_index + 1,
            (lru_size_ - match_index) * sizeof(int));
    // Shift |edge_lru_| by two elements until reaching |match_index|.
    memmove(edge_lru_ + 2, edge_lru_, match_index * sizeof(int));
    edge_lru_[0] = i0;
    edge_lru_[1] = i1;
  }

  // Remove two edges and add one.
  void LruEdgeTwo(int i0, size_t match_index0, size_t match_index1) {
    CHECK(match_index0 < lru_size_);
    CHECK(match_index1 < lru_size_);

    // memmove 1
    // memmove 2
    edge_lru_[0] = i0;
  }

  // All edges were found, so just remove them from |edge_lru_|.
  void LruEdgeThree(size_t match_index0, 
                    size_t match_index1, 
                    size_t match_index2) {
    const size_t shift_two = match_index1 - 1;
    for (size_t i = match_index0; i < shift_two; ++i) {
      edge_lru_[i] = edge_lru_[i + 1];
    }
    const size_t shift_three = match_index2 - 2;
    for (size_t i = shift_two; i < shift_three; ++i) {
      edge_lru_[i] = edge_lru_[i + 2];
    }
    lru_size_ -= 3;
    for (size_t i = shift_three; i < lru_size_; ++i) {
      edge_lru_[i] = edge_lru_[i + 3];
    }
  }

  // |attribs_| and |indices_| is the input mesh.
  const QuantizedAttribList& attribs_;
  // |indices_| are non-const because |Compress| may update triangle
  // winding order.
  OptimizedIndexList& indices_;
  // |deltas_| contains the compressed attributes. They can be
  // compressed in one of two ways:
  // (1) with parallelogram prediction, compared with the predicted vertex,
  // (2) otherwise, compared with the last referenced vertex.
  // Note that even (2) is different and probably better than what
  // |CompressQuantizedAttribsToutf8| does, which is comparing with
  // the last encoded vertex.
  QuantizedAttribList deltas_;
  // |codes_| contains the compressed indices. Small values encode an
  // edge match; that is, the first edge of the next triangle matches
  // a recently-seen edge.
  OptimizedIndexList codes_; 
  // |index_high_water_mark_| is used as it is in |CompressIndicesToUtf8|.
  uint16 index_high_water_mark_;
  // |last_attrib_referenced_| is the index of the last referenced
  // attribute. This is used to delta encode attributes when no edge match
  // is found.
  uint16 last_attrib_[8];
  size_t lru_size_;
  // |edge_lru_| contains the LRU lits of edge references. It stores
  // indices to the input |indices_|. By convention, an edge points to
  // the vertex opposite the edge in question. We pad the array by a
  // triangle to simplify edge cases.
  int edge_lru_[kMaxLruSize + 3];
};

}  // namespace webgl_loader

#endif  // WEBGL_LOADER_COMPRESS_H_
