import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [flaggedTransactions, setFlaggedTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Fetch dashboard statistics
      const statsResponse = await fetch('http://localhost:3001/api/expenses/dashboard', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch flagged transactions
      const flaggedResponse = await fetch('http://localhost:3001/api/expenses/flagged', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (flaggedResponse.ok) {
        const flaggedData = await flaggedResponse.json()
        setFlaggedTransactions(flaggedData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Navigation Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Smart Tax Manager</h1>
            <p className="text-gray-600">AI-Powered Expense Tracking</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/scan" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              Scan Receipt
            </Link>
            <Link href="/transactions" className="text-gray-700 hover:text-gray-900 px-4 py-2">
              View Transactions
            </Link>
            <button
              onClick={handleSignOut}
              className="text-red-600 hover:text-red-700 px-4 py-2"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {stats ? (
        <div className="space-y-6">
          {/* Your existing dashboard stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600">Total Expenses YTD</h3>
              <p className="text-2xl font-bold">₹{stats.totalExpensesYTD?.toLocaleString() || '0'}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600">Total GST Claimed</h3>
              <p className="text-2xl font-bold">₹{stats.totalGSTClaimed?.toLocaleString() || '0'}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600">Other Taxes Paid</h3>
              <p className="text-2xl font-bold">₹{stats.totalOtherTaxes?.toLocaleString() || '0'}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600">Risk Score Average</h3>
              <p className="text-2xl font-bold">{stats.riskScoreAverage || '0'}/10</p>
            </div>
          </div>

          {/* Quick Action Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/scan" className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700">
                <div className="text-lg font-semibold">📸 Scan New Receipt</div>
                <div className="text-sm opacity-90">Upload and analyze receipt</div>
              </Link>
              
              <Link href="/transactions" className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700">
                <div className="text-lg font-semibold">📊 View All Transactions</div>
                <div className="text-sm opacity-90">See complete expense history</div>
              </Link>
              
              <div className="bg-purple-600 text-white p-4 rounded-lg text-center">
                <div className="text-lg font-semibold">📈 Analytics</div>
                <div className="text-sm opacity-90">Spending insights & reports</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-bold mb-4">Welcome to Smart Tax Manager!</h3>
          <p className="text-gray-600 mb-6">Start by scanning your first receipt to track expenses and identify financial leakages.</p>
          <Link href="/scan" className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 text-lg font-medium">
            Scan Your First Receipt
          </Link>
        </div>
      )}
    </div>
  )
}
