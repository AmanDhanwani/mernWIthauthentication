var jwt = require('jsonwebtoken');

const createToken =async ()=>{
    const myToken = await jwt.sign({_id:"aman"},"dhanwani",{
        expiresIn:"2 minutes"
    });
    console.log(myToken);

    const UserVerify = await jwt.verify(myToken,"dhanwani")
    console.log(UserVerify);
}



createToken()