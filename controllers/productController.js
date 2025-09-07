import Product from "../models/productSchema.js";

export const createProduct = async (req, res) => {
const user = req.user; //user must be logged in
if (!user) {
    return res.status(401).json({ message: "You are not logged in ⚠" })
};
const { name, price, size, color, description, stock, category } = req.body;
if (!name || !price || !description || !stock || !category || !color || !size) {
    return res.status(400).json({ message: "Please provide all required fields ⚠" });
}
    try {
        const newProduct = new Product({...req.body, userId: user._id, // Associate product with the logged-in user's ID
        });
       
        await newProduct.save();
        res.status(201).json({ message: "Product created successfully! ✅", product: newProduct });
    } catch (error) {
        res.status(500).json({
            message: "oops! something broke, don't worry, we're working on it 🛠️",
            error: error.message,
        });
}};
export const getAllPoducts = async (req, res) => {
    try {
        const products = await Product.find().populate({path: "userId", select: "sellerProfile"}); // Populate user details
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({
            message: "oops! something broke, don't worry, we're working on it 🛠️",
            error: error.message,
        });
    }
};
export const getMyProduct = async (req, res) => {
    const user = req.user; //user must be logged in
    if (!user) {
        return res.status(401).json({ message: "You are not logged in ⚠" })
    };
    try {
        const products = await Product.find({ userId: user._id });
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({
            message: "oops! something broke, don't worry, we're working on it 🛠️",
            error: error.message,
        });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found! ⚠" });
        }
        res.status(200).json({ product });
    } catch (error) {   
        res.status(500).json({
            message: "oops! something broke, don't worry, we're working on it 🛠",
            error: error.message,
        });
    }
};


export const getProductByQuery = async (req, res) => {
  const { name, color, size, description, category, price, stock } = req.query;

  // check if at least one query parameter is provided
  if (!req.query || Object.keys(req.query).length === 0) {
    return res.status(400).json({ message: "Please provide at least one query parameter ⚠️" });
  }

  try {
    const filter = {};

    if (name) filter.name = name;
    if (color) filter.color = color;
    if (size) filter.size = size;
    if (description) filter.description = description;

    if (category) {
      // handle multiple categories separated by comma
      const categories = category.split(",").map(cat => cat.trim().toLowerCase());
      filter.category = { $in: categories };
    }

    if (price) filter.price = Number(price);
    if (stock) filter.stock = Number(stock);

    console.log("Filter criteria:", filter); // Debugging line to check filter criteria

    const filteredProducts = await Product.find(filter);

    if (!filteredProducts || filteredProducts.length === 0) {
      return res.status(404).json({ message: "No products found according to this specification ⚠️" });
    }

    res.status(200).json({ message: "Product(s) found ✅", products: filteredProducts });
  } catch (error) {
    return res.status(500).json({
      message: "Oops! Something broke 🛠️",
      error: error.message,
    });
  }
};
export const updateMyProduct = async (req, res) => {
    const { id } = req.params;
    const userid = req.user._id; // get the logged-in user's ID fro request object
        const { name, price, size, color, description, stock, category } = req.body;
       
        
    try {
        const updatedProduct = await Product.findById(id);
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found! ⚠" });
        }
        else if (updatedProduct.userId.toString() !== userid.toString()) {
            return res.status(403).json({ message: "You can only update your product! ⚠" });
        } else {
            
        // Update only the fields that are provided in the request body using nullish coalescing operator
        updatedProduct.name         = name          ?? updatedProduct.name;
        updatedProduct.price        = price         ?? updatedProduct.price;
        updatedProduct.size         = size          ?? updatedProduct.size;
        updatedProduct.color        = color         ?? updatedProduct.color;
        updatedProduct.description  = description   ?? updatedProduct.description;
        updatedProduct.stock        = stock         ?? updatedProduct.stock;
        updatedProduct.category     = category      ??updatedProduct.category;
        // Save the updated product
        await updatedProduct.save();
        res.status(200).json({ message: "Product updated successfully! ✅", product: updatedProduct });

    }} catch (error) {
        res.status(500).json({
            message: "oops! something broke, don't worry, we're working on it 🛠️",
            error: error.message,
        });
};
};


export const uploadProductImages = async (req, res) => {
    const userid = req.user._id;
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded ⚠️" });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found 🚫" });
    }
     if (product.userId.toString() !== userid.toString()) {
            res.status(403) .json({message: "You can only upload images to your created product! ⚠"})}

    // Map uploaded files to their paths
    const imagePaths = req.files.map(file => file.path);

    // Append them to product's images
    product.images.push(...imagePaths);
    await product.save();

    res.status(200).json({
      message: "Images uploaded successfully 🚀",
      images: product.images,
    });
  } catch (error) {
    res.status(500).json({ message: "Something broke 🛠️", error: error.message });
  }
};

export const deleteProductImage = async (req, res) => {
    const userid = req.user._id;

  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found ⚠️" });

    if (product.userId.toString() !== userid.toString()) {
            res.status(403) .json({message: "you can only delete images of your product! ⚠"})}

    product.images = product.images.filter((img) => !img.includes(req.params.imageName));
    await product.save();

    res.status(200).json({ message: "Image deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed 🛠️", error: err.message });
  }};

export const deleteMyProduct = async (req, res) => {
    const { id } = req.params;
    const userid = req.user._id;
    try {
        const deletedProduct = await Product.findById(id);
        if (!deletedProduct) {
         return res.status(404).json({ message: "Product not found! ⚠" });
        }
        else if (deletedProduct.userId.toString() !== userid.toString()) {
            res.status(403) .json({message: "you can only delete your product! ⚠"})
        }
        else {
            await Product.findByIdAndDelete(id);
            res.status(200) .json({message: "product deleted successfully! ✅"})
           
        }}
       catch (error) {
        res.status(500).json({
            message: "oops! something broke, don't worry, we're working on it 🛠️",
            error: error.message});
}};
