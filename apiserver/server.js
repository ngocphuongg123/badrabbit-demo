const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');


const app = express();
const PORT = 8000;
const jwt = require('jsonwebtoken');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/asmwd208', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// Define category schema and model
const categorySchema = new mongoose.Schema({
  name: String,
  image: String
});
const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  image: String,
  price: Number,
  desc: String
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  fullname: String,
  password: String,
  admin: Boolean,
});
const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);


// CSP header configuration
// app.use(
//   helmet.contentSecurityPolicy({
//     useDefaults: true,
//     directives: {
//       "default-src": ["'self'"],
//       "style-src": ["'self'", 'https://fonts.googleapis.com'],
//       "font-src": ["'self'", 'https://fonts.gstatic.com']
//     }
//   })
// );

// Route cho đường dẫn gốc
app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

// Route for categories

// === Routes for categories ===
app.get('/v1/category', authenToken, async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching categories' });
  }
});

app.get('/v1/category/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).send({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error fetching category' });
  }
});

app.post('/v1/category', async (req, res) => {
  try {
    const newCategory = req.body;
    const category = await Category.create(newCategory);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).send({ message: 'Error creating category' });
  }
});

app.put('/v1/category/:id', async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedCategory) {
      res.json(updatedCategory);
    } else {
      res.status(404).send({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error updating category' });
  }
});

app.delete('/v1/category/:id', async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (deletedCategory) {
      res.status(204).send();
    } else {
      res.status(404).send({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error deleting category' });
  }
});

// === Routes for products ===
app.get('/v1/product', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching products' });
  }
});

app.get('/v1/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).send({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error fetching product' });
  }
});

app.post('/v1/product', async (req, res) => {
  try {
    const newProduct = req.body;
    const product = await Product.create(newProduct);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).send({ message: 'Error creating product' });
  }
});

app.put('/v1/product/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true});
    if (updatedProduct) {
      res.json(updatedProduct);
    } else {
      res.status(404).send({ message: 'Product not found '});
    }
  } catch (error) {
    res.status(500).send({ message: 'Error updating product' });
  }
});

app.delete('/v1/product/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id); // biến này deletedProduct nó khai báo mà k được dùng kìa
    if (deletedProduct) {
      res.status(204).send();
    } else {
      res.status(404).send({message: 'Product not found'});
    }
  } catch (error) {
    res.status(500).send({ message: 'Error deleting product' });
  }
});

// === Routes for accounts ===
// Register API
app.post('/v1/account/add', async (req, res) => {
  try {
    const { name, email, fullname, password, admin } = req.body;

    // Kiểm tra nếu name hoặc email đã tồn tại
    const existingUser = await User.findOne({ $or: [{ name }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'name hoặc email đã tồn tại' });
    }

    // Tạo người dùng mới
    const newUser = new User({ name, email, fullname, password, admin });
    await newUser.save();

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đăng ký', error: error.message });
  }
});

// Login API
app.post('/v1/account/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await User.findOne({name});

    if (!user) {
      return res.status(400).json({ message: 'Người dùng không tồn tại' });
    }

    // Check if the password matches
    if (user.password !== password) {
      return res.status(400).json({ message: 'Mật khẩu không đúng' });
    }

    const accessToken = jwt.sign({ userId: user._id, name: user.name }, 'secretkey', { expiresIn: '30s' });
    const refreshToken = jwt.sign({ userId: user._id, name: user.name }, 'secretkey', { expiresIn: '30d' });

    res.status(200).json({ message: 'Đăng nhập thành công', user,  accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đăng nhập', error: error.message });
  }
});

app.get('/v1/products', async (req, res) => {
  try {
    const { keyword, category } = req.query;
    let query = {};

    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query);
    console.log(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
      const { name, password } = req.body;

      // Kiểm tra xem người dùng có tồn tại không
      const user = await User.findOne({ name });
      if (!user) {
          return res.status(400).json({ message: 'Không tìm thấy tài khoản' });
      }

      // So sánh mật khẩu
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: 'Mật khẩu không trùng' });
      }

      // Tạo JWT token
      const accessToken = jwt.sign({ userId: user._id, name: user.name }, 'secretkey', { expiresIn: '30s' });
      const refreshToken = jwt.sign({ userId: user._id, name: user.name }, 'secretkey', { expiresIn: '30d' });

      res.status(200).json({user, accessToken, refreshToken });
  } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Error logging in user' });
  }
});

app.post('/v1/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
  }

  try {
      const decoded = jwt.verify(refreshToken, 'secretkey');
      const user = await User.findById(decoded.userId);

      if (!user) {
          return res.status(401).json({ message: 'Invalid refresh token' });
      }

      const accessToken = jwt.sign({ userId: user._id, name: user.name }, 'secretkey', { expiresIn: '45s' });
      const newRefreshToken = jwt.sign({ userId: user._id, name: user.name }, 'secretkey', { expiresIn: '30d' });

      res.status(200).json({ user, accessToken, refreshToken: newRefreshToken });
  } catch (error) {
      console.error(error.message);
      res.status(401).json({ message: 'Invalid refresh token' });
  }
});

function authenToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
      const bearerToken = bearerHeader.split(' ')[1];
      req.accessToken = bearerToken;
      jwt.verify(req.accessToken, 'secretkey', (err, authData) => {
          if (err) {
              res.status(403).json({ message: "Không có quyền truy cập" });
          } else {
              next();
          }
      })
  } else {
      res.status(403).json({ message: "Không có quyền truy cập" });
  }
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


