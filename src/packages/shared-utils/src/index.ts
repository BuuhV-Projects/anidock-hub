// Export utils
export { cn } from './utils';

// Export validations
export * from './validations/auth';

// Export hooks
export { useIsMobile } from './hooks/use-mobile';

// Export supabase client and types
export { supabase } from './integrations/supabase/client';
export type { Database, Tables, TablesInsert, TablesUpdate, Enums, CompositeTypes } from './integrations/supabase/types';

