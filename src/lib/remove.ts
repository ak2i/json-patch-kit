// src/types/index.tsで定義された型をインポートします
import { JsonPatchOperand } from '../types';

// 指定されたJSONオブジェクトのパスにある値を削除する関数
export function removePatchOperation(object: any, operand: JsonPatchOperand): any {
    const { path } = operand;
    const keys = path.split('/').slice(1); // パスを`/`で分割し、先頭の空要素を削除
    let current = object;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current)) {
            throw new Error(`Path not found: ${path}`);
        }
        current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    if (Array.isArray(current)) {
        // 配列から要素を削除
        const index = parseInt(lastKey, 10);
        if (isNaN(index)) {
            throw new Error(`Invalid array index: ${lastKey}`);
        }
        current.splice(index, 1);
    } else {
        // オブジェクトからプロパティを削除
        if (!(lastKey in current)) {
            throw new Error(`Property not found: ${lastKey}`);
        }
        delete current[lastKey];
    }

    return object; // 変更後のオブジェクトを返す
}
