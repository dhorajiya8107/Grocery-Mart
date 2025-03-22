'use client';

import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../src/firebase';
import { toast, Toaster } from 'sonner';
import { Dialog, DialogClose, DialogContent, DialogOverlay, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface Category {
  id: string;
  name: string;
  order: number;
}

const AddCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [error, setError] = useState('');

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

  // Fetch categories data form firestore
  useEffect(() => {
    const fetchCategories = async () => {
      if (!userId) return;

      try {
        const collectionRef = collection(db, 'categories');
        const querySnapshot = await getDocs(collectionRef);

        const fetchedCategories = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          order: doc.data().order,
        }));

        setCategories(fetchedCategories.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error('Error fetching categories: ', error);
      }
    };

    fetchCategories();
  }, [userId]);

  // Handle add new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setError('Category name is required');
      return;
    }

    if (newCategory.trim().length < 3) {
      setError('Category name must be at least 3 characters long');
      return;
    }

    const isDuplicate = categories.some(
      (cat) => cat.name.toLowerCase() === newCategory.toLowerCase()
    );

    if (isDuplicate) {
      toast.info(`Category "${newCategory}" already exists!`)
      return;
    }

    try {
      const collectionRef = collection(db, 'categories');
      const order = categories.length + 1;

      const newDoc = await addDoc(collectionRef, {
        name: newCategory,
        order,
      });

      setCategories([...categories, { id: newDoc.id, name: newCategory, order }]);
      setOpenAddDialog(false);
      setNewCategory('');
      setError('');
      console.log(`Added category: ${newCategory}`);
      toast.success(`Added category: ${newCategory}`)
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  // Handle delete category
  const handleDeleteCategory = async (id: string) => {
    try {
      const collectionRef = collection(db, 'categories');
      const categoryName = categories.find((cat) => cat.id === id)?.name;
      await deleteDoc(doc(collectionRef, id));

      const updatedCategories = categories
        .filter((cat) => cat.id !== id)
        .map((cat, index) => ({
          ...cat,
          order: index + 1,
        }));

      for (const cat of updatedCategories) {
        const docRef = doc(collectionRef, cat.id);
        await updateDoc(docRef, { order: cat.order });
      }

      setCategories(updatedCategories);
      console.log(`Deleted category and updated order`);
      toast.info(`Deleted category name ${categoryName}`)
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // For opening edit dialog
  const openEditDialog = (category: Category) => {
    setEditCategory(category);
  };

  // Handle update category
  const handleUpdateCategory = async () => {
    if (!editCategory?.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      const collectionRef = collection(db, 'categories');
      const docRef = doc(collectionRef, editCategory.id);

      await updateDoc(docRef, { name: editCategory.name });

      setCategories(
        categories.map((cat) =>
          cat.id === editCategory.id ? { ...cat, name: editCategory.name } : cat
        )
      );

      setEditCategory(null);
      setError('');
      toast.success(`Updated category: ${editCategory.name}`);
    } catch (error) {
      console.error('Error updating category:', error);
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
    return <div>Please log in to add categories.</div>;
  }

  return (
    <>
      <Toaster />
      <div className='pt-10 pb-20'>
        <div className="p-4 max-w-[900px] mx-auto shadow-lg">
          <div className="gap-2 mb-4">
            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <div className='flex items-center justify-between'>
              <p className="text-lg font-bold">Manage Caddtegories</p>
              <DialogTrigger asChild>
                <Button
                  className="text-white bg-green-700 hover:bg-green-700 px-6 text-md border cursor-pointer"
                  onClick={() => {
                    setNewCategory('');
                    setError('');
                  }}
                >
                  Add
                </Button>
              </DialogTrigger>
            </div>
              <DialogContent>
                <div className="flex flex-col gap-4">
                  <DialogTitle className="text-lg font-semibold">Add New Category</DialogTitle>
                  <Input
                    type="text"
                    value={newCategory}
                    onChange={(e) => {
                      setNewCategory(e.target.value);
                      setError('');
                    }}
                    className={`border ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    // className="border border-gray-300 px-3 py-2 rounded w-full"
                    placeholder="Category name"
                    required
                  />
                  {error && <span className="text-red-500 text-sm">{error}</span>}
                  <div className="flex justify-end items-center gap-2">
                    <DialogClose asChild>
                      <Button className="bg-gray-300 text-gray-500 hover:bg-gray-300 cursor-pointer">
                        Cancel
                      </Button>
                    </DialogClose>
                      <Button onClick={handleAddCategory}
                        className="bg-green-700 hover:bg-green-700 text-white px-6 cursor-pointer"
                      >
                        Add
                      </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <ul className="space-y-2 text-sm">
            {categories.map((category) => (
              <li
                key={category.id}
                className="items-center justify-between flex border-t border-gray-200 py-4"
              >
                <div>
                  <span className=''>
                    {category.order}. {category.name}
                  </span>
                </div>
                <div className="gap-2 justify-between flex">
                  <Dialog>
                    <div className='flex justify-end items-center gap-2'>
                      <DialogTrigger asChild>
                        <div className=''>
                          <Button
                            className="text-blue-500 bg-blue-100 hover:bg-blue-100 border-blue-500 border cursor-pointer"
                            onClick={() => {
                              openEditDialog(category);
                              setError('');
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </DialogTrigger>
                    </div>
                    <DialogContent>
                      <div className="flex flex-col gap-4">
                        <DialogTitle className="text-lg font-semibold">Edit Category</DialogTitle>
                        <Input
                          type="text"
                          value={editCategory?.name || ''}
                          onChange={(e) => {
                            setEditCategory((prev) => prev ? { ...prev, name: e.target.value } : null);
                            setError('');
                          }}
                          // className="border border-gray-300 px-3 py-2 rounded w-full"
                          placeholder="Category name"
                          required
                        />
                        {error && <span className="text-red-500 text-sm">{error}</span>}
                        <div className="flex justify-end items-center gap-2">
                          <DialogClose asChild>
                            <Button className="bg-gray-300 text-gray-800 hover:bg-gray-300 cursor-pointer">
                              Cancel
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                          <Button
                            onClick={handleUpdateCategory}
                            className="bg-green-700 text-white hover:bg-green-700 cursor-pointer px-6 py-2"
                          >
                            Save
                          </Button>
                          </DialogClose>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="text-red-500 bg-red-100 hover:bg-red-100 border-red-500 border cursor-pointer"
                      >
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle className="text-lg font-semibold">Confirm Deletion</DialogTitle>
                      <p>Are you sure you want to delete this category?</p>
                      <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                          <Button className="bg-gray-300 text-gray-800 hover:bg-gray-300 cursor-pointer">
                            Cancel
                          </Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="bg-red-500 text-white hover:bg-red-500 cursor-pointer px-4"
                          >
                            Delete
                          </Button>
                        </DialogClose>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                {/* <Button
              onClick={() => handleDeleteCategory(category.id)}
              className="text-red-500  bg-red-100 border-red-500 border rounded-md px-3 py-2"
            >
              Delete
            </Button> */}
              </li>
            ))}
          </ul>
          <p className='border-b'></p>
        </div>
      </div>
    </>
  );
};

export default AddCategories;
