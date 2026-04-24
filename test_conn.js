import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmbrfwkljaraeybxilry.supabase.co';
const supabaseAnonKey = 'sb_publishable_NlXcnYRQuzwJN_ucdDunnw_Vd0U7MUr';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Probando inserción...");
  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nombre: 'Antigravity_OK', rol: 'admin', password: 'test' }])
    .select();

  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("¡Conexión verificada! Usuario creado:", data);
  }
}

test();
