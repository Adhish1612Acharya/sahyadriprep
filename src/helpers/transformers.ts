import camel from 'to-camel-case';


export function toCamelCase<T>(data: T): any {
  if (Array.isArray(data)) {
    return data.map(toCamelCase);
  }
  if (data && typeof data === "object" && data !== null) {
    const camelCased: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      camelCased[camel(key)] = toCamelCase(value);
    }
    return camelCased;
  }
  return data;
}
