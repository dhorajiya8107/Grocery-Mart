'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './src/firebase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import HomePageImage from '../images/Home/HomePage.png';
import HomePageImage1 from '../images/Home/HomePage1.avif';
import HomePageImage2 from '../images/Home/Homepage2.avif';
import { Button } from '@/components/ui/button';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation, Autoplay, Parallax } from 'swiper/modules';
import CarbonCrunchFeatures from '@/components/crunch-features';
import ServicesSection from '@/components/services-section';


const App = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 border-4 border-gray-300 border-t-green-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="relative flex items-center justify-center min-h-screen px-6">
        <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 bg-green-700 text-white px-4 py-1 rounded-full w-fit mb-6 shadow-md">
               <svg viewBox="0 0 151.5 154.5" preserveAspectRatio="xMidYMid meet" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex-shrink-0">
                <g>
                  <path
                    fillOpacity="1"
                    fill="green"
                    d="M 35.5,-0.5 C 62.1667,-0.5 88.8333,-0.5 115.5,-0.5C 135.833,3.16667 147.833,15.1667 151.5,35.5C 151.5,63.1667 151.5,90.8333 151.5,118.5C 147.833,138.833 135.833,150.833 115.5,154.5C 88.8333,154.5 62.1667,154.5 35.5,154.5C 15.1667,150.833 3.16667,138.833 -0.5,118.5C -0.5,90.8333 -0.5,63.1667 -0.5,35.5C 3.16667,15.1667 15.1667,3.16667 35.5,-0.5 Z"
                  ></path>
                </g>
                <g> 
                  <path
                    fillOpacity="0.93"
                    fill="white"
                    d="M 41.5,40.5 C 45.8333,40.5 50.1667,40.5 54.5,40.5C 57.0108,51.5431 59.6775,62.5431 62.5,73.5C 74.1667,73.5 85.8333,73.5 97.5,73.5C 99.4916,67.1906 101.492,60.8573 103.5,54.5C 91.8476,53.6675 80.1809,53.1675 68.5,53C 65.8333,51 65.8333,49 68.5,47C 82.1667,46.3333 95.8333,46.3333 109.5,47C 110.578,47.6739 111.245,48.6739 111.5,50C 108.806,60.4206 105.139,70.4206 100.5,80C 88.8381,80.4999 77.1714,80.6665 65.5,80.5C 65.2865,82.1439 65.6198,83.6439 66.5,85C 78.5,85.3333 90.5,85.6667 102.5,86C 111.682,90.8783 113.516,97.7117 108,106.5C 99.0696,112.956 92.0696,111.289 87,101.5C 86.2716,98.7695 86.4383,96.1029 87.5,93.5C 83.2047,92.3391 78.8713,92.1725 74.5,93C 77.4896,99.702 75.8229,105.035 69.5,109C 59.4558,111.977 53.4558,108.31 51.5,98C 51.8236,93.517 53.8236,90.017 57.5,87.5C 58.6309,85.9255 58.7975,84.2588 58,82.5C 55,71.1667 52,59.8333 49,48.5C 46.2037,47.7887 43.3704,47.122 40.5,46.5C 39.2291,44.1937 39.5624,42.1937 41.5,40.5 Z"
                  ></path>
                </g>
              </svg> 
              <span className="text-sm font-semibold">Your Favorite Grocery Store</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-800 mb-6">
              Get fresh groceries delivered with <br />
              <span className="inline-block bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg">
                GROCERY MART
              </span>
            </h1>

            <p className="text-gray-600 text-lg mb-10 leading-relaxed">
              <span className="text-green-700 font-bold">Fast & Fresh</span> – Quality groceries delivered right to your door.
            </p>

            <div className="flex gap-4">
              <Button
                className="text-green-700 border border-green-600 px-6 py-6 rounded-lg font-medium bg-green-50 hover:bg-green-100 transition-all duration-300 shadow-md"
                onClick={() => router.push('/categories/Vegetables%20%26%20Fruits')}
              >
                Shop Now
              </Button>
              <Button
                className="bg-green-700 text-white px-6 py-6 rounded-lg font-medium hover:bg-green-700 transition-all duration-300 shadow-md"
                onClick={() => router.push('/')}
              >
                Learn More
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <Swiper
              modules={[Autoplay, Navigation, Pagination, Parallax]}
              spaceBetween={30}
              slidesPerView={1}
              loop={true}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              // navigation
              pagination={{ clickable: true }}
              parallax      
              className="w-full"
            >
              <SwiperSlide>
                <Image
                  src={HomePageImage}
                  alt="Grocery Delivery"
                  layout="responsive"
                  width={500}
                  height={400}
                  className="bg-gray-100 shadow-black/50 transition-transform duration-300 rounded-lg"
                />
              </SwiperSlide>
              <SwiperSlide>
                <Image
                  src={HomePageImage1}
                  alt="Grocery Delivery 2"
                  layout="responsive"
                  width={500}
                  height={400}
                  className="bg-gray-100 shadow-black/50 transition-transform duration-300 rounded-lg"
                />
              </SwiperSlide>
              <SwiperSlide>
                <Image
                  src={HomePageImage2}
                  alt="Grocery Delivery 3"
                  layout="responsive"
                  width={500}
                  height={400}
                  className="bg-gray-100 shadow-black/50 transition-transform duration-300 rounded-lg"
                />
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </div>
      <div>
        <CarbonCrunchFeatures />
      </div>
      <div>
        <ServicesSection />
      </div>
    </div>
  );
};

export default App;
