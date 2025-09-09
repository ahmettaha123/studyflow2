import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  const { method } = req;
  const { user } = req.query;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user)
          .order('date', { ascending: true });

        if (error) throw error;
        res.status(200).json(data || []);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({ error: 'Failed to fetch calendar events' });
      }
      break;

    case 'POST':
      try {
        const { title, description, date, time, event_type, priority, color } = req.body;

        if (!title || !date) {
          return res.status(400).json({ error: 'Title and date are required' });
        }

        const { data, error } = await supabase
          .from('calendar_events')
          .insert([{
            title,
            description,
            date,
            time: time || null,
            event_type: event_type || 'task',
            priority: priority || 'medium',
            color: color || '#3b82f6',
            user_id: user
          }])
          .select();

        if (error) throw error;
        res.status(201).json(data[0]);
      } catch (error) {
        console.error('Error creating calendar event:', error);
        res.status(500).json({ error: 'Failed to create calendar event' });
      }
      break;

    case 'PUT':
      try {
        const { id, title, description, date, time, event_type, priority, color } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Event ID is required' });
        }

        const { data, error } = await supabase
          .from('calendar_events')
          .update({
            title,
            description,
            date,
            time: time || null,
            event_type,
            priority,
            color,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user)
          .select();

        if (error) throw error;
        res.status(200).json(data[0]);
      } catch (error) {
        console.error('Error updating calendar event:', error);
        res.status(500).json({ error: 'Failed to update calendar event' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Event ID is required' });
        }

        const { error } = await supabase
          .from('calendar_events')
          .delete()
          .eq('id', id)
          .eq('user_id', user);

        if (error) throw error;
        res.status(200).json({ message: 'Event deleted successfully' });
      } catch (error) {
        console.error('Error deleting calendar event:', error);
        res.status(500).json({ error: 'Failed to delete calendar event' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}