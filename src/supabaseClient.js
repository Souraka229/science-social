import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rzwksaruhkeorwlrjcbl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6d2tzYXJ1aGtlb3J3bHJqY2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzI0MjMsImV4cCI6MjA3Mjk0ODQyM30.XKj4c_cvjeTJSMaKy8-QPMY-0RWvfAN0AtjnFOmKvYc'

export const supabase = createClient(supabaseUrl, supabaseKey)
