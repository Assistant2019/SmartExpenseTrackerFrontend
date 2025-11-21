import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import TransactionList from '../components/TransactionList'

export default function TransactionsPage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  return <TransactionList />
}
