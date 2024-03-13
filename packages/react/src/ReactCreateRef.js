/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow
 */

import type {RefObject} from 'shared/ReactTypes';

// an immutable object with a single mutable value
/**
 * 类组件创建 Ref
 * 创建了一个对象，对象上的 current 属性，用来保存通过 ref 属性获取的 DOM 元素、组件实例、数据等，以便后续使用
 * 保存的数据通过 instance 维护
 * 如果用在函数组件内，那么每次函数组件刷新，都会重新执行 createRef()，即 被初始化重新赋值；但类组件不会重新刷新，所以可以正常使用 createRef
 * @description 
 * @return {*}
 * @example  
 */
export function createRef(): RefObject {
  const refObject = {
    current: null,
  };
  if (__DEV__) {
    Object.seal(refObject);
  }
  return refObject;
}
