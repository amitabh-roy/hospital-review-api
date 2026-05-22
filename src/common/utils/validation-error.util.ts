import { ValidationError } from 'class-validator';

export function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    const property = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      messages.push(
        ...Object.values(error.constraints).map((msg) => `${property}: ${msg}`),
      );
    }

    if (error.children?.length) {
      messages.push(...flattenValidationErrors(error.children, property));
    }
  }

  return messages;
}
