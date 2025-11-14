// /src/utils/helpers.ts

import { v4 as uuidv4 } from 'uuid';
export function generateAuditId(prefix = 'audit') {
  return `${prefix}_${uuidv4()}`;
}
