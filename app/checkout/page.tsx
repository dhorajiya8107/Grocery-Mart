'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams  } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, runTransaction, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../src/firebase';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import successAnimation from '../../animation/Animation - 1742460011298.json';
import  Lottie  from 'lottie-react';

interface Product {
  id: string;
  productName: string;
  price: number;
  discountedPrice: number;
  imageUrl: string;
  quantity: number;
  description: string;
}

const CheckoutPage = () => {
  const [cart, setCart] = useState<Product[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card');
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const router = useRouter();
  const auth = getAuth();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const Payment_Methods = ['Credit Card', 'Debit Card', 'UPI', 'Net Banking'];

  // If user is login then set userId otherwise null
  useEffect(() => {
      const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          setUserId(null); 
         if (!auth.currentUser) {
          router.replace('/');
         return;
        }
        }
        setLoading(false);
      });
  
      return () => unsubscribe();
    }, []);

  // Fetch the orders data from firestore to find orderId
  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        try {
          const orderRef = doc(db, 'orders', orderId);
          const orderSnap = await getDoc(orderRef);

          if (orderSnap.exists()) {
            setOrder(orderSnap.data());
          } else {
            console.log('Order not found');
          }
        } catch (error) {
          console.error('Error fetching order:', error);
        }
      }
    };

    fetchOrder();
  }, [orderId]);

  // Fetch cart data from firestore
  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) return;

      try {
        const cartRef = doc(db, 'cart', userId);
        const cartDoc = await getDoc(cartRef);

        if (cartDoc.exists()) {
          const cartData = cartDoc.data();
          if (cartData?.products) {
            const updatedProducts = cartData.products.map((product: Product) => {
              const discountedPrice = isNaN(Number(product.discountedPrice))
                ? product.price
                : product.discountedPrice;

              return {
                ...product,
                discountedPrice,
              };
            });

            setCart(updatedProducts);
          }
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    if (userId) {
      fetchCart();
    }
  }, [userId]);


  // Total amount of items added in the cart
  const totalAmount = cart.reduce((total, product) => {
    const discountedPrice = isNaN(Number(product.discountedPrice))
      ? 0
      : product.discountedPrice;

    return total + discountedPrice * product.quantity;
  }, 0);

  //Total item added to cart
  const totalItems = cart.reduce((total, product) => total + (Number(product.quantity) || 0), 0);

  // Handle payment from user
  const handleConfirmPayment = async () => {
    try {
      if (orderId && order) {
        const orderRef = doc(db, 'orders', orderId);
  
        await updateDoc(orderRef, {
          paymentStatus: 'Paid',
        });
  
        const paymentRef = doc(collection(db, 'payment'));
        const paymentId = paymentRef.id;
  
        await setDoc(paymentRef, {
          paymentId,
          orderId,
          userId: order.userId,
          totalAmount: order.totalAmount,
          paymentMethod,
          createdAt: new Date().toISOString(),
        });
  
        // Reduce quantity of each product in the order
        for (const product of order.products) {
          const productRef = doc(db, 'products', product.id);
          await runTransaction(db, async (transaction) => {
            const productDoc = await transaction.get(productRef);
            if (productDoc.exists()) {
              const currentQuantity = productDoc.data().quantity || 0;
              const newQuantity = currentQuantity - product.quantity;
  
              if (newQuantity < 0) {
                throw new Error(`Not enough stock for product ${product.productName}`);
              }
  
              transaction.update(productRef, { quantity: newQuantity });
            }
          });
        }

        localStorage.removeItem('lastOrderId');
  
        // Clear the cart
        const cartRef = doc(db, 'cart', order.userId);
        await setDoc(cartRef, { products: [] });
  
        console.log('Payment successful!');
        setPaymentSuccess(true);
        setIsPopoverOpen(false);
  
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 border-4 border-gray-300 border-t-green-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userId) {
    return <div className='text-center text-2xl pt-30'>Please log in to continue to checkout.</div>;
  }

  return (
    <div className="bg-gray-50 w-full min-h-screen pt-2 ">
      <div className="container mx-auto p-4 xl:pl-32 xl:pr-32">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <div className="bg-white rounded-lg shadow-md text-gray-500">
          <div className='text-lg justify-between flex p-8 border-b pr-10 bg-gray-100'>
            <p className='font-bold text-xl'>My Cart</p>
            <p>{totalItems} items</p>
          </div>
          {cart.map((product) => (
            <div key={product.id} className="flex items-center justify-between border-b p-4 pr-10">
              <div className="flex items-center">
                <p className='text-lg p-6 pr-12'>{product.quantity}</p>
                <img src={product.imageUrl} alt={product.productName} className="w-32 h-32 object-cover mr-4 max-[640px]:w-20 max-[640px]:h-20" />
                <div>
                  <p className="min-[640px]:text-xl font-semibold text-lg">{product.productName}</p>
                  <p className='min-[640px]:text-lg text-sm'>{product.description}</p>
                  <p className="font-semibold">₹{product.discountedPrice}</p>
                </div>
              </div>
              <p className="text-lg font-bold hidden sm:block">₹{(product.discountedPrice * product.quantity)}</p>
            </div>
          ))}

          {/* <div className="flex justify-between font-bold text-lg p-4 pr-10">
            <p>Total:</p>
            <p>₹{totalAmount}</p>
          </div> */}

          {/* Popover will be open when user click on Proceed to Payment button */}
          <Dialog open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <DialogTrigger asChild>
              {/* By clicking to pay now it trigger */}
              <div className='justify-center flex p-4'>
                <button
                  className="w-100 h-14 bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition duration-300 shadow-md"
                >
                Pay Now (Total: ₹{totalAmount})
              </button>
              </div>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Payment Method</DialogTitle>
                <DialogDescription>
                  Please select a payment method to complete your order.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {Payment_Methods.map((method) => (
                  <div
                    key={method}
                    className={`cursor-pointer p-3 border rounded-md ${
                      paymentMethod === method ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod(method)}
                  >
                    {method}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-between items-center">
                <p className="font-bold">Total: ₹{totalAmount}</p>
                <button
                  onClick={handleConfirmPayment}
                  className="bg-green-700 text-white py-2 px-4 rounded-md hover:bg-green-800 transition"
                >
                  Confirm Payment
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* After payment will be success */}
      {paymentSuccess && (
        <div className="fixed inset-0 bg-gray-200 flex justify-center items-center">
          <div className="bg-white w-96 p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className='flex justify-between items-center mb-2'>
              <h2 className="text-xl font-bold text-green-700">Payment Successful!</h2>
              <Lottie 
                animationData={successAnimation}
                loop={false}
                style={{ width: 50, height: 50}}
              />
            </div>
            <p>Your order has been placed successfully.</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 bg-green-700 text-white py-2 w-full rounded-md hover:bg-green-800"
            >
              Go to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
