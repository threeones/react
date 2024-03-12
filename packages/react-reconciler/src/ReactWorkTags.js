/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export type WorkTag =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25;

/** 函数组件 */
export const FunctionComponent = 0;
/** 类组件 */
export const ClassComponent = 1;
/** 初始化的时候不知道是函数组件还是类组件 */
export const IndeterminateComponent = 2; // Before we know whether it is function or class
/** 根元素，通过 reactDom.render() 产生的根元素 */
export const HostRoot = 3; // Root of a host tree. Could be nested inside another node.
/** ReactDOM.createPortal 产生的 Portal */
export const HostPortal = 4; // A subtree. Could be an entry point to a different renderer.
/** dom 元素，如 <div> */
export const HostComponent = 5;
/** 文本节点，如 <span>这是文本内容</span> 中的 这是文本内容（不包含 <span>） */
export const HostText = 6;
/** <React.Fragment> */
export const Fragment = 7;
/** <React.StrictMode> */
export const Mode = 8;
/** <Context.Consumer> */
export const ContextConsumer = 9;
/** <Context.Provider> */
export const ContextProvider = 10;
/** React.ForwardRef */
export const ForwardRef = 11;
/** <Profiler> */
export const Profiler = 12;
/** <Suspense> */
export const SuspenseComponent = 13;
/** React.memo 返回的组件 */
export const MemoComponent = 14;
/** React.memo 没有制定比较的方法，所返回的组件 */
export const SimpleMemoComponent = 15;
/** <lazy /> */
export const LazyComponent = 16;
export const IncompleteClassComponent = 17;
export const DehydratedFragment = 18;
export const SuspenseListComponent = 19;
export const ScopeComponent = 21;
export const OffscreenComponent = 22;
export const LegacyHiddenComponent = 23;
export const CacheComponent = 24;
export const TracingMarkerComponent = 25;
