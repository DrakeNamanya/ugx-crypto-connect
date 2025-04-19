
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConversionForm from './ConversionForm';
import TransferForm from './TransferForm';

const ExchangeCard = () => {
  return (
    <div className="max-w-md mx-auto my-10">
      <Card className="shadow-lg border-2 border-gray-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-ugx-purple">Exchange</CardTitle>
          <CardDescription>Convert between UGX and USDT</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="convert" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="convert">Convert</TabsTrigger>
              <TabsTrigger value="send">Send</TabsTrigger>
              <TabsTrigger value="receive">Receive</TabsTrigger>
            </TabsList>
            <TabsContent value="convert" className="mt-6">
              <ConversionForm />
            </TabsContent>
            <TabsContent value="send" className="mt-6">
              <TransferForm direction="send" />
            </TabsContent>
            <TabsContent value="receive" className="mt-6">
              <TransferForm direction="receive" />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-sm text-gray-500 justify-center">
          <div className="flex items-center gap-2">
            <RefreshCw size={14} className="text-ugx-orange" />
            <span>Rates updated every 5 minutes</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ExchangeCard;
