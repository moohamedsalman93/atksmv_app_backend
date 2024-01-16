import { Prisma, PrismaClient } from '@prisma/client';
import express, { Request, Response, Router } from 'express';
import { userEditData, userEditSchema } from '../model/admin';
import { fromZodError } from 'zod-validation-error';
import crypto from 'crypto';

const encryptKey = '"kzbvjl3841yk^%$756342ds!@#$%^&gb43fs!@#$%^&bsd75?xjvbjz"';

const prisma = new PrismaClient();

export const adminRouter = express.Router()

//Routes
adminRouter.get('/users', getUsers)
adminRouter.put('/editUser', editUser)
adminRouter.delete('/deleteUser', deleteUser)

adminRouter.get('/admin', getAdmin)

//#region
//getUsers
async function getUsers(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const maxResults = parseInt(req.query.maxResults as string) || 10;

    let whereCondition: {
      name?: string;
      userId?: string;
      email?: string;
      mobile?: string;
      status?: string;
    } = {
    };

    if (req.query.status) {
      whereCondition.status = req.query.status as string;
    } else {
      whereCondition.status = "Active";
    }

    if (req.query.name) {
      whereCondition.name = req.query.name as string;
    }

    if (req.query.userId) {
      whereCondition.userId = req.query.userId as string;
    }

    if (req.query.email) {
      whereCondition.email = req.query.email as string;
    }

    if (req.query.mobile) {
      whereCondition.mobile = req.query.mobile as string;
    }

    const users = await prisma.user.findMany({
      take: maxResults,
      skip: (page - 1) * maxResults,
      where: whereCondition,
    });

    const totalUsers = await prisma.user.count({
      where: whereCondition,
    });

    const totalPages = Math.ceil(totalUsers / maxResults);

    return res.status(200).json({
      users: users,
      currentPage: page,
      maxResults: maxResults,
      totalUsers: totalUsers,
      totalPages: totalPages,
    });
  } catch (error) {
    return res.status(400).json({
      error: error,
    });
  }
}

//#endregion

//#region
//editUser
async function editUser(req: Request, res: Response) {
  try {
    const { userId, ...updateFields } = req.body;

    if (!userId) {
      return res.json({ msg: "userId is required" });
    }

    const data = userEditSchema.safeParse(req.body);

    if (!data.success) {
      let errMessage: string = fromZodError(data.error).message;
      return res.status(400).json({
        error: {
          message: errMessage,
        },
      });
    }

    const resultData: userEditData = data.data;

    if (!resultData) {
      return res.status(409).json({
        error: {
          message: "Invalid params",
        },
      });
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(200).json({
        msg: "No updates provided",
      });
    }

    const updateData: Record<string, any> = {};

    if ('name' in updateFields) {
      updateData.name = resultData.name;
    }

    if ('email' in updateFields) {
      updateData.email = resultData.email;
    }

    if ('password' in updateFields) {
      if (updateFields.password.length > 0) {
        // Ensure that resultData.password is defined before using it
        const password = resultData.password ?? '';
        const hashedPassword = crypto
          .createHmac('sha256', encryptKey)
          .update(password) // Use the non-nullable password variable here
          .digest('hex');
    
        updateData.password = hashedPassword;
      }
    }

    if ('DOB' in updateFields) {
      updateData.DOB = resultData.DOB;
    }

    if ('aadhar' in updateFields) {
      updateData.aadhar = resultData.aadhar;
    }
    if ('pan' in updateFields) {
      updateData.pan = resultData.pan;
    }

    if ('mobile' in updateFields) {
      updateData.mobile = resultData.mobile;
    }

    if ('secondary_mobile' in updateFields) {
      updateData.secondary_mobile = resultData.secondary_mobile;
    }

    if ('address' in updateFields) {
      updateData.address = resultData.address;
    }

    if ('account_no' in updateFields) {
      updateData.account_no = resultData.account_no;
    }

    if ('upi_id' in updateFields) {
      updateData.upi_id = resultData.upi_id;
    }

    if ('account_holder' in updateFields) {
      updateData.account_holder = resultData.account_holder;
    }

    if ('IFSC' in updateFields) {
      updateData.IFSC = resultData.IFSC;
    }

    if ('amount' in updateFields) {
      updateData.amount = resultData.amount;
    }

    if ('return' in updateFields) {
      updateData.return = resultData.return;
    }

    const user = await prisma.user.update({
      where: {
        userId: userId,
      },
      data: updateData,
    });

    return res.status(200).json({
      msg: "User Updated successfully",
    });
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      error: error,
    });
  }
}
//#endregion

//#region
//delete user
async function deleteUser(req: Request, res: Response) {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        msg: "Invalid or missing userId parameter",
      });
    }

    const user = await prisma.user.delete({
      where: {
        userId: userId,
      },
    });

    await prisma.transaction.deleteMany({
      where: {
        userId: userId,
        status: "Pending"
      },
    });

    await prisma.withdrawal.deleteMany({
      where: {
        userId: userId,
        status: "Pending"
      },
    });



    if (!user) {
      return res.json({
        msg: "User Not Found",
      });
    }

    return res.status(200).json({
      msg: "User Deleted Successfully",
    });
  } catch (error) {
    return res.status(400).json({
      error: error,
    });
  }
}

//#endregion

//#region
//get admin data
async function getAdmin(req: Request, res: Response) {
  try {

    const admin = await prisma.user.findMany({
      where: {
        role: "Admin"
      }
    })

    return res.status(200).json({
      admin: admin
    })

  } catch (err) {
    return res.status(400).json({
      error: err
    })
  }
}

