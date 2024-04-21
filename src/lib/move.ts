// src/types/index.tsで定義された型をインポートします
import { JsonPatchOperand } from '../types';

// 指定された JSON オブジェクトの値を移動する関数
export function movePatchOperation(object: any, operand: JsonPatchOperand): any {
    const { from, path } = operand;

    if (from === undefined) {
        throw new Error('Move operation must include a from path');
    }

    // 'from' パスの値を取得し、削除する
    const value = getValueAndRemove(object, from);
    // 'path' パスに値をセットする
    setValueAtPath(object, path, value);

    return object; // 変更後のオブジェクトを返す
}

// 指定されたパスの値を取得し、その値を削除する関数
function getValueAndRemove(object: any, path: string): any {
    const keys = path.split('/').slice(1); // パスを`/`で分割し、先頭の空要素を削除
    let current = object;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (i === keys.length - 1) {
            if (!(key in current)) {
                throw new Error(`Property not found: ${key}`);
            }
            const value = current[key];
            if (Array.isArray(current)) {
                current.splice(parseInt(key, 10), 1);
            } else {
                delete current[key];
            }
            return value;
        } else {
            if (!(key in current)) {
                throw new Error(`Path not found: ${path}`);
            }
            current = current[key];
        }
    }
}

// 指定されたパスに値を設定する関数
function setValueAtPath(object: any, path: string, value: any): void {
    const keys = path.split('/').slice(1); // パスを`/`で分割し、先頭の空要素を削除
    let current = object;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (i === keys.length - 1) {
            if (Array.isArray(current)) {
                const index = parseInt(key, 10);
                if (!isNaN(index) && index <= current.length) {
                    current.splice(index, 0, value);
                } else {
                    throw new Error(`Invalid array index: ${key}`);
                }
            } else {
                current[key] = value;
            }
        } else {
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }
    }
    return object; // 変更後のオブジェクトを返す
}