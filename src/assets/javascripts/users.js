const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb'); // Import ObjectId từ thư viện mongodb
const connectDb = require('../models/db');


router.get('/', async (req, res, next)=> {
  const db=await connectDb();
  const usersCollection = db.collection('users');
  const users = await usersCollection.find().toArray();
  res.render('user',{users});
});
router.get('/add', function(req, res, next) {
  res.render('addUser');
});

// POST để thêm người dùng từ form
router.post('/add', async (req, res, next) => {
  const db = await connectDb();
  const usersCollection = db.collection('users');

  // Lấy dữ liệu từ form
  let { username, email, password, role } = req.body;

  // Lấy người dùng cuối cùng từ cơ sở dữ liệu
  let lastUser = await usersCollection.find().sort({ id: -1 }).limit(1).toArray();

  // Xác định id mới cho người dùng
  let id = lastUser[0] ? lastUser[0].id + 1 : 1;

  // Tạo một đối tượng người dùng mới
  let newUser = { id, username, email, password, role };

  // Thực hiện thêm dữ liệu vào cơ sở dữ liệu
  await usersCollection.insertOne(newUser);

  // Lấy danh sách người dùng mới nhất từ cơ sở dữ liệu
  const users = await usersCollection.find().toArray();

  // Chuyển hướng người dùng và truyền danh sách người dùng mới nhất
  res.render('user', { users });
});

router.get('/edit/:id', async (req, res, next) => {
  const db = await connectDb();
  const usersCollection = db.collection('users');
  const id = req.params.id;
  const user = await usersCollection.findOne({ id: parseInt(id) });
  res.render('editUser', { user });
});

// Post để sửa người dùng từ form
router.post('/edit', async (req, res, next) => {
  const db = await connectDb();
  const usersCollection = db.collection('users');
  let { id, username, email, role } = req.body;

  // Lấy thông tin người dùng từ cơ sở dữ liệu
  const userFromDB = await usersCollection.findOne({ id: parseInt(id) });

  // Kiểm tra nếu mật khẩu đã thay đổi trong form
  if (req.body.password) {
    // Nếu có thay đổi, sử dụng mật khẩu mới từ form
    let { password } = req.body;
    // Cập nhật thông tin người dùng
    await usersCollection.updateOne({ id: parseInt(id) }, { $set: { username, email, password, role } });
  } else {
    // Nếu không có thay đổi, sử dụng mật khẩu cũ từ cơ sở dữ liệu
    let { password } = userFromDB;
    // Cập nhật thông tin người dùng, nhưng giữ nguyên mật khẩu cũ
    await usersCollection.updateOne({ id: parseInt(id) }, { $set: { username, email, password, role } });
  }

  res.redirect('/users');
});

// Xóa người dùng
router.get('/delete/:id', async (req, res) => {
  let id = req.params.id;
  const db = await connectDb();
  const usersCollection = db.collection('users');
  await usersCollection.deleteOne({ id: parseInt(id) });
  res.redirect('/users');
});
// Đăng ký
router.get('/register', function(req, res, next) {
  res.render('register');
});

router.post('/register', async (req, res) => {
  try {
    const db = await connectDb();

    // Lấy người dùng cuối cùng từ cơ sở dữ liệu
    const lastUser = await db.collection('users').find().sort({ id: -1 }).limit(1).toArray();

    // Xác định id mới cho người dùng
    const id = lastUser.length > 0 ? lastUser[0].id + 1 : 1;

    // Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu theo email
    const existingUser = await db.collection('users').findOne({ email: req.body.email });

    if (existingUser) {
      return res.render('register', { errorMessage: 'Email đã được sử dụng', userData: req.body });
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.render('register', { errorMessage: 'Định dạng email không hợp lệ', userData: req.body });
    }

    // Kiểm tra mật khẩu và nhập lại mật khẩu
    if (req.body.password !== req.body.confirmPassword) {
      return res.render('register', { errorMessage: 'Mật khẩu và nhập lại mật khẩu không khớp', userData: req.body });
    }

    // Thêm người dùng vào cơ sở dữ liệu
    await db.collection('users').insertOne({
      id,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password, 
      role: 'user'
    });

    // Nếu không có lỗi, gửi thông báo thành công và dữ liệu người dùng mới đến trang register.ejs
    res.render('register', { successMessage: 'Đăng ký thành công' });
  } catch (error) {
    // Nếu có lỗi, gửi thông báo lỗi và dữ liệu người dùng nhập vào trang register.ejs
    res.render('register', { errorMessage: 'Đã xảy ra lỗi khi thực hiện đăng ký', userData: req.body });
  }
});




router.get('/login', function(req, res, next) {
  res.render('login');
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const db = await connectDb();

    // Tìm người dùng trong cơ sở dữ liệu bằng email
    const user = await db.collection('users').findOne({ email: req.body.email });

    // Kiểm tra xem người dùng tồn tại và mật khẩu khớp
    if (!user || user.password !== req.body.password) {
      return res.render('login', { errorMessage: 'Email hoặc mật khẩu không chính xác', userData: req.body });
    }

    // Xác định trang sẽ chuyển hướng dựa trên vai trò của người dùng
    let redirectPage;
    if (user.role === 'admin') {
      redirectPage = 'products';
    } else {
      redirectPage = 'categories';
    }

    // Chuyển hướng đến trang tương ứng
    res.redirect(`/${redirectPage}`);
  } catch (error) {
    res.render('login', { errorMessage: 'Đã xảy ra lỗi khi thực hiện đăng nhập', userData: req.body });
  }
});

module.exports = router;            