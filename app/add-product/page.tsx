'use client';

import AddProductForm from "@/app/src/addProduct";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../src/firebase";

const AddProduct = () => {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  
  // Checking login user role
  useEffect(() => {
    if (!auth.currentUser) {
      router.replace('/');
      return;
    }
    
    const checkUserRole = async () => {
      const user = auth.currentUser;

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userRole = userSnap.data()?.role;
          setRole(userRole);

          if (userRole !== 'admin') {
            router.push('/');
          }
        } else {
          router.push('/');
        }
      } else {
        router.push('/log-in');
      }
    };

    checkUserRole();
  }, [router]);

  if (role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-10">
        <AddProductForm />
      </div>
    </div>
  );
};

export default AddProduct;
