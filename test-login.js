require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  console.log('1. Attempting login...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'Keyzii@163.com',
    password: '2025Mauy@163com'
  });

  if (authError) {
    console.error('Login failed:', authError.message);
    return;
  }
  
  console.log('Login success. User ID:', authData.user.id);
  const userId = authData.user.id;

  // Manually simulate what ensureDefaultBrandForUser does to test RLS
  console.log('\n2. Testing brand creation (simulating server behavior)...');
  
  // Note: we must use the authenticated client to test RLS properly
  const { data: brand, error: brandError } = await supabase
    .from('brands')
    .upsert({
      id: userId,
      name: 'Keyzii 默认品牌',
      keywords: []
    }, { onConflict: 'id' })
    .select('id')
    .single();

  if (brandError) {
    console.error('Failed to upsert brand (RLS issue?):', brandError);
  } else {
    console.log('Brand upsert success. Brand ID:', brand.id);
    
    console.log('\n3. Testing user_brands creation...');
    const { count, error: countError } = await supabase
      .from('user_brands')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Failed to query user_brands count:', countError);
      return;
    }

    if ((count ?? 0) > 0) {
      console.log('User_brands relation already exists. Count:', count);
      console.log('\n✅ ALL VERIFICATION STEPS PASSED');
      return;
    }

    const { data: relation, error: relError } = await supabase
      .from('user_brands')
      .insert({
        user_id: userId,
        brand_id: brand.id,
        role: 'OWNER'
      })
      .select('id')
      .single();

    if (relError) {
      console.error('Failed to insert user_brands:', relError);
    } else {
      console.log('User_brands insert success. Relation ID:', relation.id);
      console.log('\n✅ ALL VERIFICATION STEPS PASSED');
    }
  }
}

test();
