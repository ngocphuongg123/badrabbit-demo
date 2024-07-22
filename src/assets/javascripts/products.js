var express = require('express');
var router = express.Router();

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

// const products = [
//     { id: 1, name: "product 1", price: 100, categoryId: 1, img: "1.jpg", description: "Description 1" },
//     { id: 2, name: "product 2", price: 200, categoryId: 1, img: "2.jpg", description: "Description 2" },
//     { id: 3, name: "product 3", price: 300, categoryId: 1, img: "3.jpg", description: "Description 3" },
//     { id: 4, name: "product 4", price: 400, categoryId: 1, img: "4.jpg", description: "Description 4" },
//     { id: 5, name: "product 5", price: 500, categoryId: 1, img: "5.jpg", description: "Description 5" },
//     { id: 6, name: "product 6", price: 600, categoryId: 1, img: "6.jpg", description: "Description 6" },
//     { id: 7, name: "product 7", price: 100, categoryId: 1, img: "7.jpg", description: "Description 1" },
//     { id: 8, name: "product 8", price: 200, categoryId: 1, img: "8.jpg", description: "Description 2" },
//     { id: 9, name: "product 9", price: 300, categoryId: 1, img: "9.jpg", description: "Description 3" },
//     { id: 10, name: "product 10", price: 400, categoryId: 1, img: "10.jpg", description: "Description 4" },
//     { id: 11, name: "product 11", price: 500, categoryId: 2, img: "11.jpg", description: "Description 5" },
//     { id: 12, name: "product 12", price: 600, categoryId: 2, img: "12.jpg", description: "Description 6" },
//     { id: 13, name: "product 13", price: 400, categoryId: 2, img: "13.jpg", description: "Description 4" },
//     { id: 14, name: "product 14", price: 500, categoryId: 2, img: "14.jpg", description: "Description 5" },
//     { id: 15, name: "product 15", price: 600, categoryId: 2, img: "15.jpg", description: "Description 6" },
// ];

const connectDb = require('../models/db');

/* show trang products */
router.get('/', async (req, res, next) => {
    const db = await connectDb();
    const productsCollection = db.collection('products');
    const products = await productsCollection.find().toArray();
    res.render('product', { products });
});

// Get để hiển thị trang thêm sản phẩm
router.get('/add', function (req, res, next) {
    res.render('addPro');
});

//Post để thêm sản phẩm từ form
router.post('/add', upload.single('img'), async (req, res, next) => {
    const db = await connectDb();
    const productsCollection = db.collection('products');
    let { name, price, categoryId, description } = req.body;
    let img = req.file.originalname;
    let lastProduct = await productsCollection.find().sort({ id: -1 }).limit(1).toArray();
    //thiết lập id nếu lastproduct tồn tại thì lấy id +1, ngược lại dữ liệu rỗng thì id bắt đầu từ 1
    let id = lastProduct[0] ? lastProduct[0].id + 1 : 1;

    let newProduct = { id, name, price, categoryId, img, description };
    //thực hiện thêm dữ liệu vào dtb
    await productsCollection.insertOne(newProduct);
    res.redirect('/products');
});

//Get để hiển thị trang sửa sản phẩm
router.get('/edit/:id', async (req, res, next) => {
    const db = await connectDb();
    const productsCollection = db.collection('products');
    const id = req.params.id;
    const product = await productsCollection.findOne({ id: parseInt(id) });
    res.render('editPro', { product });
});

//Post để sửa sản phẩm từ form
router.post('/edit', upload.single('img'), async (req, res, next) => {
    const db = await connectDb();
    const productsCollection = db.collection('products');
    let { id, name, price, categoryId, description } = req.body;
    let img = req.file ? req.file.originalname : req.body.imgOld;
    let editProduct = { name, price, categoryId, img, description }
    await productsCollection.updateOne({ id: parseInt(id) }, { $set: editProduct });
    res.redirect('/products');
});

//Xóa sản phẩm
router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;
    const db = await connectDb();
    const productsCollection = db.collection('products');
    await productsCollection.deleteOne({ id: parseInt(id) });
    res.redirect('/products');
});
// // detail
// router.get('/:id', function (req, res, next) {
//     let id = req.params.id;
//     let product = products.find(p => p.id == id);
//     res.send(`
//         <h3>${product.name}</h3>
//         <h4>Giá:${product.price}</h4>
//         <img src="../images/${product.img}" width="200">
//         <p>Mô tả: ${product.description}</p>
//     `);
// });




module.exports = router;