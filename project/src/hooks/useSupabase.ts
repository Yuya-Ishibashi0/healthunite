import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { 
  Facility, 
  NewFacility, 
  UpdateFacility,
  User,
  AuditLog,
  PPEStock 
} from '../types/database';

export function useSupabase() {
  // Facilities
  const getFacilities = useCallback(async () => {
    const { data, error } = await supabase
      .from('facilities')
      .select('*');
    if (error) throw error;
    return data;
  }, []);

  const getFacility = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }, []);

  const createFacility = useCallback(async (facility: NewFacility) => {
    const { data, error } = await supabase
      .from('facilities')
      .insert(facility)
      .select()
      .single();
    if (error) throw error;
    return data;
  }, []);

  const updateFacility = useCallback(async (id: string, updates: UpdateFacility) => {
    const { data, error } = await supabase
      .from('facilities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }, []);

  const deleteFacility = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('facilities')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }, []);

  const updatePPEStock = useCallback(async (id: string, stock: PPEStock) => {
    const { data, error } = await supabase
      .from('facilities')
      .update({ ppe_stock: stock })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }, []);

  // Users
  const getUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    if (error) throw error;
    return data;
  }, []);

  const getUser = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }, []);

  // Audit Logs
  const getAuditLogs = useCallback(async (params?: {
    userId?: string;
    tableName?: string;
    limit?: number;
  }) => {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (params?.userId) {
      query = query.eq('user_id', params.userId);
    }
    if (params?.tableName) {
      query = query.eq('table_name', params.tableName);
    }
    if (params?.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }, []);

  // Auth
  const getCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  }, []);

  return {
    // Facilities
    getFacilities,
    getFacility,
    createFacility,
    updateFacility,
    deleteFacility,
    updatePPEStock,
    
    // Users
    getUsers,
    getUser,
    getCurrentUser,
    
    // Audit Logs
    getAuditLogs,
    
    // Auth
    auth: supabase.auth,
  };
}