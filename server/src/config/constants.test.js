import test from 'node:test';
import assert from 'node:assert/strict';
import { VALID_ROLES } from './constants.js';

test('only student and admin roles are available', () => {
  assert.deepEqual(VALID_ROLES.sort(), ['admin', 'student']);
});
