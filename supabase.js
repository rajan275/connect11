// supabase.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://amhbckgosdxpmirdxcln.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaGJja2dvc2R4cG1pcmR4Y2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NDI0NzMsImV4cCI6MjEwMjExODQ3M30.Wao9hF4rtmql_ALvzIXfk8vlkG3Am4QyU_aF5ha2FoY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
