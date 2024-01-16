import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ValidationError, fromZodError } from 'zod-validation-error';
import jwt, { sign } from 'jsonwebtoken';
import crypto from 'crypto';
import { loginData, loginSchema, signUpData, signUpSchema } from '../model/login';
import { userEditSchema } from '../model/admin';

const secretKey = 'basith@jayaprakash_salman-siraj';
const encryptKey = '"kzbvjl3841yk^%$756342ds!@#$%^&gb43fs!@#$%^&bsd75?xjvbjz"';

const prisma = new PrismaClient();

export const loginRouter = express.Router();

//routes
loginRouter.post('/login', login);
loginRouter.post('/signUp', signUp);


//#region
//login
async function login(req: Request, res: Response) {
  try {
    const data = loginSchema.safeParse(req.body);

    if (!data.success) {
      let errMessage: string = fromZodError(data.error).message;
      return res.status(400).json({
        error: {
          message: errMessage,
        },
      });
    }

    const resultData: loginData = data.data;

    if (!resultData) {
      return res.status(409).json({
        error: {
          message: "Invalid params",
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: resultData.email,
      },
    });

    if (!user || user.password !== getPasswordHash(resultData.password)) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    if (user.status !== 'Active') {
      return res.status(400).json({ error: 'User is not active. Please contact support.' });
    }

    const token = sign({ userId: user.id }, secretKey, { expiresIn: '1h' });

    const profile = await prisma.user.findUnique({
      where: {
        email: resultData.email,
      },
      select: {
        name: true,
        userId: true,
        role: true,
      },
    });
    return res.json({ message: 'Login successful', token, profile });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

function getPasswordHash(password: string): string {
  return crypto.createHmac('sha256', encryptKey).update(password).digest('hex');
}

//#endregion

//#region
//signUp
async function signUp(req: Request, res: Response) {
  try {

    const data = signUpSchema.safeParse(req.body);

    if (!data.success) {
      let errMessage: string = fromZodError(data.error).message;
      return res.status(400).json({
        error: {
          message: errMessage,
        },
      });
    }

    const resultData: signUpData = data.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email: resultData.email
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists.',
      });
    }

    // const existingMobile = await prisma.user.findUnique({
    //   where: {
    //       mobile: resultData.mobile
    //   }
    // });

    // if(existingMobile){
    //   return res.status(400).json({
    //       error: 'User with this mobile number is already exists.',
    //     });
    // }

    // const existingMobile2 = await prisma.user.findUnique({
    //   where: {
    //       secondary_mobile: resultData.secondary_mobile
    //   }
    // });

    // if(existingMobile2){
    //   return res.status(400).json({
    //       error: 'User with this secondary mobile number is already exists.',
    //     });
    // }

    const hashedPassword = crypto
      .createHmac('sha256', encryptKey)
      .update(resultData.password)
      .digest('hex');

    // Retrieve the maximum current userId
    const maxUserId = await prisma.user.findFirst({
      select: {
        userId: true
      },
      orderBy: {
        userId: 'desc'
      }
    });

    const prefix = 'ATKSMV';

    const newUser = await prisma.user.create({
      data: {
        userId: null,
        name: resultData.name,
        email: resultData.email,
        password: hashedPassword,
        DOB: resultData.DOB,
        aadhar: resultData.aadhar,
        pan: resultData.pan,
        mobile: resultData.mobile,
        address: resultData.address,
        secondary_mobile: resultData.secondary_mobile,
        upi_id: resultData.upi_id,
        account_no: resultData.account_no,
        account_holder: resultData.account_holder,
        IFSC: resultData.IFSC
      },
    });

    await prisma.user.update({
      where:{
        id:newUser.id
      },
      data: {
        userId: `ATKSMV${newUser?.id + 1000}`,
      },
    });

    return res.status(200).json({ message: 'User registered successfully', userId: newUser.id });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

//#endregion

