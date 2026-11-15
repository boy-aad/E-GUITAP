import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import type { Database } from '../types/database';

/** Client Supabase unique, typé avec le schéma de la base. */
export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseKey);
