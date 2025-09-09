import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return res.status(401).json({ error: 'Yetkilendirme gerekli' });
      }

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data });
    } catch (error) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return res.status(401).json({ error: 'Yetkilendirme gerekli' });
      }

      const { 
        subject, 
        duration_minutes, 
        session_date, 
        notes 
      } = req.body;

      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          subject,
          duration_minutes,
          session_date: session_date || new Date().toISOString(),
          notes
        })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ 
        message: 'Çalışma seansı başarıyla kaydedildi!',
        data: data[0] 
      });
    } catch (error) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return res.status(401).json({ error: 'Yetkilendirme gerekli' });
      }

      const { id } = req.query;
      const { subject, duration_minutes, notes } = req.body;

      const { data, error } = await supabase
        .from('study_sessions')
        .update({
          subject,
          duration_minutes,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ 
        message: 'Çalışma seansı güncellendi!',
        data: data[0] 
      });
    } catch (error) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return res.status(401).json({ error: 'Yetkilendirme gerekli' });
      }

      const { id } = req.query;

      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ message: 'Çalışma seansı silindi!' });
    } catch (error) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}