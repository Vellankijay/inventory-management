'use client'

import { useState, useEffect, useRef } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import Webcam from 'react-webcam'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'
import "./globals.css";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [webcamOpen, setWebcamOpen] = useState(false);
  const webcamRef = useRef(null);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data()
      })
    })
    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }
  
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const deleteItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      await deleteDoc(docRef)
    }
    await updateInventory()
  }

  const filterInventory = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    const filteredList = inventory.filter(item =>
      item.name.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredInventory(filteredList);
  };

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage * itemsPerPage < filteredInventory.length) {
      setCurrentPage(prevPage => prevPage + 1);
    }
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const captureAndUploadImage = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    
    // Store image directly in Firestore
    await setDoc(doc(collection(firestore, 'pictures')), {
      image: imageSrc,
      createdAt: new Date(),
    });

    handleWebcamClose();
  };

  const handleWebcamClose = () => {
    setWebcamOpen(false);
  };

  useEffect(() => {
    updateInventory()
  }, [])

  useEffect(() => {
    filterInventory(searchQuery);
  }, [searchQuery, inventory]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                setOpen(false);
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={webcamOpen}
        onClose={handleWebcamClose}
        aria-labelledby="webcam-modal-title"
        aria-describedby="webcam-modal-description"
      >
        <Box sx={style}>
          <Typography id="webcam-modal-title" variant="h6" component="h2">
            Capture Image
          </Typography>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
          />
          <Button
            variant="contained"
            onClick={captureAndUploadImage}
            sx={{ mt: 2 }}
          >
            Capture
          </Button>
        </Box>
      </Modal>

      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="Search Items"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
        />
        <Button variant="contained" onClick={() => setOpen(true)} sx={{ width: 150, height: '56px' }}>
          Add New Item
        </Button>
        <Button className="camera-button" onClick={() => setWebcamOpen(true)} sx={{ width: 150, height: '56px' }}/>
      </Stack>

      <Box border={'1px solid #333'} width="800px">
        <Box
          width="100%"
          height="100px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="100%" height="300px" spacing={2} overflow={'auto'}>
          {paginatedInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              paddingX={5}
            >
              <Typography variant={'h5'} color={'#333'} textAlign={'center'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Stack direction="row" alignItems="center">
                <Button onClick={() => addItem(name)}>↑</Button>
                <Typography variant={'h5'} color={'#333'} textAlign={'center'} mx={1}>
                  Quantity: {quantity}
                </Typography>
                <Button onClick={() => removeItem(name)}>↓</Button>
              </Stack>
              <Button variant="contained" color="error" onClick={() => deleteItem(name)}>
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
        <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
          <Button onClick={() => handlePageChange("prev")} disabled={currentPage === 1}>
            Previous
          </Button>
          <Typography variant="body1" mx={2}>
            Page {currentPage} of {Math.ceil(filteredInventory.length / itemsPerPage)}
          </Typography>
          <Button onClick={() => handlePageChange("next")} disabled={currentPage * itemsPerPage >= filteredInventory.length}>
            Next
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
