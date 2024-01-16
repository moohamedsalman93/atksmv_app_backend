import express, {Request, Response} from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import { nomineeData, nomineeSchema } from '../model/user'
import { fromZodError } from 'zod-validation-error'
import { nomineeEditData, nomineeEditSchema } from '../model/nominee'

export  const nomineeRouter = express.Router()

const prisma = new PrismaClient()

//Routes
nomineeRouter.put('/nominee', getNominee)
nomineeRouter.put('/editNominee', editNominee)
nomineeRouter.delete('/deleteNominee', deleteNominee)


//#region
//get profile
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
//edit Nominee
async function editNominee(req: Request, res: Response) {
  try {
    const { userId, ...updateFields } = req.body;

    if (!userId) {
      return res.json({ msg: "userId is required" });
    }

    const existingNominee = await prisma.nominee.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!existingNominee) {
      return res.status(404).json({
        error: 'Nominee not found',
      });
    }

    const data = nomineeEditSchema.safeParse(req.body);

    if (!data.success) {
      const errMessage: string = fromZodError(data.error).message;
      return res.status(400).json({
        error: {
          message: errMessage,
        },
      });
    }

    const resultData: nomineeEditData = data.data;

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
      updateFields.name = resultData.name;
    }

    if ('email' in updateFields) {
      updateFields.email = resultData.email;
    }

    if ('aadhar' in updateFields) {
      updateFields.aadhar = resultData.aadhar;
    }
    if ('pan' in updateFields) {
      updateFields.pan = resultData.pan;
    }

    if ('mobile' in updateFields) {
      updateFields.mobile = resultData.mobile;
    }

    if ('account_no' in updateFields) {
      updateFields.account_no = resultData.account_no;
    }

    if ('upi_id' in updateFields) {
      updateFields.upi_id = resultData.upi_id;
    }

    if ('account_holder' in updateFields) {
      updateFields.account_holder = resultData.account_holder;
    }

    if ('IFSC' in updateFields) {
      updateFields.IFSC = resultData.IFSC;
    }

    const updatedNominee = await prisma.nominee.update({
      where: {
        userId: userId,
      },
      data: updateFields,
    });

    return res.status(200).json({
      msg: 'Nominee updated successfully',
      updatedNominee: updatedNominee,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
    });
  }
}
//#endregion

//#region
//delete the nominee
async function deleteNominee(req: Request, res: Response) {
    try {
        const { userId } = req.body;

        const nominee = await prisma.nominee.delete({
            where: {
                userId: userId,
            },
        });

        if (!nominee) {
            return res.json({
                msg: "Nominee not found",
            });
        }

        return res.status(200).json({
            msg: "Nominee deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Internal Server Error',
        });
    }
}
//#endregion

