import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { code, error, error_description } = req.query;

  if (error) {
    console.error('OAuth error:', error, error_description);
    return res.redirect(`/auth?error=${encodeURIComponent(error_description || error)}`);
  }

  if (code) {
    try {
      // Exchange the code for a session
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError) {
        console.error('Session exchange error:', sessionError);
        return res.redirect(`/auth?error=${encodeURIComponent(sessionError.message)}`);
      }

      // Successful authentication - redirect to home page
      return res.redirect('/?auth=success');
    } catch (err) {
      console.error('Unexpected error during auth callback:', err);
      return res.redirect(`/auth?error=${encodeURIComponent('Authentication failed')}`);
    }
  }

  // No code provided
  return res.redirect('/auth?error=No authentication code provided');
}