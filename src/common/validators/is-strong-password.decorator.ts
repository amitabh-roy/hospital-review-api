import { registerDecorator, type ValidationOptions } from 'class-validator';

export const STRONG_PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d).{8,72}$/;

export const STRONG_PASSWORD_MESSAGE =
  'Password must be at least 8 characters with at least 1 capital letter and 1 number.';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return (
            typeof value === 'string' && STRONG_PASSWORD_PATTERN.test(value)
          );
        },
        defaultMessage() {
          return STRONG_PASSWORD_MESSAGE;
        },
      },
    });
  };
}
