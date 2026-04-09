/* Write Initial Unit Tests
Create basic tests for critical functionality:

Set up a testing framework (Jest and Supertest)
Write tests for at least one CRUD operation per resource type
Include tests for both successful operations and error conditions
Ensure your tests can run independently and don't interfere with your development database
*/

const { countWords, findMax } = require('./dataProcessor.js');

test('should count words in simple text', () => {
    const result = countWords('Hello world test');
    expect(result).toBe(3);
});

test('should find the maximum number', () => {
    const result = findMax([5, 10, 3, 8]);
    expect(result).toBe(10);
});

describe('Text Processing Tests', () => {
    test('should count words in simple text', () => {
        const result = countWords('Hello world test');
        expect(result).toBe(3);
    });

    test('should handle empty text', () => {
        const result = countWords('');
        expect(result).toBe(0);
    });
});

describe('Number Processing Tests', () => {
    test('should find the maximum number', () => {
        const result = findMax([5, 10, 3, 8]);
        expect(result).toBe(10);
    });

    test('should work with negative numbers', () => {
        const result = findMax([-5, -10, -3, -8]);
        expect(result).toBe(-3);
    });
});