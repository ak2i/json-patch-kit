// src/types/index.tsで定義された型をインポートします
import { JsonPatchOperand } from '../types';

// 指定されたJSONオブジェクトのパスにある値を新しい値で置き換える関数
export function replacePatchOperation(object: any, operand: JsonPatchOperand): any {
    const { path, value } = operand;
    if (value === undefined) {
        throw new Error('Replace operation must include a value');
    }

    const keys = path.split('/').slice(1); // パスを`/`で分割し、先頭の空要素を削除
    let current = object;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        
        // 最後のキーであれば新しい値をセット
        if (i === keys.length - 1) {
            if (!(key in current)) {
                throw new Error(`Path not found: ${path}`);
            }
            current[key] = value;
        } else {
            // まだ最後のキーに到達していない場合、次のキーの場所へ進む
            if (!(key in current)) {
                throw new Error(`Path not found: ${path}`);
            }
            current = current[key];
        }
    }

    return object; // 変更後のオブジェクトを返す
}