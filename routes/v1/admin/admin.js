const express=require('express');
const jwt = require('jsonwebtoken');
const hash=require('bcrypt');


const room=require('../../../models/room');
const categorymodel=require('../../../models/category');
const isadmin=require('../../../controllers/middleware').isadmin;
const isuser=require('../../../controllers/middleware').isuser;

const login=require('../../../models/login');
const token=require('../../../models/token');

const router=express();




router.post('/v1/admin/register', async(req, res) => {

    try{

        console.log("ffff")
        

        const { name, phonenumber, email, password, role } = req.body;

        console.log(req.body);
console.log("ffffee")


if(!name || typeof name !== 'string' || name.trim() === ''|| name.trim().length < 2){
            return res.status(400).json({
                status:false,
                message:"Please enter a valid name",
            });
        }
if(!phonenumber || typeof phonenumber !== 'number' || phonenumber <= 0){
            return res.status(400).json({
                status:false,
                message:"Please enter a valid phone number",
            });
        }

if(!email || typeof email !== 'string' || !email.includes('@') || email.trim() === ''){
            return res.status(400).json({
                status:false,
                message:"Please enter a valid email",
            });
        }
if(!password || typeof password !== 'string' || password.length < 6){
            return res.status(400).json({
                status:false,
                message:"Please enter a valid password with at least 6 characters",
            });
        }
if(!role || (role !== 'admin' && role !== 'enduser' && role !== 'hotelowner')){
            return res.status(400).json({
                status:false,
                message:"Please select a valid role",
            });
        }
    

if(!name || !phonenumber || !email || !password || !role){
            return res.status(400).json({
                status:false,
                message:"Please fill all the fields",
            });
        }
        const hashedPassword = await hash.hash(password, 10);

    console.log("hello world");


    const newUser = new login({
        name: name,
        phonenumber: phonenumber,
        email: email,
        password: hashedPassword,
        role: role,
    })

    await newUser.save();
    

    res.status(201).json({
        status: true,
        message: "User registered successfully",
       
    })
}
    


    

    

    catch(err){
        console.error(err);
        res.status(500).json({
            status:false,
            message:"Something went wrong",
        });
        
    }

});


router.post('/v1/admin/login', async(req, res) => {
    try{

        const { email, password } = req.body;

        if(!email || typeof email !== 'string' || !email.includes('@') || email.trim() === ''){
            return res.status(400).json({
                status:false,
                message:"Please enter a valid email",
            });
        }
        if(!password || typeof password !== 'string' || password.length < 6){
            return res.status(400).json({
                status:false,
                message:"Please enter a valid password with at least 6 characters",
            });
        }

        const user = await login.findOne({ email: email });

        if(!user){
            return res.status(404).json({
                status:false,
                message:"User not found",
            });
        }

        const isMatch = await hash.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({
                status:false,
                message:"Invalid credentials",
            });
        }

        const tokenValue = jwt.sign({ id: user._id }, 'mysecretkey123', { expiresIn: '1h' });

        const newToken = new token({
            loginid: user._id,
            token: tokenValue,
        });

        await newToken.save();

        res.status(200).json({
            status:true,
            message:"Login successful",
            token: tokenValue,
            role: user.role,
            name: user.name
        });

    } 

catch(err) {
        console.error(err);
        res.status(500).json({
            status:false,
            message:"Something went wrong",
        });
    }
}

);

router.post ('/v1/admin/addcategory',isadmin,async (req, res) => {
    try{
        const{categoryname,isavailable,price} = req.body;
        if (
            !categoryname ||
            typeof categoryname !== "string" ||
            categoryname.trim().length === 0
          ) {
            return res.status(400).json({
              status: false,
              message: "categorymodel name is required and must be a non-empty string.",
            });
          }
      
          if (
            typeof isavailable != "number" ||
            !Number.isInteger(isavailable) ||
            isavailable < 0
          ) {
            return res.status(400).json({
              status: false,
              message: "number of rooms is required and must be a positive integer.",
            });
          }
      
          if (typeof price != "number" || price < 0) {
            return res.status(400).json({
              status: false,
              message: "number of rooms is required and must be a positive integer.",
            });
          }

          const existingcategorymodel = await categorymodel.findOne({
            categoryname: { $regex: new RegExp(`^${categoryname}$`, "i") },
          });
      
          //if existingcategorymodel is found, it means the categorymodel already exists
          //if existingcategorymodel is not found, it means the categorymodel does not exist
          if (existingcategorymodel) {
            return res.status(201).json({
              status: true,
              message: "Existing categorymodel found with the same name",
            });
          }
      
          const totalrooms = isavailable;
      
          const newcategorymodel = new categorymodel({
            categoryname: categoryname,
            isavailable: isavailable,
            totalrooms: totalrooms,
            price: price,
          });
      
          await newcategorymodel.save();
      
          res.status(201).json({
            status: true,
            message: "categorymodel added successfully",
          });
        } catch (err) {
          console.error("Error during adding categorymodel:", err);
          res.status(500).json({
            status: false,
            message: "Something went wrong",
          });
        }
      });
router.get('/v1/admin/getcategories', isadmin, async (req, res) => {
    try {
        const categories = await category.find();
        res.status(200).json({
            status: true,
            categories: categories
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    }
});





router.delete('/v1/admin/deletecategory/:id', isadmin, async (req, res) => {
    
    try {
        const categoryId = req.params.id;
        const deletedCategory = await category.findById(categoryId);
        if (!deletedCategory) {
            return res.status(404).json({
                status: false,
                message: "Category not found"
            });
        }

        deletedCategory.status=false;
        await deletedCategory.save()
        res.status(200).json({
            status: true,
            message: "Category deleted successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    }
});

router.put('/v1/admin/updatecategory/:id', isadmin, async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { categoryname, isavailable } = req.body;

        if (!categoryname || typeof categoryname !== 'string' || categoryname.trim() === '') {
            return res.status(400).json({
                status: false,
                message: "Please enter a valid category name",
            });
        }
        if (typeof isavailable !== 'number') {
            return res.status(400).json({
                status: false,
                message: "Please enter a valid value",
            });
        }

        const updatedCategory = await category.findByIdAndUpdate(categoryId, {
            categoryname: categoryname,
            isavailable: isavailable
        }, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({
                status: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            status: true,
            message: "Category updated successfully",
            category: updatedCategory
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    }
});

const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');

const ExcelJS = require('exceljs');

router.get('/v1/admin/getusers/:type', isadmin, async (req, res) => {
    try {
const type = req.params.type;
        if(type== 'pdf') {
        const users = await login.find({ role: { $ne: 'admin' } });

        const fonts = {
            Roboto: {
                normal: path.join(__dirname,"../../../fonts/Roboto-Regular.ttf"),
                bold: path.join(__dirname,"../../../fonts/Roboto-Medium.ttf"),
                italics: path.join(__dirname,"../../../fonts/Roboto-Italic.ttf"),
                bolditalics: path.join(__dirname,"../../../fonts/Roboto-MediumItalic.ttf")
            }
        };

        const printer = new PdfPrinter(fonts);

        const tableBody = [
            [{ text: 'No.', bold: true }, { text: 'Username', bold: true }, { text: 'Email', bold: true }, { text: 'Role', bold: true }]
        ];

        users.forEach((user, index) => {
            tableBody.push([
                index + 1,
                user.name || '-',
                user.email || '-',
                user.role || '-'
            ]);
        });

        const docDefinition = {
            content: [
                { text: 'User List', style: 'header' },
                {
                    style: 'tableExample',
                    table: {
                        headerRows: 1,
                        widths: [40, '*', '*', 70],
                        body: tableBody
                    }
                }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 20]
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                }
            }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=users.pdf');
        pdfDoc.pipe(res);
        pdfDoc.end();

    }

else if(type == 'excel')
    {
        const users = await login.find({ role: { $ne: 'admin' } });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');

        worksheet.columns = [
            { header: 'No.', key: 'no', width: 5 },
            { header: 'Username', key: 'username', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Role', key: 'role', width: 15 }
        ];

        users.forEach((user, index) => {
            worksheet.addRow({
                no: index + 1,
                username: user.username || '',
                email: user.email || '',
                role: user.role || ''
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    }
});


router.get('/v1/admin/makeusersactive/:id', isadmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await login.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }
        user.status = true;
        await user.save();
        res.status(200).json({
            status: true,
            message: "User activated successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    }
}
);
router.get('/v1/admin/makeusersinactive/:id', isadmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await login.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }
        user.status = false;
        await user.save();
        res.status(200).json({
            status: true,
            message: "User deactivated successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    }
}
);

router.post("/v1/admin/updatecategory/:id", isadmin, async (req, res) => {
    try {
        const updatesToBeDone = req.body;
        const categoryId = req.params.id;

        // Check if the category name already exists
        const existingCategory = await categorymodel.findOne({
            categoryname: updatesToBeDone.categoryname,
        });

        if (existingCategory) {
            if (existingCategory._id.toString() !== categoryId) {
                return res.status(400).json({
                    status: false,
                    message: "Category name already exists",
                });
            }
        }

        // Update the category
        const updated = await categorymodel.findOneAndUpdate(
            { _id: categoryId },
            { $set: updatesToBeDone },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                status: false,
                message: "Category not found",
            });
        }

        // Send success response
        res.json({
            status: true,
            message: "Category updated successfully",
            category: updated,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});



module.exports = router;