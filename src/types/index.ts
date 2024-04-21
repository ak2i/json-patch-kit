// JSON Patchの操作を表すオペランドの基本型
export interface JsonPatchOperand {
    op: JsonPatchOperationType;
    path: string;
    value?: any; // オプショナルなプロパティ。add, replaceなどの操作で使用
    from?: string; // move や copy 操作でソース位置を指定するためのプロパティ
}

// 使用可能なJSON Patch操作の列挙型
export enum JsonPatchOperationType {
    ADD = 'add',
    REPLACE = 'replace',
    REMOVE = 'remove',
    MOVE = 'move',
    COPY = 'copy',
    TEST = 'test', // JSON Patch仕様で定義されている操作で、指定されたパスの値が期待した値であることを確認
    IMPORT = 'import'
}

// operation オブジェクトが JsonPatchOperand 型であるかどうかをチェックする型ガード関数
export function isJsonPatchOperand(operation: any): operation is JsonPatchOperand {
    return operation && typeof operation.operation === 'string' && typeof operation.path === 'string';
}

// エラーハンドリングを行うためのカスタムエラークラス
export class JsonPatchError extends Error {
    constructor(message: string, public operation?: JsonPatchOperand, public index?: number) {
        super(message);
        // エラー発生時にオペランドとインデックス情報を持つことができる
        this.name = 'JsonPatchError';
    }
}