// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tyqikmyzzmiygthufwej.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cWlrbW16em1peWd0aHVmd2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NDQ4NzMsImV4cCI6MjA0ODEyMDg3M30.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
