const { isValidEmail } = require('../utils/helper');

test('Correctly identify a valid email', () => {
  expect(isValidEmail('test@example.com')).toBe(true);
});

test('Correctly reject an invalid email', () => {
  expect(isValidEmail('not-an-email')).toBe(false);
});
