
//multerconnection
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({ storage: storage }); 
  
  
  app.post('/upload/:id', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
  
    const filePath = req.file.path;
    const userDetail = req.params.id;
  
    // Convert the data according to their index number
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
  
    // Convert into JSON format
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
    // Remove the header row
    const headers = jsonData.shift();
  
    try {
      for (const row of jsonData) {
        const itemData = {};
        headers.forEach((header, index) => {
          const value = row[index] !== '' ? row[index] : undefined;
          itemData[header.toLowerCase()] = value;
        });
  
        itemData.user = userDetail;
  
        // Check if barcode is unique to that particular user
        if (itemData.barcode) {
          const existingInventory = await Inventory.findOne({
            barcode: itemData.barcode,
            user: userDetail,
          });
          if (existingInventory) {
            console.error('Product with this barcode already exists');
            continue;
          }
        }
  
        // Create and save the inventory item
        const inventory = new Inventory(itemData);
        await inventory.save();
        console.log('Item saved:', inventory);
      }
  
      // Success message
      res.json({ message: 'File uploaded successfully' });
    } catch (error) {
      console.error('Failed to save items:', error);
      res.status(500).json({ message: 'Failed to save items' });
    }
  });