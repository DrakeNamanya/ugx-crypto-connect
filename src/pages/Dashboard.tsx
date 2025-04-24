
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownUp, ArrowUp, ArrowDown, DollarSign, RefreshCw, UserCheck, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ExchangeCard from '@/components/ExchangeCard';
import DepositForm from '@/components/DepositForm';
import WithdrawalForm from '@/components/WithdrawalForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  isKYCVerified, 
  isKYCSubmitted, 
  isAccountBlocked,
  showKYCReminderIfNeeded 
} from '@/services/kycVerification';
import { toast } from '@/components/ui/sonner';

// Mock transaction data
const transactions = [
  { id: 1, type: 'Deposit', amount: '1,000,000', currency: 'UGX', date: '2025-04-15', status: 'Completed' },
  { id: 2, type: 'Convert', amount: '269.05', currency: 'USDT', date: '2025-04-15', status: 'Completed' },
  { id: 3, type: 'Send', amount: '200', currency: 'USDT', date: '2025-04-14', status: 'Completed' },
  { id: 4, type: 'Receive', amount: '500', currency: 'USDT', date: '2025-04-12', status: 'Completed' },
  { id: 5, type: 'Withdraw', amount: '1,850,000', currency: 'UGX', date: '2025-04-12', status: 'Completed' },
];

const Dashboard = () => {
  const kycVerified = isKYCVerified();
  const kycSubmitted = isKYCSubmitted();
  const accountBlocked = isAccountBlocked();
  
  useEffect(() => {
    if (accountBlocked) {
      toast.error(
        'Your account has been restricted',
        {
          description: 'Please complete identity verification to continue using UGXchange',
          action: {
            label: 'Verify Now',
            onClick: () => window.location.href = '/kyc-verification',
          },
          duration: 0, // Don't auto-dismiss
        }
      );
    } else {
      showKYCReminderIfNeeded();
    }
  }, [accountBlocked]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-2">
              {kycVerified ? (
                <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <UserCheck size={16} className="mr-1" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              ) : kycSubmitted ? (
                <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  <RefreshCw size={16} className="mr-1" />
                  <span className="text-sm font-medium">Pending Verification</span>
                </div>
              ) : (
                <Link to="/kyc-verification">
                  <Button size="sm" variant="outline" className="flex items-center">
                    <UserX size={16} className="mr-1 text-red-500" />
                    <span>Verify Identity</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          {!kycVerified && (
            <Card className="mb-6 bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <UserCheck className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-amber-800">Verification Required</h3>
                    <p className="text-amber-700 mt-1 text-sm">
                      Unverified accounts can only deposit up to 200,000 UGX and withdraw up to 50,000 UGX.
                    </p>
                    <Link to="/kyc-verification">
                      <Button size="sm" variant="outline" className="mt-2 bg-white border-amber-300 hover:bg-amber-100">
                        Complete Verification
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
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
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Operations</CardTitle>
                  <CardDescription>Deposit or withdraw funds from your wallet</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="deposit" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="deposit">Deposit</TabsTrigger>
                      <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                    </TabsList>
                    <TabsContent value="deposit" className="mt-4">
                      <DepositForm />
                    </TabsContent>
                    <TabsContent value="withdraw" className="mt-4">
                      <WithdrawalForm />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Exchange</CardTitle>
                  <CardDescription>Convert between UGX and USDT</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExchangeCard />
                </CardContent>
              </Card>
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
