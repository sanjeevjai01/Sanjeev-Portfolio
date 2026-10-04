// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

import { supabase } from "./supabase";

// ==========================================
// ADMIN LOGIN
// ==========================================

export async function loginAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// ==========================================
// ADMIN LOGOUT
// ==========================================

export async function logoutAdmin() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

// ==========================================
// GET CURRENT ADMIN SESSION
// ==========================================

export async function getAdminSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}