import { createClient } from '@supabase/supabase-js';

// Supabase URL ve Anon Key - Bu değerler .env.local dosyasından alınacak
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase client oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Kullanıcı authentication fonksiyonları
export const auth = {
  // Kullanıcı kaydı
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  // Kullanıcı girişi
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Kullanıcı çıkışı
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Mevcut kullanıcıyı al
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Auth state değişikliklerini dinle
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Veritabanı işlemleri
export const db = {
  // Deneme sınavı sonuçları
  exams: {
    // Yeni deneme sonucu ekle
    create: async (examData) => {
      const { data, error } = await supabase
        .from('exam_results')
        .insert([examData])
        .select();
      return { data, error };
    },

    // Kullanıcının tüm deneme sonuçlarını getir
    getByUserId: async (userId) => {
      try {
        const { data, error } = await supabase
          .from('exam_results')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Database error in getByUserId:', error);
          return { data: [], error };
        }
        
        return { data: data || [], error: null };
      } catch (err) {
        console.error('Unexpected error in getByUserId:', err);
        return { data: [], error: err };
      }
    },

    // Deneme sonucunu güncelle
    update: async (id, examData) => {
      const { data, error } = await supabase
        .from('exam_results')
        .update(examData)
        .eq('id', id)
        .select();
      return { data, error };
    },

    // Deneme sonucunu sil
    delete: async (id) => {
      const { data, error } = await supabase
        .from('exam_results')
        .delete()
        .eq('id', id);
      return { data, error };
    }
  },

  // Çalışma saatleri
  studySessions: {
    // Yeni çalışma seansı ekle
    create: async (sessionData) => {
      const { data, error } = await supabase
        .from('study_sessions')
        .insert([sessionData])
        .select();
      return { data, error };
    },

    // Kullanıcının çalışma seanslarını getir
    getByUserId: async (userId, startDate = null, endDate = null) => {
      let query = supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      
      const { data, error } = await query;
      return { data, error };
    }
  },

  // Hedefler
  goals: {
    // Yeni hedef ekle
    create: async (goalData) => {
      const { data, error } = await supabase
        .from('goals')
        .insert([goalData])
        .select();
      return { data, error };
    },

    // Kullanıcının hedeflerini getir
    getByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Hedef güncelle
    update: async (id, goalData) => {
      const { data, error } = await supabase
        .from('goals')
        .update(goalData)
        .eq('id', id)
        .select();
      return { data, error };
    },

    // Hedef sil
    delete: async (id) => {
      const { data, error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
      return { data, error };
    }
  },

  // Yapılacaklar listesi
  todos: {
    // Todo oluştur
    create: async (todoData) => {
      const { data, error } = await supabase
        .from('todos')
        .insert([todoData])
        .select();
      return { data, error };
    },

    // Kullanıcının todo'larını getir
    getByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Todo güncelle
    update: async (id, todoData) => {
      const { data, error } = await supabase
        .from('todos')
        .update(todoData)
        .eq('id', id)
        .select();
      return { data, error };
    },

    // Todo sil
    delete: async (id) => {
      const { data, error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);
      return { data, error };
    }
  },

  // Takvim etkinlikleri
  calendarEvents: {
    // Etkinlik oluştur
    create: async (eventData) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([eventData])
        .select();
      return { data, error };
    },

    // Kullanıcının etkinliklerini getir
    getByUserId: async (userId, startDate = null, endDate = null) => {
      let query = supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId);
      
      if (startDate && endDate) {
        query = query
          .gte('date', startDate)
          .lte('date', endDate);
      }
      
      const { data, error } = await query.order('date', { ascending: true });
      return { data, error };
    },

    // Etkinlik güncelle
    update: async (id, eventData) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(eventData)
        .eq('id', id)
        .select();
      return { data, error };
    },

    // Etkinlik sil
    delete: async (id) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);
      return { data, error };
    },

    // Belirli bir tarihteki etkinlikleri getir
    getByDate: async (userId, date) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('time', { ascending: true });
      return { data, error };
    }
  }
};

export default supabase;