import express, {Request, Response} from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import { nomineeData, nomineeSchema } from '../model/user'
import { fromZodError } from 'zod-validation-error'

export  const userRouter = express.Router()

const prisma = new PrismaClient()

//Routes
userRouter.put('/profile', getProfile)
userRouter.post('/nominee', addNominee)
userRouter.put('/getNominee', getNominee)


userRouter.get('/admin', getAdmin)

//#region
//get profile
async function getProfile(req: Request, res: Response) {
    try{

        const userId = req.body.userId

        if(!userId) {
          return res.json({
            msg: "userId is required"
          })
        }

        const profile = await prisma.user.findUnique({
            where: {
                userId: userId
            }
        });

        if(!profile) {
            return res.status(401).json({
                msg: "User Not Found"
            })
        }

        return res.status(200).json({
            profile: profile
        })

    } catch(error) {
        return res.status(400).json({
            error: error
        })
    }
}
//#endregion

//#region
//get Nominee
async function getNominee(req: Request, res: Response) {
  try{

      const userId = req.body.userId

      const nominee = await prisma.nominee.findFirst({
          where: {
              userId: userId
          }
      });

      return res.status(200).json({
          nominee: nominee
      })

  } catch(error) {
      return res.status(400).json({
          error: error
      })
  }
}
//#endregion

//#region
//add nominee
async function addNominee(req: Request, res: Response) {
    try {
      const data = nomineeSchema.safeParse(req.body);
  
      if (!data.success) {
        let errMessage: string = fromZodError(data.error).message;
        return res.status(400).json({
          error: {
            message: errMessage,
          },
        });
      }
  
      const resultData: nomineeData = data.data;
  
      if (!resultData) {
        return res.status(409).json({
          error: {
            message: "Invalid params",
          },
        });
      }
  
      const userId = resultData.userId;
  
      const existingUser = await prisma.user.findUnique({
        where: {
          userId: userId,
        },
      });
  
      if (!existingUser) {
        return res.status(400).json({
          error: 'User with this userId does not exist.',
        });
      }
  
      const existingNominee = await prisma.nominee.findFirst({
        where: {
          userId: userId,
        },
      });
      
  
      if (existingNominee) {
        return res.status(400).json({
          error: 'Nominee already exists for this user.',
        });
      }
  
      const newNominee = await prisma.nominee.create({
        data: {
          name: resultData.name,
          email: resultData.email,
          aadhar: resultData.aadhar,
          pan: resultData.pan,
          mobile: resultData.mobile,
          upi_id: resultData.upi_id,
          account_no: resultData.account_no,
          account_holder: resultData.account_holder,
          userId: userId,
          IFSC: resultData.IFSC,
        },
      });
  
      return res.status(201).json({ message: 'Nominee registered successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
}
//#endregion  

//#region
//get admin data
async function getAdmin(req: Request,res :Response) {
  try{

    const admin = await prisma.user.findMany({
      where: {
        role: "Admin"
      },
      select: {
        account_holder: true,
        account_no: true,
        IFSC: true,
        upi_id : true
      }
    })

    return res.status(200).json({
      admin: admin
    })

  } catch(err) {
    return res.status(400).json({
      error: err
    })
  }
}
//#endregion