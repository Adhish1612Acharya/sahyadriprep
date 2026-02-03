export type UserRole = "student" | "college_admin" | "super_admin";

type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${Lowercase<T>}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

export type Camelize<T> =
  T extends Array<infer U>
    ? Array<Camelize<U>> // If it's an array, camelize the elements, not the array
    : T extends object
      ? { [K in keyof T as SnakeToCamelCase<string & K>]: Camelize<T[K]> }
      : T;
