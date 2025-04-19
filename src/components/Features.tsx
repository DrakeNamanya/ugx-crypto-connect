
import React from 'react';
import { Wallet, RefreshCw, ArrowDownToLine, ArrowUpFromLine, ShieldCheck } from 'lucide-react';

const features = [
  {
    name: 'Deposit UGX',
    description: 'Easily deposit Ugandan Shillings via mobile money or bank transfer.',
    icon: ArrowDownToLine,
  },
  {
    name: 'Convert to USDT',
    description: 'Instantly convert your UGX to USDT at competitive rates.',
    icon: RefreshCw,
  },
  {
    name: 'Transfer USDT',
    description: 'Send USDT to any wallet address worldwide, quickly and securely.',
    icon: ArrowUpFromLine,
  },
  {
    name: 'Receive USDT',
    description: 'Accept USDT from anywhere and convert it back to UGX.',
    icon: Wallet,
  },
  {
    name: 'Withdraw to Mobile Money',
    description: 'Cash out directly to your mobile money account in minutes.',
    icon: ArrowDownToLine,
  },
  {
    name: 'Secure Transactions',
    description: 'Your funds are protected with industry-leading security measures.',
    icon: ShieldCheck,
  },
];

const Features = () => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-ugx-orange font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for crypto exchange
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            UGXchange provides a seamless experience for exchanging between Ugandan Shillings and USDT.
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-ugx-purple text-white">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                <p className="mt-2 ml-16 text-base text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
