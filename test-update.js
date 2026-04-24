require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'Keyzii@163.com',
    password: '2025Mauy@163com'
  });
  const userId = authData.user.id;

  const { data: relation, error: relError } = await supabase
    .from('user_brands')
    .upsert({
      user_id: userId,
      brand_id: userId,
      role: 'OWNER'
    }, { onConflict: 'user_id,brand_id' })
    .select('id')
    .single();
    
  if (relError) {
    console.error('Failed to upsert user_brands:', relError);
  } else {
    console.log('User_brands upsert success. Relation ID:', relation.id);
  }
}
test();
