import { createClient } from "@supabase/supabase-js";

const required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SEED_ADMIN_EMAIL", "SEED_ADMIN_PASSWORD", "SEED_CLIENT_EMAIL", "SEED_CLIENT_PASSWORD"];
for (const key of required) if (!process.env[key]) throw new Error(`Missing ${key}`);

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
async function ensureUser(email, password, role, firstName) {
  const { data: listed } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  let user = listed.users.find((candidate) => candidate.email === email);
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { first_name: firstName } });
    if (error) throw error;
    user = data.user;
  }
  const { error: profileError } = await supabase.from("profiles").upsert({ id: user.id, first_name: firstName, role });
  if (profileError) throw profileError;
  return user;
}

const admin = await ensureUser(process.env.SEED_ADMIN_EMAIL, process.env.SEED_ADMIN_PASSWORD, "ADMIN", "Yifan");
const client = await ensureUser(process.env.SEED_CLIENT_EMAIL, process.env.SEED_CLIENT_PASSWORD, "CLIENT", "Alex");
const { error } = await supabase.from("organization_members").upsert({ organization_id: "10000000-0000-0000-0000-000000000001", user_id: client.id, title: "Head of International Sales" });
if (error) throw error;
console.log(`Seeded admin ${admin.email} and client ${client.email}.`);
