var express = require('express');
var router = express.Router();
// const bcrypt = require('bcrypt');

const multer = require('multer');
//Thiết lập nơi lưu trữ và tên file
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
//Kiểm tra file upload
function checkFileUpLoad(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|wep)$/)) {
        return cb(new Error('Bạn chỉ được upload file ảnh'));
    }
    cb(null, true);
}
//Upload file
let upload = multer({ storage: storage, fileFilter: checkFileUpLoad });
const connectDb = require('../models/db');

/* Show danh sách SẢN PHẨM */
router.get('/products', async (req, res, next) => {
    const db = await connectDb();
    const productsCollection = db.collection('products');
    const products = await productsCollection.find().toArray();
    if (products) {
        res.status(200).json(products);

    } else {
        res.status(404).json({ message: 'Not found' });
    }
}
);
/* Show danh sách DANH MỤC */
router.get('/categories', async (req, res, next) => {
    const db = await connectDb();
    const categoriesCollection = db.collection('categories');
    const categories = await categoriesCollection.find().toArray();
    if (categories) {
        res.status(200).json(categories);

    } else {
        res.status(404).json({ message: 'Not found' });
    }
}
);
/* Show danh sách USER */
router.get('/users', async (req, res, next) => {
    const db = await connectDb();
    const usersCollection = db.collection('users');
    const users = await usersCollection.find().toArray();
    if (users) {
        res.status(200).json(users);

    } else {
        res.status(404).json({ message: 'Not found' });
    }
});

/* ----------------PRODUCT-------------------*/
// Lấy danh sách sản phẩm HOT
router.get('/products/hot', authenToken, async (req, res, next) => {
    const db = await connectDb();
    const productCollection = db.collection('products');
    const hotProducts = await productCollection.find({ hot: 1 }).toArray();
    if (hotProducts) {
        res.status(200).json(hotProducts);
    } else {
        res.status(404).json({ message: "Không tìm thấy sản phẩm HOT" })
    }
})

//thêm SẢN PHẨM
router.post('/products', upload.single('img'), async (req, res, next) => {
    let { name, price, categoryId, description, hot } = req.body;
    let img = req.file.originalname;
    const db = await connectDb();
    const productsCollection = db.collection('products');
    let lastProduct = await productsCollection.find().sort({ id: -1 }).limit(1).toArray();
    let id = lastProduct[0] ? lastProduct[0].id + 1 : 1;
    let newProduct = { id, name, price, categoryId, img, description, hot };
    await productsCollection.insertOne(newProduct);
    if (newProduct) {
        res.status(200).json(newProduct)
    } else {
        res.status(404).json({ message: "Thêm bị lỗi" })
    }
})

// Sửa SẢN PHẨM trả về json
router.put('/products/:id', upload.single('img'), async (req, res, next) => {
    let id = req.params.id;
    const db = await connectDb();
    const productCollection = db.collection('products');
    let { name, price, categoryId, description, hot } = req.body;
    if (req.file) {
        var img = req.file.originalname;
    } else {
        let product = await productCollection.findOne({ id: parseInt(id) });
        var img = product.img;
    }
    let editProduct = { name, price, categoryId, img, description, hot };
    product = await productCollection.updateOne({ id: parseInt(id) }, { $set: editProduct });
    if (product) {
        res.status(200).json(editProduct);
    } else {
        res.status(404).json({ message: 'Not found' });
    }
})

// Xóa SẢN PHẨM trả về json
router.delete('/products/:id', async (req, res, next) => {
    let id = req.params.id;
    const db = await connectDb();
    const productCollection = db.collection('products');
    let product = await productCollection.deleteOne({ id: parseInt(id) });
    if (product) {
        res.status(200).json({ message: 'Xóa thành công' });
    } else {
        res.status(200).json({ message: 'Not found' });
    }
})

// Lấy danh sách sản phẩm theo Mã danh mục
router.get('/products/categoryId/:categoryId', async (req, res) => {
    const db = await connectDb();
    const productCollection = db.collection('products');
    let categoryId = req.params.categoryId;
    const products = await productCollection.find({ categoryId: categoryId }).toArray();
    if (products) {
        res.status(200).json(products);
    } else {
        res.status(404).json({ message: "Không tìm thấy sản phẩm theo id danh mục " })
    }
})

// Lấy danh sách sản phẩm theo Tên danh mục
router.get('/products/categoryName/:categoryName', async (req, res) => {
    const db = await connectDb();
    const productsCollection = db.collection('products');
    const categoriesCollection = db.collection('categories');
    let categoryName = req.params.categoryName;
    const category = await categoriesCollection.findOne({ name: categoryName });
    if (!category) {
        return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }
    const products = await productsCollection.find({ categoryId: String(category.id) }).toArray();
    if (products.length) {
        res.status(200).json(products);
    } else {
        res.status(404).json({ message: 'Không tìm thấy sản phẩm trong danh mục này' });
    }
});


// Tìm kiếm sản phẩm
router.get('/products/search/:name', async (req, res, next) => {
    const db = await connectDb();
    const productCollection = db.collection('products');
    const product_name = req.params.name
    // const products = await productCollection.find().toArray();
    // const data = products.filter((item)=>
    //                 item.name.toLowerCase().includes(product_name.toLowerCase()));
    const data = await productCollection.find({ name: { $regex: product_name, $options: 'i' } }).toArray()
    if (data) {
        res.status(200).json(data);
    } else {
        res.status(404)._construct({ message: "Không tìm thấy sản phẩm Hot" })
    }
})

// Lấy danh sách sản phẩm theo trang và giới hạn số lượng

// Lấy danh sách sản phẩm và sắp xếp theo tăng dần về giá và giới hạn số lượng

// Lấy danh sách sản phẩm và sắp xếp theo giảm dần về giá và giới hạn số lượng

//chi tiết SẢN PHẨM
router.get('/products/:id', async (req, res, next) => {
    const db = await connectDb();
    const productCollection = db.collection('products');
    let id = req.params.id;
    const product = await productCollection.findOne({ id: parseInt(id) });
    if (product) {
        res.status(200).json(product);

    } else {
        res.status(404).json({ message: 'Not found' });
    }
});

/* ----------------CATEGORY-------------------*/
//thêm DANH MỤC
router.post('/categories', upload.single('img'), async (req, res, next) => {
    let { name } = req.body;
    let img = req.file.originalname;
    const db = await connectDb();
    const categoriesCollection = db.collection('categories');
    let lastCategory = await categoriesCollection.find().sort({ id: -1 }).limit(1).toArray();
    let id = lastCategory[0] ? lastCategory[0].id + 1 : 1;
    let newCategory = { id, name, img };
    await categoriesCollection.insertOne(newCategory);
    if (newCategory) {
        res.status(200).json(newCategory)
    } else {
        res.status(404).json({ message: "Thêm bị lỗi" })
    }
})

// Sửa DANH MỤC trả về json
router.put('/categories/:id', upload.single('img'), async (req, res, next) => {
    let id = req.params.id;
    const db = await connectDb();
    const categoryCollection = db.collection('categories');
    let { name } = req.body;
    if (req.file) {
        var img = req.file, originalname;
    } else {
        let category = await categoryCollection.findOne({ id: parseInt(id) });
        var img = category.img;
    }
    let editcategory = { name, img };
    category = await categoryCollection.updateOne({ id: parseInt(id) }, { $set: editcategory });
    if (category) {
        res.status(200).json(editcategory);
    } else {
        res.status(404).json({ message: 'Not found' });
    }
})

// Xóa DANH MỤC trả về json
router.delete('/categories/:id', async (req, res, next) => {
    let id = req.params.id;
    const db = await connectDb();
    const categoryCollection = db.collection('categories');
    let category = await categoryCollection.deleteOne({ id: parseInt(id) });
    if (category) {
        res.status(200).json({ message: 'Xóa thành công' });
    } else {
        res.status(200).json({ message: 'Not found' });
    }
})

//chi tiết DANH MỤC
router.get('/categories/:id', async (req, res, next) => {
    const db = await connectDb();
    const categoryCollection = db.collection('categories');
    let id = req.params.id;
    const category = await categoryCollection.findOne({ id: parseInt(id) });
    if (category) {
        res.status(200).json(category);

    } else {
        res.status(404).json({ message: 'Not found' });
    }
});

/* ----------------USER-------------------*/
//thêm USER
router.post('/users', async (req, res, next) => {
    let { name } = req.body;
    if (!name || name.trim() === '') {
        return res.status(400).json({ message: "Tên không được để trống" });
    }
    const db = await connectDb();
    const usersCollection = db.collection('users');
    let lastUser = await usersCollection.find().sort({ id: -1 }).limit(1).toArray();
    let id = lastUser[0] ? lastUser[0].id + 1 : 1;
    let newUser = { id, name };
    await usersCollection.insertOne(newUser);
    res.status(200).json(newUser);
});


// Sửa USER trả về json
router.put('/users/:id', async (req, res, next) => {
    let id = req.params.id;
    let { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Tên không được để trống" });
    }
    const db = await connectDb();
    const userCollection = db.collection('users');
    let editUser = { name };
    let user = await userCollection.updateOne({ id: parseInt(id) }, { $set: editUser });
    if (user.modifiedCount) {
        res.status(200).json(editUser);
    } else {
        res.status(404).json({ message: 'Không tìm thấy user' });
    }
});

// Xóa USER trả về json
router.delete('/users/:id', async (req, res, next) => {
    let id = req.params.id;
    const db = await connectDb();
    const userCollection = db.collection('users');
    let user = await userCollection.deleteOne({ id: parseInt(id) });
    if (user.deletedCount) {
        res.status(200).json({ message: 'Xóa thành công' });
    } else {
        res.status(404).json({ message: 'Không tìm thấy user' });
    }
});

//chi tiết USER
router.get('/users/:id', async (req, res, next) => {
    const db = await connectDb();
    const userCollection = db.collection('users');
    let id = req.params.id;
    const user = await userCollection.findOne({ id: parseInt(id) });
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: 'Not found' });
    }
});

const bcrypt = require('bcrypt');
//Chức năng đăng ký tài khoản mã hóa mật khẩu bằng bcrypt
router.post('/user/register', upload.single('img'), async (req, res, next) => {
    const db = await connectDb();
    const userCollection = db.collection('users');
    let { username, email, password } = req.body;
    let user = await userCollection.findOne({ email: email });
    if (user) {
        res.status(409).json({ message: "Email đã tồn tại" });
    } else {
        let lastuser = await userCollection.find().sort({ id: -1 }).limit(1).toArray();
        let id = lastuser[0] ? lastuser[0].id + 1 : 1;
        const salt = bcrypt.genSaltSync(10);
        let hashPassword = bcrypt.hashSync(password, salt);
        let newUser = { id: id, username, email, password: hashPassword, role: "user" };
        try {
            let result = await userCollection.insertOne(newUser);
            console.log(result);
            res.status(200).json({ message: "Đăng ký thành công" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi khi thêm người dùng mới" });
        }
    }
})
// Chức năng đăng nhập
const jwt = require('jsonwebtoken');
router.post('/user/login', upload.single('img'), async (req, res, next) => {
    let { email, password } = req.body;
    const db = await connectDb();
    const userCollection = db.collection('users');
    let user = await userCollection.findOne({ email: email });
    if (user) {
        if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ email: user.email, isAdmin: user.isAdmin }, 'secretkey', { expiresIn: '60s' })
            res.status(200).json({ token: token });
        } else {
            res.status(403).json({ message: "Email hoặc mật khẩu không chính xác" });
        }
    } else {
        res.status(403).json({ message: "Email hoặc mật khẩu không tồn tại" });
    }
})

//Xác thực token
function authenToken(req, res, next) {
    // lấy header authorization của client gửi lên
    const bearerHeader = req.headers['authorization'];
    // Kiểm tra header vừa lấy có dữ liệu không
    if (typeof bearerHeader !== 'undefined') {
        // Thực hiện cắt value ra làm 2 phần và lấy token là phần tử có index =1
        const bearerToken = bearerHeader.split(' ')[1];
        // Đưa dữ liệu token vào req.token
        req.token = bearerToken;
        // xác thực token vừa lấy với mã bí mật là 'search key'
        jwt.verify(req.token, 'secretkey', (err, authData) => {
            // Nếu có lỗi thì thông báo truy cập được
            if (err) {
                res.status(403).json({ message: "Không có quyền truy cập" });
            } else {
                // Cho tiếp tục các hàm tiếp theo của api những authen Token vào
                next();
            }
        })
    } else {
        res.status(403).json({ message: "Không có quyền truy cập" });
    }
}
// Kiểm tra header vừa lấy 

module.exports = router;