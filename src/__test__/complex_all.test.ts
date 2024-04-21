import { applyPatch } from '../lib/patch';
import { JsonPatchOperand, JsonPatchOperationType } from '../types';

describe('json-patch complex operations', () => {
    it('should apply a combination of all operations correctly', async () => {
        const initialJson = {
            user: {
                name: "John Doe",
                age: 30,
                email: "john.doe@example.com",
                address: {
                    street: "123 Main St",
                    city: "Anytown"
                },
                hobbies: ["reading"]
            },
            tasks: ["task1", "task2"]
        };

        const patch: JsonPatchOperand[] = [
            { op: JsonPatchOperationType.ADD, path: '/user/phone', value: '123-456-7890' },
            { op: JsonPatchOperationType.REMOVE, path: '/user/age' },
            { op: JsonPatchOperationType.REPLACE, path: '/user/name', value: 'Jane Doe' },
            { op: JsonPatchOperationType.MOVE, from: '/user/email', path: '/user/contactEmail' },
            { op: JsonPatchOperationType.COPY, from: '/user/address', path: '/user/billingAddress' },
            { op: JsonPatchOperationType.TEST, path: '/user/name', value: 'Jane Doe' },
            { op: JsonPatchOperationType.ADD, path: '/user/hobbies/-', value: 'cycling' },
            { op: JsonPatchOperationType.ADD, path: '/tasks', value: 'task3' }
        ];

        const result = await applyPatch(initialJson, patch);

        expect(result.user.phone).toBe('123-456-7890');
        expect(result.user).not.toHaveProperty('age');
        expect(result.user.name).toBe('Jane Doe');
        expect(result.user).toHaveProperty('contactEmail', 'john.doe@example.com');
        expect(result.user.billingAddress).toEqual({ street: "123 Main St", city: "Anytown" });
        expect(result.user.hobbies).toContain('cycling');
        expect(result.tasks).toContain('task3');
    });
});
