
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownUp, CreditCard, ArrowUp, ArrowDown, DollarSign, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ExchangeCard from '@/components/ExchangeCard';

// Mock transaction data
const transactions = [
  { id: 1, type: 'Deposit', amount: '1,000,000', currency: 'UGX', date: '2025-04-15', status: 'Completed' },
  { id: 2, type: 'Convert', amount: '269.05', currency: 'USDT', date: '2025-04-15', status: 'Completed' },
  { id: 3, type: 'Send', amount: '200', currency: 'USDT', date: '2025-04-14', status: 'Completed' },
  { id: 4, type: 'Receive', amount: '500', currency: 'USDT', date: '2025-04-12', status: 'Completed' },
  { id: 5, type: 'Withdraw', amount: '1,850,000', currency: 'UGX', date: '2025-04-12', status: 'Completed' },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">UGX Balance</CardTitle>
                <ArrowDownUp size={16} className="text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">UGX 2,450,000</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">USDT Balance</CardTitle>
                <DollarSign size={16} className="text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">USDT 652.30</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Exchange Rate</CardTitle>
                <RefreshCw size={16} className="text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1 USDT = UGX 3,700</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <ExchangeCard />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your recent activity on UGXchange</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'Deposit' || transaction.type === 'Receive' 
                              ? 'bg-green-100 text-green-700' 
                              : transaction.type === 'Convert'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                          }`}>
                            {transaction.type === 'Deposit' && <ArrowDown size={16} />}
                            {transaction.type === 'Withdraw' && <ArrowUp size={16} />}
                            {transaction.type === 'Convert' && <RefreshCw size={16} />}
                            {transaction.type === 'Send' && <ArrowUp size={16} />}
                            {transaction.type === 'Receive' && <ArrowDown size={16} />}
                          </div>
                          <div>
                            <div className="font-medium">{transaction.type}</div>
                            <div className="text-sm text-gray-500">{transaction.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {transaction.amount} {transaction.currency}
                          </div>
                          <div className={`text-sm ${
                            transaction.status === 'Completed' ? 'text-green-600' : 'text-amber-600'
                          }`}>
                            {transaction.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full text-ugx-purple font-medium mt-4 py-2 text-center">
                    View All Transactions
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
