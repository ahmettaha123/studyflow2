import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return res.status(401).json({ error: 'Yetkilendirme gerekli' });
      }

      const { data, error } = await supabase
        .from('todos')
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
        due_date, 
        priority,
        category 
      } = req.body;

      const { data, error } = await supabase
        .from('todos')
        .insert({
          user_id: user.id,
          title,
          description,
          due_date,
          priority: priority || 'orta',
          category: category || 'genel',
          completed: false
        })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ 
        message: 'Görev başarıyla oluşturuldu!',
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
      const { title, description, due_date, priority, category, completed } = req.body;

      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (due_date !== undefined) updateData.due_date = due_date;
      if (priority !== undefined) updateData.priority = priority;
      if (category !== undefined) updateData.category = category;
      if (completed !== undefined) {
        updateData.completed = completed;
        if (completed) {
          updateData.completed_at = new Date().toISOString();
        } else {
          updateData.completed_at = null;
        }
      }

      const { data, error } = await supabase
        .from('todos')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ 
        message: 'Görev güncellendi!',
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
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ message: 'Görev silindi!' });
    } catch (error) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}