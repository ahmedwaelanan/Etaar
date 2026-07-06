import { createServerSupabaseClient } from '@/lib/supabase-server'
import NotificationFormClient from './NotificationFormClient'

export default async function AdminNotificationsPage() {
  const supabase = createServerSupabaseClient()
  const { data: users } = await supabase.rpc('get_all_users')

  return <NotificationFormClient users={(users as any) ?? []} />
}