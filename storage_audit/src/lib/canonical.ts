// /src/lib/canonical.ts

export function canonicalize(obj: any): string {
  return JSON.stringify(sortObject(obj));
}

function sortObject(value: any): any {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    const res: any = {};
    for (const k of keys) {
      res[k] = sortObject(value[k]);
    }
    return res;
  }
  return value;
}
