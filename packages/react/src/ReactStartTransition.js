/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
import type {StartTransitionOptions} from 'shared/ReactTypes';

import ReactCurrentBatchConfig from './ReactCurrentBatchConfig';
import {enableTransitionTracing} from 'shared/ReactFeatureFlags';

/**
 * 没有 isPending 逻辑，直接导致 startTransition 不具备防抖效果
 * 在 Concurrent 模式下，低优先级更新（列表渲染）会被高优先级中断（输入框），此时，低优先级更新已经开始的协调会被清除，并且会被重置为未开始状态。
 * 当贝充值后，导致 transition 更新只有在用户停止输入（或超过5s）时才会有效的处理。
 * 设置 isPending = true，可以形成中断，类似防抖的作用。
 * @description 
 * @return {*}
 * @example  
 */
export function startTransition(
  scope: () => void,
  options?: StartTransitionOptions,
) {
  const prevTransition = ReactCurrentBatchConfig.transition;
  // 设置状态
  ReactCurrentBatchConfig.transition = {};
  const currentTransition = ReactCurrentBatchConfig.transition;

  if (__DEV__) {
    ReactCurrentBatchConfig.transition._updatedFibers = new Set();
  }

  if (enableTransitionTracing) {
    if (options !== undefined && options.name !== undefined) {
      ReactCurrentBatchConfig.transition.name = options.name;
      ReactCurrentBatchConfig.transition.startTime = -1;
    }
  }

  try {
    // 执行更新
    scope();
  } finally {
    // 恢复原来的状态
    ReactCurrentBatchConfig.transition = prevTransition;

    if (__DEV__) {
      if (prevTransition === null && currentTransition._updatedFibers) {
        const updatedFibersCount = currentTransition._updatedFibers.size;
        if (updatedFibersCount > 10) {
          console.warn(
            'Detected a large number of updates inside startTransition. ' +
              'If this is due to a subscription please re-write it to use React provided hooks. ' +
              'Otherwise concurrent mode guarantees are off the table.',
          );
        }
        currentTransition._updatedFibers.clear();
      }
    }
  }
}
