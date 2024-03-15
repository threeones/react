/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as React from 'react';
import is from 'shared/objectIs';

// Intentionally not using named imports because Rollup uses dynamic
// dispatch for CommonJS interop named imports.
const {useState, useEffect, useLayoutEffect, useDebugValue} = React;

let didWarnOld18Alpha = false;
let didWarnUncachedGetSnapshot = false;

// Disclaimer: This shim breaks many of the rules of React, and only works
// because of a very particular set of implementation details and assumptions
// -- change any one of them and it will break. The most important assumption
// is that updates are always synchronous, because concurrent rendering is
// only available in versions of React that also have a built-in
// useSyncExternalStore API. And we only use this shim when the built-in API
// does not exist.
//
// Do not assume that the clever hacks used by this hook also work in general.
// The point of this shim is to replace the need for hacks by other libraries.
/**
 * 渲染前后检查 store 的值是否发生改变，如果发生改变，则更新值。
 * 类似于 useState、useEffect、useLayoutEffect 配合形成的。
 * @description 
 * 1. 通过 getSnapshot 生成快照，保存在 value 中
 * 2. 使用 useState 创建变量 inst，将 value 和 getSnapshot 作为初始化值
 * 3. 分别用 useLayoutEffect 和 useEffect 创建副作用，通过 checkIfSnapshotChanged 检查外部状态管理工具的状态快照是否发生变化，如果变化则通过 forceUpdate 更新状态
 * 4. 通过 useDebugValue 将 value 展示在 React 开发者工具中
 * 这里使用 useLayoutEffect 和 useEffect 可以更好地控制组件的生命周期，避免出现意外
 * @return {*}
 * @example  
 */
export function useSyncExternalStore<T>(
  subscribe: (() => void) => () => void,
  getSnapshot: () => T,
  // Note: The shim does not use getServerSnapshot, because pre-18 versions of
  // React do not expose a way to check if we're hydrating. So users of the shim
  // will need to track that themselves and return the correct value
  // from `getSnapshot`.
  getServerSnapshot?: () => T,
): T {
  if (__DEV__) {
    if (!didWarnOld18Alpha) {
      if (React.startTransition !== undefined) {
        didWarnOld18Alpha = true;
        console.error(
          'You are using an outdated, pre-release alpha of React 18 that ' +
            'does not support useSyncExternalStore. The ' +
            'use-sync-external-store shim will not work correctly. Upgrade ' +
            'to a newer pre-release.',
        );
      }
    }
  }

  // Read the current snapshot from the store on every render. Again, this
  // breaks the rules of React, and only works here because of specific
  // implementation details, most importantly that updates are
  // always synchronous.
  // 生成快照，保存在 value 中
  const value = getSnapshot();
  if (__DEV__) {
    if (!didWarnUncachedGetSnapshot) {
      const cachedValue = getSnapshot();
      if (!is(value, cachedValue)) {
        console.error(
          'The result of getSnapshot should be cached to avoid an infinite loop',
        );
        didWarnUncachedGetSnapshot = true;
      }
    }
  }

  // Because updates are synchronous, we don't queue them. Instead we force a
  // re-render whenever the subscribed state changes by updating an some
  // arbitrary useState hook. Then, during render, we call getSnapshot to read
  // the current value.
  //
  // Because we don't actually use the state returned by the useState hook, we
  // can save a bit of memory by storing other stuff in that slot.
  //
  // To implement the early bailout, we need to track some things on a mutable
  // object. Usually, we would put that in a useRef hook, but we can stash it in
  // our useState hook instead.
  //
  // To force a re-render, we call forceUpdate({inst}). That works because the
  // new object always fails an equality check.
  // 将 value、getSnapshot 作为初始化值
  const [{inst}, forceUpdate] = useState({inst: {value, getSnapshot}});

  // Track the latest getSnapshot function with a ref. This needs to be updated
  // in the layout phase so we can access it during the tearing check that
  // happens on subscribe.
  // 同步执行
  useLayoutEffect(() => {
    inst.value = value;
    inst.getSnapshot = getSnapshot;

    // Whenever getSnapshot or subscribe changes, we need to check in the
    // commit phase if there was an interleaved mutation. In concurrent mode
    // this can happen all the time, but even in synchronous mode, an earlier
    // effect may have mutated the store.
    // 检查状态快照是否变化
    if (checkIfSnapshotChanged(inst)) {
      // Force a re-render.
      // 如果变化则更新状态
      forceUpdate({inst});
    }
  }, [subscribe, value, getSnapshot]);

  // 异步执行
  useEffect(() => {
    // Check for changes right before subscribing. Subsequent changes will be
    // detected in the subscription handler.
    // 检查状态快照是否变化
    if (checkIfSnapshotChanged(inst)) {
      // Force a re-render.
      // 如果变化则更新状态
      forceUpdate({inst});
    }
    const handleStoreChange = () => {
      // TODO: Because there is no cross-renderer API for batching updates, it's
      // up to the consumer of this library to wrap their subscription event
      // with unstable_batchedUpdates. Should we try to detect when this isn't
      // the case and print a warning in development?

      // The store changed. Check if the snapshot changed since the last time we
      // read from the store.
      if (checkIfSnapshotChanged(inst)) {
        // Force a re-render.
        forceUpdate({inst});
      }
    };
    // Subscribe to the store and return a clean-up function.
    // 取消订阅
    return subscribe(handleStoreChange);
  }, [subscribe]);

  // 将 value 展示在 React 开发者工具中
  useDebugValue(value);
  return value;
}

/**
 * 检查 store 是否发生变化
 * @description 
 * @param {*} inst
 * @return {*}
 * @example  
 */
function checkIfSnapshotChanged(inst) {
  const latestGetSnapshot = inst.getSnapshot;
  const prevValue = inst.value;
  try {
    const nextValue = latestGetSnapshot();
    // 浅比较，见 packages/shared/objectIs.js
    return !is(prevValue, nextValue);
  } catch (error) {
    return true;
  }
}
