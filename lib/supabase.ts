import 'react-native-get-random-values';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ddtdxhscvohdqfwpswkv.supabase.co';
const supabaseAnonKey = 'sb_publishable_tAeepUIoL5Qxmi30-wPZCQ__WBFKWQu';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
