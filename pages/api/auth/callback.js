import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, error: authError, error_description } = req.query;

  // Eğer OAuth hatası varsa
  if (authError) {
    console.error('OAuth error:', authError, error_description);
    return res.redirect('/auth?error=' + encodeURIComponent(authError));
  }

  // Eğer code yoksa
  if (!code) {
    return res.redirect('/auth?error=' + encodeURIComponent('No authorization code received'));
  }

  try {
    // Code'u session'a çevir
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Session exchange error:', error);
      return res.redirect('/auth?error=' + encodeURIComponent(error.message));
    }

    // Başarılı giriş - ana sayfaya yönlendir
    return res.redirect('/');
  } catch (error) {
    console.error('Callback handler error:', error);
    return res.redirect('/auth?error=' + encodeURIComponent('Authentication failed'));
  }
}