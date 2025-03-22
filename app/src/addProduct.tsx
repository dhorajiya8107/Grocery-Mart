'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/app/src/firebase';
import { Input } from '@/components/ui/input';
import { Select } from '@radix-ui/react-select';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast, Toaster } from 'sonner';

type Category = {
  id: string;
  name: string;
};

const AddProductForm = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [date, setDate] = useState<Date | undefined>();

  const [form, setForm] = useState({
    productName: '',
    description: '',
    price: '',
    discountedPrice: '',
    buckleNumber: '',
    quantity: '',
    categoryId: '',
    categoryName: '',
    image: null as File | null,
    manufacturedAt: '',
    expiresAt: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'categories'));
        const categoryList: Category[] = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setCategories(categoryList);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
  
    if (name === 'image' && files?.length) {
      setForm(prev => ({ ...prev, image: files[0] }));
    } else if (name === 'categoryId') {
      const selectedCategory = categories.find(cat => cat.id === value);
      setForm(prev => ({
        ...prev,
        categoryId: value,
        categoryName: selectedCategory?.name || '',
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = '';

      if (form.image) {
        if (form.image instanceof File) { 
          const base64Image = await convertToBase64(form.image);
          imageUrl = base64Image;
        } else {
          throw new Error('Image is not a valid file');
        }
      }

      await addDoc(collection(db, 'products'), {
        productName: form.productName,
        description: form.description,
        price: form.price,
        discountedPrice: form.discountedPrice,
        buckleNumber: form.buckleNumber,
        quantity: form.quantity,
        category: form.categoryName,
        imageUrl,
        manufacturedAt: form.manufacturedAt,
        expiresAt: form.expiresAt,
      });

      toast.success('Product added successfully');

      setForm({
        productName: '',
        description: '',
        price: '',
        discountedPrice: '',
        buckleNumber: '',
        quantity: '',
        categoryId: '',
        categoryName: '',
        image: null as File | null,
        manufacturedAt: '',
        expiresAt: '',
      });
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleMDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setForm((prev) => ({
        ...prev,
        manufacturedAt: format(selectedDate, "yyyy-MM-dd"),
      }));
    }
  };

  const handleEDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setForm((prev) => ({
        ...prev,
        expiresAt: format(selectedDate, "yyyy-MM-dd"),
      }));
    }
  };

  return (
    <>
    <Toaster />
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add Product</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

        {/* Product Name */}
        <Input
          type="text"
          name="productName"
          placeholder="Product Name*"
          value={form.productName}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded-md"
        />

        {/* Product Categories Select */}
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Category*</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {/* Product Description */}
        <Input
          type="text"
          name="description"
          placeholder="Description*"
          value={form.description}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded-md"
        />

        {/* Product Image Upload */}
        <Input
          type='file'
          name="image"
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded-md"
        />


        {/* Product Price */}
        <Input
          type="number"
          name="price"
          placeholder="Price*"
          value={form.price}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded-md"
        />

        {/* Product Discounted Price */}
        <Input
          type="number"
          name="discountedPrice"
          placeholder="discountedPrice*"
          value={form.discountedPrice}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded-md"
        />

        {/* <Input
          type="date"
          name="manufacturedAt"
          value={form.manufacturedAt}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded-md"
        /> */}

        {/* Product Manufactured Date */}
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal border border-gray-300 rounded-md"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.manufacturedAt ? format(new Date(form.manufacturedAt), "dd-MM-yyyy") : <span className="text-gray-400">Manufactured Date*</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-0">
              <Calendar
                mode="single"
                selected={form.manufacturedAt ? new Date(form.manufacturedAt) : undefined}
                onSelect={handleMDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Product Buckle Number */}
        <Input
          type="text"
          name="buckleNumber"
          placeholder="Buckle Number*"
          value={form.buckleNumber}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded-md"
        />

        {/* <Input
          type="date"
          name="expiresAt"
          value={form.expiresAt}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded-md"
        /> */}
       
        {/* Product Expires Date */}
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal border border-gray-300 rounded-md"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.expiresAt ? format(new Date(form.expiresAt), "dd-MM-yyyy") : <span className="text-gray-400">Expires Date*</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-0">
              <Calendar
                mode="single"
                selected={form.expiresAt ? new Date(form.expiresAt) : undefined}
                onSelect={handleEDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Product Quantity */}
        <Input
          type="number"
          name="quantity"
          placeholder="Quantity*"
          value={form.quantity}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded-md"
        />

        <div className="col-span-2">
          <Button type="submit" className="w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800">
            Submit
          </Button>
        </div>
      </form>
    </div>
    </>
  );
};

export default AddProductForm;
