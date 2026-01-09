import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jtbcfeazuwfztqfprzdm.supabase.co";
const supabaseAnonKey = "sb_publishable_EpALt4NHEHgQ_ApUGjUzSg__gEn_dYi";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
