import { JsonPatchOperand, JsonPatchOperationType } from '../types';

function isObject(value: any) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function compareValues(value1: any, value2: any): boolean {
    // プリミティブ値の比較
    if (value1 === value2) {
        return true;
    }

    // オブジェクトの深い比較（isObject関数を使用してオブジェクトかどうかを判断）
    if (isObject(value1) && isObject(value2)) {
        // オブジェクトのキーの数が異なる場合は、等しくない
        const keys1 = Object.keys(value1);
        const keys2 = Object.keys(value2);
        if (keys1.length !== keys2.length) {
            return false;
        }

        // 各キーに対して再帰的に比較
        for (const key of keys1) {
            if (!compareValues(value1[key], value2[key])) {
                return false;
            }
        }

        // すべてのキーが等しい場合は、オブジェクトは等しい
        return true;
    }

    // 配列の深い比較
    if (Array.isArray(value1) && Array.isArray(value2)) {
        // 配列の長さが異なる場合は、等しくない
        if (value1.length !== value2.length) {
            return false;
        }

        // 各要素に対して再帰的に比較
        for (let i = 0; i < value1.length; i++) {
            if (!compareValues(value1[i], value2[i])) {
                return false;
            }
        }

        // すべての要素が等しい場合は、配列は等しい
        return true;
    }

    // それ以外の場合は、等しくない
    return false;
}

function findAddedProperties(obj1: Record<string, any>, obj2: Record<string, any>): string[] {
    const addedProperties: string[] = [];

    // obj2 の各プロパティに対してループ
    for (const key in obj2) {
        // obj1 に同じキーが存在しない場合
        if (!(key in obj1)) {
            // 追加されたプロパティとして記録
            addedProperties.push(key);
        }
    }

    return addedProperties;
}

function findRemovedProperties(obj1: Record<string, any>, obj2: Record<string, any>): string[] {
    const removedProperties: string[] = [];

    // obj1 の各プロパティに対してループ
    for (const key in obj1) {
        // obj2 に同じキーが存在しない場合
        if (!(key in obj2)) {
            // 削除されたプロパティとして記録
            removedProperties.push(key);
        }
    }

    return removedProperties;
}

function findModifiedProperties(obj1: Record<string, any>, obj2: Record<string, any>): string[] {
    const modifiedProperties: string[] = [];

    // obj1 の各プロパティに対してループ
    for (const key in obj1) {
        // obj2 に同じキーが存在し、かつ値が異なる場合
        if (key in obj2 && !compareValues(obj1[key], obj2[key])) {
            // 変更されたプロパティとして記録
            modifiedProperties.push(key);
        }
    }

    return modifiedProperties;
}

function generatePatchOperation(type: JsonPatchOperationType, path: string, value?: any) {
    // JSON Patch 操作の基本形式を定義
    const operation: JsonPatchOperand = { op: type, path: path };

    // 'add', 'replace', 'test' 操作の場合は、値も含める
    if (['add', 'replace', 'test'].includes(type)) {
        operation.value = value;
    }

    return operation;
}

/**
 * JSON Patch の `add` 操作を生成する関数。
 * @param path オブジェクト内のパス（`/` 区切り）。
 * @param value 追加する値。
 * @returns JSON Patch 操作を表すオブジェクト。
 */
export function createAddOperation(path: string, value: any): JsonPatchOperand {
    // パスの先頭が `/` でない場合は、`/` を追加
    const formattedPath = path.startsWith('/') ? path : `/${path}`;

    // JSON Patch 操作オブジェクトを返す
    return {
        op: JsonPatchOperationType.ADD,
        path: formattedPath.replace(/\./g, '/'), // パス内の `.` を `/` に置換
        value: value
    };
}

/**
 * JSON Patch の `replace` 操作を生成する関数。
 * @param path オブジェクト内のパス（`/` 区切り）。
 * @param value 置き換える値。
 * @returns JSON Patch 操作を表すオブジェクト。
 */
export function createReplaceOperation(path: string, value: any): JsonPatchOperand {
    // パスの先頭が `/` でない場合は、`/` を追加
    const formattedPath = path.startsWith('/') ? path : `/${path}`;

    return {
        op: JsonPatchOperationType.REPLACE,
        path: formattedPath,
        value: value
    };
}

/**
 * JSON Patch の `remove` 操作を生成する関数。
 * @param path オブジェクト内のパス（`/` 区切り）。
 * @returns JSON Patch 操作を表すオブジェクト。
 */
export function createRemoveOperation(path: string): JsonPatchOperand {
    // パスの先頭が `/` でない場合は、`/` を追加
    const formattedPath = path.startsWith('/') ? path : `/${path}`;

    return {
        op: JsonPatchOperationType.REMOVE,
        path: formattedPath
    };
}

export function makeDiff(obj1: Record<string, any>, obj2: Record<string, any>, basePath: string = ''): JsonPatchOperand[] {
    const patchOperations: JsonPatchOperand[] = [];

    // 追加されたプロパティを検出
    const addedProperties = findAddedProperties(obj1, obj2);
    for (const key of addedProperties) {
        const fullPath = basePath + '/' + key;
        if (typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
            // オブジェクトの場合は再帰的に差分を検出
            patchOperations.push(...makeDiff({}, obj2[key], fullPath));
        } else {
            // プリミティブ値の場合
            patchOperations.push(createAddOperation(fullPath, obj2[key]));
        }
    }

    // 削除されたプロパティを検出
    const removedProperties = findRemovedProperties(obj1, obj2);
    for (const key of removedProperties) {
        const fullPath = basePath + '/' + key;
        patchOperations.push(createRemoveOperation(fullPath));
    }

    // 変更されたプロパティを検出
    const modifiedProperties = findModifiedProperties(obj1, obj2);
    for (const key of modifiedProperties) {
        const fullPath = basePath + '/' + key;
        if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && obj1[key] !== null && obj2[key] !== null && !Array.isArray(obj1[key]) && !Array.isArray(obj2[key])) {
            // オブジェクトの場合は再帰的に差分を検出
            patchOperations.push(...makeDiff(obj1[key], obj2[key], fullPath));
        } else {
            // プリミティブ値の場合
            patchOperations.push(createReplaceOperation(fullPath, obj2[key]));
        }
    }

    return patchOperations;
}

/*
export function makeDiff(obj1: Record<string, any>, obj2: Record<string, any>, basePath: string = ''): JsonPatchOperand[] {
    const patchOperations: JsonPatchOperand[] = [];

    // 追加されたプロパティを検出
    const addedProperties = findAddedProperties(obj1, obj2);
    for (const key of addedProperties) {
        const fullPath = basePath + '/' + key;
        if (typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
            // オブジェクトの場合は再帰的に差分を検出
            patchOperations.push(...makeDiff({}, obj2[key], fullPath));
        } else {
            // プリミティブ値の場合
            patchOperations.push(generatePatchOperation(JsonPatchOperationType.ADD, fullPath, obj2[key]));
        }
    }

    // 削除されたプロパティを検出
    const removedProperties = findRemovedProperties(obj1, obj2);
    for (const key of removedProperties) {
        const fullPath = basePath + '/' + key;
        patchOperations.push(generatePatchOperation(JsonPatchOperationType.REMOVE, fullPath));
    }

    // 変更されたプロパティを検出
    const modifiedProperties = findModifiedProperties(obj1, obj2);
    for (const key of modifiedProperties) {
        const fullPath = basePath + '/' + key;
        if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && obj1[key] !== null && obj2[key] !== null && !Array.isArray(obj1[key]) && !Array.isArray(obj2[key])) {
            // オブジェクトの場合は再帰的に差分を検出
            patchOperations.push(...makeDiff(obj1[key], obj2[key], fullPath));
        } else {
            // プリミティブ値の場合
            patchOperations.push(generatePatchOperation(JsonPatchOperationType.REPLACE, fullPath, obj2[key]));
        }
    }

    return patchOperations;
}
*/