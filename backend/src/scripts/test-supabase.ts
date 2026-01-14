import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, "../../.env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("--- Supabase Connection Diagnostics ---");
console.log("SUPABASE_URL:", supabaseUrl ? "Present" : "MISSING");
console.log("SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "Present" : "MISSING");

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Fatal: Missing configuration");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

async function main() {
  try {
    console.log("Attempting to list buckets...");
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("❌ Supabase Error:", error.message);
      console.error("Details:", error);
    } else {
        console.log("✅ Connection Successful!");
        console.log("Available Buckets:", data?.map(b => b.name).join(", ") || "None");
    }
  } catch (err) {
    console.error("❌ Unexpected Error:", err);
  }
}

main();
