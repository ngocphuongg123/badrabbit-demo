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
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Bạn chỉ được upload file ảnh'));
    }
    cb(null, true);
}
//Upload file
let upload = multer({ storage: storage, fileFilter: checkFileUpLoad });

// const categories = [
//     { id: 1, name: "T-Shirt", img: "dm1.jpg" },
//     { id: 2, name: "Cardigan", img: "dm2.jpg" },
//     { id: 3, name: "Quần", img: "dm3.jpg" },
//     { id: 3, name: "Hoodie", img: "dm4.jpg" },
// ];
const connectDb=require('../models/db');
/* GET home page. */
router.get('/', async (req, res, next) =>{
    const db=await connectDb();
    const categoriesCollection = db.collection('categories');
    const categories = await categoriesCollection.find().toArray();
    res.render('category',{categories});
});

// Get để hiển thị trang thêm danh mục
router.get('/add', function (req, res, next) {
    res.render('addCate');
});

//Post để thêm danh mục từ form
router.post('/add',upload.single('img'),async(req,res, next)=>{
    const db=await connectDb();
    const categoriesCollection = db.collection('categories');
    let {name} = req.body;
    let img=req.file.originalname;
    let lastCategory=await categoriesCollection.find().sort({id:-1}).limit(1).toArray();
    let id = lastCategory[0] ? lastCategory[0].id +1 :1;

    let newCategory={id, name, img};
    //thực hiện thêm dữ liệu vào dtb
    await categoriesCollection.insertOne(newCategory);
    res.redirect('/categories');
});
//Get để hiển thị trang sửa danh mục
router.get('/edit/:id', async (req, res, next)=> {
    const db=await connectDb();
    const categoriesCollection = db.collection('categories');
    let id = req.params.id;
    const category= await categoriesCollection.findOne({id:parseInt(id)});
    res.render('editCate', { category });
});

router.post('/edit', upload.single('img'), async (req, res, next)=> {
    const db=await connectDb();
    const categoriesCollection = db.collection('categories');
    let { id, name } = req.body;
    let img = req.file ? req.file.originalname : req.body.imgOld; // Kiểm tra xem có hình ảnh mới hay không
    let editCategory={ name, img}
    await categoriesCollection.updateOne({id:parseInt(id)},{$set:editCategory});
    res.redirect('/categories');
});

//Xóa danh mục
router.get('/delete/:id', async (req, res)=> {
    const db=await connectDb();
    const categoriesCollection = db.collection('categories');
    let id = req.params.id;
    await categoriesCollection.deleteOne({id:parseInt(id)});
    res.redirect('/categories');
});

// // detail
// router.get('/:id', function (req, res, next) {
//     let id = req.params.id;
//     let category = categories.find(c => c.id == id);
//     res.send(`
//         <h3>${category.name}</h3>
//         <img src="../images/${category.img}" width="200">
//     `);
// });
// router.get('/delete/:id', function (req, res) {
//     let id = req.params.id;
//     let index = categories.findIndex(c => c.id == id);
//     categories.splice(index, 1);
//     res.redirect('/categories');
// });


module.exports = router;


/* router.get('/edit', function (req, res, next) {
    res.send('Đây là trang sửa danh mục');
}); */