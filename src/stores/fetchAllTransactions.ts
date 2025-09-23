import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { Transaction } from '@/types';

export async function fetchAllTransactions(): Promise<Transaction[]> {
  const { user } = useAuthStore.getState();
  if (!user) return [];

  let all: Transaction[] = [];
  let from = 0;
  const pageSize = 1000; // fetch in large chunks
  while (true) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) break;
    if (data && data.length > 0) {
      all = all.concat(data);
      if (data.length < pageSize) break;
      from += pageSize;
    } else {
      break;
    }
  }
  return all;
}
