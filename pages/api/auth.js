import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { action, email, password } = req.body;

    try {
      if (action === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ 
          message: 'Kayıt başarılı! E-posta adresinizi kontrol edin.',
          user: data.user 
        });
      }

      if (action === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ 
          message: 'Giriş başarılı!',
          user: data.user,
          session: data.session
        });
      }

      if (action === 'signout') {
        const { error } = await supabase.auth.signOut();

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ message: 'Çıkış başarılı!' });
      }

      return res.status(400).json({ error: 'Geçersiz işlem' });
    } catch (error) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
      }

      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}