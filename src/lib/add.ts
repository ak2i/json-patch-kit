// src/types/index.tsで定義された型をインポートします
import { JsonPatchOperand } from '../types';

// オブジェクトに新しいプロパティを追加する関数
export function addPatchOperation(object: any, operand: JsonPatchOperand) {
    // パスを`/`で分割して、配列に変換します。先頭の空文字列を削除します。
    const keys = operand.path.split('/').slice(1);
    let current = object;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        // 最後のキーであれば新しい値をセット
        if (i === keys.length - 1) {
            // 配列に対する処理
            if (Array.isArray(current)) {
                const index = parseInt(key, 10);
                if (isNaN(index)) {
                    // インデックスが数値でない場合、末尾に追加
                    current.push(operand.value);
                } else {
                    // 指定されたインデックスに値を挿入
                    current.splice(index, 0, operand.value);
                }
            } else {
                // オブジェクトに対する処理
                current[key] = operand.value;
            }
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
