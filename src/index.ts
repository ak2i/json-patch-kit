// エントリポイントでは、各オペランドの関数をエクスポートします。
export { addPatchOperation } from './lib/add';
export { replacePatchOperation } from './lib/replace';
export { removePatchOperation } from './lib/remove';
export { movePatchOperation } from './lib/move';
export { copyPatchOperation } from './lib/copy';
export { testPatchOperation } from './lib/test';
export { applyPatch } from './lib/patch';
export { makeDiff } from './lib/diff';
// このファイルをエクスポートして、他のモジュールで利用できるようにします
export * from './types';
