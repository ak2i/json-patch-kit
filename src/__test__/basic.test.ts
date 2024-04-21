// テストのためのモジュールをインポート
import { applyPatch } from '../lib/patch';
import { JsonPatchOperand, JsonPatchOperationType } from '../types';

describe('json-patch basic tests', () => {
    it('should apply an add operation correctly', async () => {
        const initialJson = { a: 1 };
        const patch: JsonPatchOperand[] = [{ op: JsonPatchOperationType.ADD, path: '/b', value: 2 }];
        const result = await applyPatch(initialJson, patch);
        expect(result.b).toBe(2);
    });

    it('should apply a replace operation correctly', async () => {
        const initialJson = { a: 1 };
        const patch: JsonPatchOperand[] = [{ op: JsonPatchOperationType.REPLACE, path: '/a', value: 2 }];
        const result = await applyPatch(initialJson, patch);
        expect(result.a).toBe(2);
    });

    it('should apply a remove operation correctly', async () => {
        const initialJson = { a: 1, b: 2 };
        const patch: JsonPatchOperand[] = [{ op: JsonPatchOperationType.REMOVE, path: '/b' }];
        const result = await applyPatch(initialJson, patch);
        expect(result.b).toBeUndefined();
    });

    it('should throw an error if path is invalid', async () => {
        const initialJson = { a: 1 };
        const patch: JsonPatchOperand[] = [{ op: JsonPatchOperationType.REPLACE, path: '/b', value: 2 }];
        await expect(applyPatch(initialJson, patch)).rejects.toThrow();
    });

    it('should handle complex scenarios with multiple operations', async () => {
        const initialJson = { a: 1, b: { c: 3 } };
        const patch: JsonPatchOperand[] = [
            { op: JsonPatchOperationType.ADD, path: '/b/d', value: 4 },
            { op: JsonPatchOperationType.REPLACE, path: '/a', value: 2 }
        ];
        const result = await applyPatch(initialJson, patch);
        expect(result.a).toBe(2);
        expect(result.b.d).toBe(4);
    });

    // 統合された $patch プロパティのテスト
    it('should apply a patch array from $patch property', async () => {
        const initialJson = { a: 1, $patch: [{ op: JsonPatchOperationType.ADD, path: '/b', value: 2 }] };
        const result = await applyPatch(initialJson, []);
        expect(result.b).toBe(2);
    });

    it('should correctly apply a move operation', async () => {
        const initialJson = { a: 1, b: { c: 3 } };
        const patch: JsonPatchOperand[] = [
            { op: JsonPatchOperationType.MOVE, from: '/b/c', path: '/a' }
        ];
        const result = await applyPatch(initialJson, patch);
        expect(result.a).toBe(3);
        expect(result.b.c).toBeUndefined();
    });

    it('should correctly apply a copy operation', async () => {
        const initialJson = { a: 1, b: { c: 3 } };
        const patch: JsonPatchOperand[] = [
            { op: JsonPatchOperationType.COPY, from: '/b/c', path: '/b/d' }
        ];
        const result = await applyPatch(initialJson, patch);
        expect(result.b.d).toBe(3);
    });

    it('should fail the test operation if values do not match', async () => {
        const initialJson = { a: 1 };
        const patch: JsonPatchOperand[] = [
            { op: JsonPatchOperationType.TEST, path: '/a', value: 2 }
        ];
        await expect(applyPatch(initialJson, patch)).rejects.toThrow('Test operation failed: values do not match');
    });
});