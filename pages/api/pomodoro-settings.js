import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return res.status(401).json({ error: 'Yetkilendirme gerekli' });
      }

      const { data, error } = await supabase
        .from('pomodoro_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        return res.status(400).json({ error: error.message });
      }

      // Eğer ayar yoksa varsayılan ayarları döndür
      if (!data) {
        const defaultSettings = {
          work_duration: 25,
          short_break_duration: 5,
          long_break_duration: 15,
          sessions_until_long_break: 4,
          auto_start_breaks: false,
          auto_start_work: false,
          sound_enabled: true
        };
        return res.status(200).json({ data: defaultSettings });
      }

      return res.status(200).json({ data });
    } catch (error) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return res.status(401).json({ error: 'Yetkilendirme gerekli' });
      }

      const { 
        work_duration, 
        short_break_duration, 
        long_break_duration, 
        sessions_until_long_break,
        auto_start_breaks,
        auto_start_work,
        sound_enabled
      } = req.body;

      // Önce mevcut ayar var mı kontrol et
      const { data: existingData } = await supabase
        .from('pomodoro_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let data, error;

      if (existingData) {
        // Güncelle
        ({ data, error } = await supabase
          .from('pomodoro_settings')
          .update({
            work_duration,
            short_break_duration,
            long_break_duration,
            sessions_until_long_break,
            auto_start_breaks,
            auto_start_work,
            sound_enabled,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select());
      } else {
        // Yeni oluştur
        ({ data, error } = await supabase
          .from('pomodoro_settings')
          .insert({
            user_id: user.id,
            work_duration,
            short_break_duration,
            long_break_duration,
            sessions_until_long_break,
            auto_start_breaks,
            auto_start_work,
            sound_enabled
          })
          .select());
      }

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ 
        message: 'Pomodoro ayarları kaydedildi!',
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

      const { error } = await supabase
        .from('pomodoro_settings')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ message: 'Pomodoro ayarları sıfırlandı!' });
    } catch (error) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}