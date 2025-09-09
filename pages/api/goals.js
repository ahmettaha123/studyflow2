import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return res.status(401).json({ error: 'Yetkilendirme gerekli' });
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

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
        title, 
        description, 
        target_date, 
        category,
        priority 
      } = req.body;

      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title,
          description,
          target_date,
          category: category || 'genel',
          priority: priority || 'orta',
          status: 'aktif'
        })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ 
        message: 'Hedef başarıyla oluşturuldu!',
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
      const { title, description, target_date, category, priority, status } = req.body;

      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (target_date !== undefined) updateData.target_date = target_date;
      if (category !== undefined) updateData.category = category;
      if (priority !== undefined) updateData.priority = priority;
      if (status !== undefined) {
        updateData.status = status;
        if (status === 'tamamlandı') {
          updateData.completed_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ 
        message: 'Hedef güncellendi!',
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
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ message: 'Hedef silindi!' });
    } catch (error) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}