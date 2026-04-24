const fs=require("fs");
const path=require("path");
const { createClient }=require("@supabase/supabase-js");
const env={};
for (const line of fs.readFileSync(path.join(process.cwd(),".env.local"),"utf8").split(/\r?\n/)) { if (!line || line.trim().startsWith("#")) continue; const idx=line.indexOf("="); env[line.slice(0,idx)]=line.slice(idx+1); }
const supabase=createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
(async()=>{ const { data, error }=await supabase.auth.signInWithPassword({ email: "Keyzii@163.com", password: "2025Mauy@163com" }); if (error) throw error; const userId=data.user.id; const brandRes=await supabase.from("brands").select("id,name,created_at").eq("id", userId); const relRes=await supabase.from("user_brands").select("id,user_id,brand_id,role,created_at").eq("user_id", userId); console.log(JSON.stringify({ userId, brandCount: (brandRes.data||[]).length, brands: brandRes.data, brandError: brandRes.error, relationCount: (relRes.data||[]).length, userBrands: relRes.data, relationError: relRes.error }, null, 2)); })().catch((error)=>{ console.error(error); process.exit(1); });
