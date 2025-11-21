/**
 * Utility functions for handling MongoDB ObjectIds in Extended JSON format
 * Converts between {"$oid": "..."} and string formats
 */

export interface MongoObjectId {
  $oid: string;
}

/**
 * Check if a value is a MongoDB ObjectId in Extended JSON format
 */
export function isMongoObjectId(value: any): value is MongoObjectId {
  return (
    value !== null &&
    typeof value === 'object' &&
    '$oid' in value &&
    typeof value.$oid === 'string' &&
    /^[0-9a-fA-F]{24}$/.test(value.$oid)
  );
}

/**
 * Extract ObjectId string from Extended JSON format or return as-is if already a string
 */
export function extractObjectId(id: any): string | null {
  if (!id) return null;
  
  // If it's already a string, return it
  if (typeof id === 'string') {
    return id;
  }
  
  // If it's an Extended JSON ObjectId, extract the string
  if (isMongoObjectId(id)) {
    return id.$oid;
  }
  
  // If it's an object with $oid property (but not matching our type exactly)
  if (typeof id === 'object' && '$oid' in id && typeof (id as any).$oid === 'string') {
    return (id as any).$oid;
  }
  
  // Fallback: try to convert to string
  return String(id);
}

/**
 * Convert an ObjectId string to Extended JSON format
 */
export function toMongoObjectId(id: string | null | undefined): MongoObjectId | null {
  if (!id) return null;
  const idStr = typeof id === 'string' ? id : String(id);
  if (!/^[0-9a-fA-F]{24}$/.test(idStr)) {
    return null; // Not a valid ObjectId
  }
  return { $oid: idStr };
}

/**
 * Recursively convert all ObjectIds in an object/array from Extended JSON to strings
 */
export function normalizeObjectIds<T>(data: any): T {
  if (data === null || data === undefined) {
    return data;
  }
  
  // If it's an Extended JSON ObjectId, extract the string
  if (isMongoObjectId(data)) {
    return data.$oid as any;
  }
  
  // If it's an array, process each element
  if (Array.isArray(data)) {
    return data.map(item => normalizeObjectIds(item)) as any;
  }
  
  // If it's an object, process each property
  if (typeof data === 'object') {
    const normalized: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        
        // Special handling for ID fields
        if (key === '_id' || key === 'id' || key.endsWith('Id') || key.endsWith('Ids')) {
          if (Array.isArray(value)) {
            normalized[key] = value.map((item: any) => extractObjectId(item));
          } else {
            normalized[key] = extractObjectId(value);
          }
        } else {
          normalized[key] = normalizeObjectIds(value);
        }
      }
    }
    return normalized as T;
  }
  
  // Primitive value, return as-is
  return data;
}

/**
 * Recursively convert all ObjectId strings in an object/array to Extended JSON format
 */
export function toExtendedJson<T>(data: any): T {
  if (data === null || data === undefined) {
    return data;
  }
  
  // If it's already an Extended JSON ObjectId, return as-is
  if (isMongoObjectId(data)) {
    return data as any;
  }
  
  // If it's an array, process each element
  if (Array.isArray(data)) {
    return data.map(item => toExtendedJson(item)) as any;
  }
  
  // If it's an object, process each property
  if (typeof data === 'object') {
    const extended: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        
        // Special handling for ID fields
        if (key === '_id' || key === 'id' || key.endsWith('Id') || key.endsWith('Ids')) {
          if (Array.isArray(value)) {
            extended[key] = value.map((item: any) => {
              const oid = toMongoObjectId(item);
              return oid || item;
            });
          } else {
            const oid = toMongoObjectId(value);
            extended[key] = oid || value;
          }
        } else {
          extended[key] = toExtendedJson(value);
        }
      }
    }
    return extended as T;
  }
  
  // Primitive value, return as-is
  return data;
}

/**
 * Get normalized module ID that matches backend format
 * Backend uses: journeyId_module_${index} when module has no _id
 * This ensures consistency between frontend and backend
 */
export function getNormalizedModuleId(
  module: any, 
  journeyId: string, 
  moduleIndex?: number
): string {
  // First try to get the real MongoDB _id
  const moduleId = extractObjectId(module._id) || extractObjectId(module.id);
  
  if (moduleId) {
    return moduleId;
  }
  
  // If no _id exists and we have an index, generate using backend format: journeyId_module_${index}
  if (moduleIndex !== undefined && moduleIndex !== null) {
    return `${journeyId}_module_${moduleIndex}`;
  }
  
  // Fallback: try to extract from module.order if available
  if (module.order !== undefined && module.order !== null) {
    return `${journeyId}_module_${module.order}`;
  }
  
  // Last resort: return the id as-is (might be a generated ID)
  return module.id || String(module._id) || '';
}

/**
 * Find module index in modules array by matching ID or order
 */
export function findModuleIndex(module: any, modules: any[], journeyId: string): number {
  const moduleId = extractObjectId(module._id) || extractObjectId(module.id);
  
  // Try to find by ID first
  if (moduleId) {
    const index = modules.findIndex((m: any) => {
      const mId = extractObjectId(m._id) || extractObjectId(m.id);
      return mId === moduleId;
    });
    if (index !== -1) return index;
  }
  
  // Try to find by order
  if (module.order !== undefined && module.order !== null) {
    const index = modules.findIndex((m: any) => m.order === module.order);
    if (index !== -1) return index;
  }
  
  // Fallback: return -1 (not found)
  return -1;
}
