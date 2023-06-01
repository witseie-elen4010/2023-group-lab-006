// These are the tests for the user login and password requirements.
// This uses the usersTest file under routes which hold the same functionality as the users.js file under routes
// This test file needs to be run on powershell, not gitbash, using the command "npx jest --detectOpenHandle"

const { isNotComplete, doPasswordsMatch, isPasswordValidLength, buildErrors } = require('../routes/usersTest')

test('isNotComplete returns true when name is empty', () => {
  // Given

  const name = null
  const email = 'fake@gmail.com'
  const password = 'pass'
  const password2 = 'pass'

  // When
  const result = isNotComplete(name, email, password, password2)

  // Then
  expect(result).toBe(true)
})

test('isNotComplete returns true when name is empty', () => {
  // Given

  const name = null
  const email = 'fake@gmail.com'
  const password = 'pass'
  const password2 = 'pass'

  // When
  const result = isNotComplete(name, email, password, password2)

  // Then
  expect(result).toBe(true)
})

test('isNotComplete returns true when email is empty', () => {
  // Given

  const name = 'name'
  const email = null
  const password = 'pass'
  const password2 = 'pass'

  // When
  const result = isNotComplete(name, email, password, password2)

  // Then
  expect(result).toBe(true)
})

test('isNotComplete returns true when password is empty', () => {
  // Given

  const name = 'name'
  const email = 'fake@gmail.com'
  const password = null
  const password2 = 'pass'

  // When
  const result = isNotComplete(name, email, password, password2)

  // Then
  expect(result).toBe(true)
})

test('isNotComplete returns true when password2 is empty', () => {
  // Given

  const name = 'name'
  const email = 'fake@gmail.com'
  const password = 'pass'
  const password2 = null

  // When
  const result = isNotComplete(name, email, password, password2)

  // Then
  expect(result).toBe(true)
})

test('isNotComplete returns false when nothing is empty', () => {
  // Given

  const name = 'name'
  const email = 'fake@gmail.com'
  const password = 'pass'
  const password2 = 'pass'

  // When
  const result = isNotComplete(name, email, password, password2)

  // Then
  expect(result).toBe(false)
})

test('doPasswordsMatch returns false if the passwords do not match', () => {
  // Given

  const password = 'pass123'
  const password2 = 'pass456'

  // When
  const result = doPasswordsMatch(password, password2)

  // Then
  expect(result).toBe(false)
})

test('doPasswordsMatch returns true if the passwords do match', () => {
  // Given

  const password = 'pass123'
  const password2 = 'pass123'

  // When
  const result = doPasswordsMatch(password, password2)

  // Then
  expect(result).toBe(true)
})

test('isPasswordValidLength returns true if the passwords is a valid length', () => {
  // Given
  const password = 'pass123'

  // When
  const result = isPasswordValidLength(password)

  // Then
  expect(result).toBe(true)
})

test('isPasswordValidLength returns false if the passwords is not a valid length', () => {
  // Given
  const password = 'pass'

  // When
  const result = isPasswordValidLength(password)

  // Then
  expect(result).toBe(false)
})

test('Prompt shown when all fields are not filled in', () => {
  // given
  const name = null
  const email = 'fake@gmail.com'
  const password = 'pass'
  const password2 = 'pass'
  const expectedError = 'Please fill in all fields'

  // when
  const errors = buildErrors(name, email, password, password2)

  // then
  expect(errors.length).toBe(1)
  expect(errors[0].msg).toBe(expectedError)
})

test('Prompt shown when passwords do not match', () => {
  // given
  const name = 'name'
  const email = 'fake@gmail.com'
  const password = 'password'
  const password2 = 'pass'
  const expectedError = "Passwords don't match"

  // when
  const errors = buildErrors(name, email, password, password2)

  // then
  expect(errors.length).toBe(1)
  expect(errors[0].msg).toBe(expectedError)
})

test('Prompt shown when password is less than 6 characters', () => {
  // given
  const name = 'name'
  const email = 'fake@gmail.com'
  const password = 'pass'
  const password2 = 'pass'
  const expectedError = 'Password should be at least 6 characters'

  // when
  const errors = buildErrors(name, email, password, password2)

  // then
  expect(errors.length).toBe(1)
  expect(errors[0].msg).toBe(expectedError)
})
