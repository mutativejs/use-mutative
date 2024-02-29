import { jsdocTests } from 'jsdoc-tests';

test('test "add" function', () => {
  jsdocTests('./src/index.ts');
});
