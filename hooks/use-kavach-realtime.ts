'use client';
// Supabase Realtime hook for KAVACH pipeline events
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { PipelineEvent, KavachScan } from '@/lib/kavach/types';

export function useKavachRealtime(scanId: string | null) {
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const [scan, setScan] = useState<KavachScan | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchInitialData = useCallback(async () => {
    if (!scanId) return;
    const supabase = createClient();
    const { data: scanData } = await supabase.from('kavach_scans')
      .select('*, assigned_tier:license_tiers(*)').eq('id', scanId).single();
    if (scanData) setScan(scanData as any);
    const { data: eventsData } = await supabase.from('pipeline_events')
      .select('*').eq('scan_id', scanId).order('created_at', { ascending: true });
    if (eventsData) setEvents(eventsData as PipelineEvent[]);
  }, [scanId]);

  useEffect(() => {
    if (!scanId) return;
    fetchInitialData();
    const supabase = createClient();

    const eventsChannel = supabase.channel(`pipeline-events-${scanId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'pipeline_events',
        filter: `scan_id=eq.${scanId}`,
      }, (payload) => {
        setEvents(prev => [...prev, payload.new as PipelineEvent]);
      })
      .subscribe((status) => { setIsConnected(status === 'SUBSCRIBED'); });

    const scanChannel = supabase.channel(`kavach-scan-${scanId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'kavach_scans',
        filter: `id=eq.${scanId}`,
      }, (payload) => {
        setScan(prev => prev ? { ...prev, ...payload.new } as KavachScan : payload.new as KavachScan);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(scanChannel);
    };
  }, [scanId, fetchInitialData]);

  return { events, scan, isConnected };
}
