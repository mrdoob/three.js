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

#ifndef WEBGL_LOADER_UTF8_H_
#define WEBGL_LOADER_UTF8_H_

#include "base.h"
#include "stream.h"

namespace webgl_loader {

const uint8 kUtf8MoreBytesPrefix = 0x80;
const uint8 kUtf8TwoBytePrefix = 0xC0;
const uint8 kUtf8ThreeBytePrefix = 0xE0;

const uint16 kUtf8TwoByteLimit = 0x0800;
const uint16 kUtf8SurrogatePairStart = 0xD800;
const uint16 kUtf8SurrogatePairNum = 0x0800;
const uint16 kUtf8EncodableEnd = 0x10000 - kUtf8SurrogatePairNum;

const uint16 kUtf8MoreBytesMask = 0x3F;

bool Uint16ToUtf8(uint16 word, ByteSinkInterface* sink) {
  if (word < 0x80) {
    sink->Put(static_cast<char>(word));
  } else if (word < kUtf8TwoByteLimit) {
    sink->Put(static_cast<char>(kUtf8TwoBytePrefix + (word >> 6)));
    sink->Put(static_cast<char>(kUtf8MoreBytesPrefix +
				(word & kUtf8MoreBytesMask)));
  } else if (word < kUtf8EncodableEnd) {
    // We can only encode 65535 - 2048 values because of illegal UTF-8
    // characters, such as surrogate pairs in [0xD800, 0xDFFF].
    if (word >= kUtf8SurrogatePairStart) {
      // Shift the result to avoid the surrogate pair range.
      word += kUtf8SurrogatePairNum;
    }
    sink->Put(static_cast<char>(kUtf8ThreeBytePrefix + (word >> 12)));
    sink->Put(static_cast<char>(kUtf8MoreBytesPrefix +
				((word >> 6) & kUtf8MoreBytesMask)));
    sink->Put(static_cast<char>(kUtf8MoreBytesPrefix +
				(word & kUtf8MoreBytesMask)));
  } else {
    return false;
  }
  return true;
}

}  // namespace webgl_loader

#endif  // WEBGL_LOADER_UTF8_H_
