import React from 'react';
import { Link } from 'react-router-dom';
import { Bitcoin, DollarSign } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const Hero = () => {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 bg-white pb-8 sm:pb-16 md:pb-20 lg:w-full lg:max-w-2xl lg:pb-28 xl:pb-32">
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="sm:text-center lg:text-left pt-10 sm:pt-12 md:pt-16 lg:pt-20 xl:pt-28">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Uganda's Premier</span>{' '}
                <span className="block text-ugx-purple xl:inline">Crypto Exchange</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg md:mt-5 md:text-xl lg:mx-0">
                Convert between UGX and USDT, send and receive crypto, and withdraw to mobile money with Uganda's most trusted exchange platform.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link
                    to="/register"
                    className="ugx-button-primary w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md md:py-4 md:text-lg md:px-10"
                  >
                    Get Started
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <a
                    href="#features"
                    className="ugx-button-secondary w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md md:py-4 md:text-lg md:px-10"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="h-56 w-full sm:h-72 md:h-96 lg:h-full relative bg-gradient-to-r from-ugx-purple to-ugx-blue opacity-90">
          <Carousel className="w-full h-full" opts={{ loop: true, duration: 20 }}>
            <CarouselContent>
              <CarouselItem className="flex items-center justify-center p-6">
                <div className="flex items-center justify-center space-x-4 animate-bounce">
                  <Bitcoin className="h-16 w-16 text-yellow-500" />
                  <DollarSign className="h-16 w-16 text-green-500" />
                </div>
              </CarouselItem>
              <CarouselItem className="flex items-center justify-center p-6">
                <div className="flex items-center justify-center space-x-4 animate-pulse">
                  <img 
                    src="https://cryptologos.cc/logos/tether-usdt-logo.png"
                    alt="USDT"
                    className="h-16 w-16"
                  />
                  <img 
                    src="https://cryptologos.cc/logos/ethereum-eth-logo.png"
                    alt="ETH"
                    className="h-16 w-16"
                  />
                </div>
              </CarouselItem>
              <CarouselItem className="flex items-center justify-center p-6">
                <div className="grid grid-cols-2 gap-4 place-items-center animate-fade-in">
                  <Bitcoin className="h-16 w-16 text-yellow-500" />
                  <img 
                    src="https://cryptologos.cc/logos/tether-usdt-logo.png"
                    alt="USDT"
                    className="h-16 w-16"
                  />
                  <img 
                    src="https://cryptologos.cc/logos/ethereum-eth-logo.png"
                    alt="ETH"
                    className="h-16 w-16"
                  />
                  <DollarSign className="h-16 w-16 text-green-500" />
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default Hero;
