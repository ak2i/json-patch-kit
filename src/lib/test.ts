// src/types/index.tsで定義された型をインポートします
import { JsonPatchOperand } from '../types';

// 指定された JSON オブジェクトのパスにある値が期待した値と一致するかテストする関数
export function testPatchOperation(object: any, operand: JsonPatchOperand): boolean {
    const { path, value } = operand;

    // 指定されたパスから値を取得する
    const actualValue = getValueAtPath(object, path);

    // 値を比較して、一致するかどうかを返す
    return isEqual(value, actualValue);
}

// 指定されたパスから値を取得する関数
function getValueAtPath(object: any, path: string): any {
    const keys = path.split('/').slice(1); // パスを`/`で分割し、先頭の空要素を削除
    let current = object;
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (i === keys.length - 1) {
            if (Array.isArray(current)) {
                const index = parseInt(key, 10);
                if (!isNaN(index) && index < current.length) {
                    return current[index];
                } else {
                    throw new Error(`Invalid array index: ${key}`);
                }
            } else {
                if (key in current) {
                    return current[key];
                } else {
                    throw new Error(`Property not found: ${key}`);
                }
            }
        } else {
            if (!(key in current)) {
                throw new Error(`Path not found: ${path}`);
            }
            current = current[key];
        }
    }
    throw new Error(`Invalid path: ${path}`);
}

// 値が一致するかどうかを検証する関数
function isEqual(expected: any, actual: any): boolean {
    // JavaScriptではNaNは自身と等しくないため、特別な扱いが必要です
    if (Number.isNaN(expected) && Number.isNaN(actual)) {
        return true;
    }
    return expected === actual;
}