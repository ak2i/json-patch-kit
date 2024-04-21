// src/types/index.tsで定義された型をインポートします
import { JsonPatchOperand } from '../types';

// 指定された JSON オブジェクトの値をコピーする関数
export function copyPatchOperation(object: any, operand: JsonPatchOperand): any {
    const { from, path } = operand;

    if (from === undefined) {
        throw new Error('Copy operation must include a from path');
    }

    // 'from' パスの値を取得する
    const value = getValueAtPath(object, from);
    // 'path' パスに値をセットする
    setValueAtPath(object, path, value);

    return object; // 変更後のオブジェクトを返す
}

// 指定されたパスから値を取得する関数
function getValueAtPath(object: any, path: string): any {
    const keys = path.split('/').slice(1); // パスを`/`で分割し、先頭の空要素を削除
    let current = object;

    for (const key of keys) {
        if (!(key in current)) {
            throw new Error(`Path not found: ${path}`);
        }
        current = current[key];
    }
    return current;
}

// 指定されたパスに値を設定する関数
function setValueAtPath(object: any, path: string, value: any): void {
    const keys = path.split('/').slice(1); // パスを`/`で分割し、先頭の空要素を削除
    let current = object;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (i === keys.length - 1) {
            // 最後のキーであれば値を設定
            current[key] = value;
        } else {
            // まだ最後のキーに到達していない場合、次のキーの場所へ進む
            if (!(key in current)) {
                // 次のキーが存在しない場合はオブジェクトを作成
                current[key] = {};
            }
            current = current[key];
        }
    }
    return object; // 変更後のオブジェクトを返す
}