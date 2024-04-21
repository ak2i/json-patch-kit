// src/types/index.tsで定義された型をインポートします
import { JsonPatchOperand, isJsonPatchOperand, JsonPatchOperationType } from '../types';
import { addPatchOperation } from './add';
import { replacePatchOperation } from './replace';
import { removePatchOperation } from './remove';
import { movePatchOperation } from './move'; // 仮にmove操作も実装されているとします
import { copyPatchOperation } from './copy'; // 仮にcopy操作も実装されているとします
import { testPatchOperation } from './test'; // 仮にtest操作も実装されているとします

// TypeScriptでの拡張 applyPatch 関数の実装
export async function applyPatch(object: any, patch: JsonPatchOperand[], handleOperation?: (operation: JsonPatchOperand, currentObject: any) => Promise<any>): Promise<any> {
    let currentJson = object;

    // $patch キーがある場合、その中のパッチ配列を展開して適用
    if (currentJson.$patch && Array.isArray(currentJson.$patch)) {
        patch = [...currentJson.$patch, ...patch];
    }

    for (const operation of patch) {
        if (isJsonPatchOperand(operation) && operation.op == JsonPatchOperationType.IMPORT && handleOperation) {
            // `import` オペレーションでカスタムの動作を行う
            currentJson = await handleOperation(operation, currentJson);
        } else {
            // 通常のパッチ操作の適用
            currentJson = applyOperation(currentJson, operation);
        }
    }

    return currentJson;
}

// 個々のパッチ操作を適用するヘルパー関数
function applyOperation(object: any, operation: JsonPatchOperand): any {
    // ここで各パッチ操作の具体的な実装を行う
    switch (operation.op) {
        case 'add':
            return addPatchOperation(object, operation);
        case 'remove':
            return removePatchOperation(object, operation);
        case 'replace':
            return replacePatchOperation(object, operation);
        case 'move':
            return movePatchOperation(object, operation);
        case 'copy':
            return copyPatchOperation(object, operation);
        case 'test':
            if (!testPatchOperation(object, operation)) {
                throw new Error('Test operation failed: values do not match');
            }
            return object;
        default:
            throw new Error(`Unsupported operation: ${operation.op}`);
    }
}