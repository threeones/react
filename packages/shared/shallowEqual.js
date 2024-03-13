/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import is from './objectIs';
import hasOwnProperty from './hasOwnProperty';

/**
 * 浅比较，流程：
 * 1. 比较新旧 props/state 是否相等，如果相等，返回 true，不更新组件
 * 2. 判断新旧 props/state 是否为对象，如果不是对象或者为 null，则返回 false，更新组件
 * 3. 将新旧 props/state 通过 Object.keys 转为键数组，如果不相等，说明有新增或减少，返回 false，更新组件
 * 4. 遍历 Object.keys 的键数组（浅比较），如果不同，则返回 false，更新组件
 * 
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 * 通过迭代对象上的键并在任何键的值在参数之间不严格相等时返回false来执行相等。
 * 当所有键的值都严格相等时，返回true。
 */
function shallowEqual(objA: mixed, objB: mixed): boolean {
  // 和 useEffect 源码中的 areHookInputsEqual 的 is 一致
  if (is(objA, objB)) {
    return true;
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    const currentKey = keysA[i];
    if (
      !hasOwnProperty.call(objB, currentKey) ||
      !is(objA[currentKey], objB[currentKey])
    ) {
      return false;
    }
  }

  return true;
}

export default shallowEqual;
