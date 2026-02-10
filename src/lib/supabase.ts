
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kqhbxtndkjsyvuhtgajb.supabase.co';
const supabaseKey = 'sb_publishable_UbnBlwTr3HiS-zmnBG4A_A_vxZND61O';

export const supabase = createClient(supabaseUrl, supabaseKey);
