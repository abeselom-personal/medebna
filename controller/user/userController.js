// const User = require('../../model/user/userModel');

// exports.storeUserInfo = async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();
  
//     try {
//       const {firstName, lastName, email, phone, sessionId, productType,paymentMethod} = req.body;
      
//       const newUser = new User({
//         firstName,
//         lastName,
//         email,
//         phone,
//         sessionId,
//         productType,
//         paymentMethod
//       });
//       await newUser.save({ session });
  
//       await session.commitTransaction();
//       session.endSession();
  
//       res.status(201).json(newUser);
//     } catch (error) {
//       await session.abortTransaction();
//       session.endSession();
  
//       res.status(400).json({ error: error.message });
//     }
//   };