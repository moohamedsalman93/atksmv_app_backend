import express, {Request, Response} from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import { adminRouter } from './admin'
import { userEditSchema } from '../model/admin'

export const withdrawRouter = express.Router()

const prisma = new PrismaClient()

//Routes
withdrawRouter.post('/withdrawal', makeWithDrawal)
withdrawRouter.put('/withdrawRequest', getRequest)
withdrawRouter.put('/requestChange', editWithdraw)
withdrawRouter.delete('/deleteRequest', deleteWithdraw)
withdrawRouter.get('/history', getHistory)

//#region
//add withdrawal
async function makeWithDrawal(req: Request, res: Response) {
    try{

        const { name, userId, amount, status = "Pending" } = req.body

        if(!name || !userId || !amount) {
            return res.status(401).json({
                err: "params missing (name, userId, amount )"
            })
        }

        const existWithdraw = await prisma.withdrawal.findFirst({
            where: {
                name: name,
                userId: userId
            }
        })

        if(existWithdraw) {
            return res.json({
                msg: "WithDrawal request already Exist"
            })
        }

        const withdrawal = await prisma.withdrawal.create({
            data: {
                name: name,
                userId: userId,
                amount: amount
            }
        })

        return res.status(200).json({
            success: "Withdrawal request Success"
        })

    } catch(error) {
        return res.status(400).json({
            error: error
        })
    }
}
//#endregion

//#region
//Get Request of withdarwal
async function getRequest(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;
  
      const { page, maxResults } = req.query;
  
      const parsedPage = parseInt(page as string) || 1;
      const parsedMaxResults = parseInt(maxResults as string) || 10;
  
      const totalRequests = await prisma.withdrawal.count({
        where: {
          userId: userId,
        },
      });
  
      const totalPages = Math.ceil(totalRequests / parsedMaxResults);
  
      const transactions = await prisma.withdrawal.findMany({
        where: {
          userId: userId,
        },
        take: parsedMaxResults,
        skip: (parsedPage - 1) * parsedMaxResults,
      });
  
      return res.status(200).json({
        transactions: transactions,
        currentPage: parsedPage,
        maxResults: parsedMaxResults,
        totalPages: totalPages,
      });
    } catch (err) {
      return res.status(400).json({
        err: err,
      });
    }
}
//#endregion

//#region
//edit withdrawal
async function editWithdraw(req:Request, res: Response) {
    try{

        const { name,userId, amount } = req.body

        //name for no reason it for my personal
        if( !name || ! userId || !amount ) { 
            return res.json({
                err: "Params Missing"
            })
        }

        const history = await prisma.history.create({
            data:{
                name: name,
                userId: userId,
                amount: amount
            }
        })

        const success = await prisma.withdrawal.delete({
            where: {
                userId: userId
            }
        })

        const inactiveuser = await prisma.user.update({
            where: {
                userId: userId,
            },
            data: {
                status: "Inactive"
            }
        })

        return res.json({
            msg: "History added and Withdrawal requst changed Successfully"
        })

    } catch(error) {
        return res.status(400).json({
            error: error
        })
    }
}
//#endregion

//#region
//get history
async function getHistory(req: Request, res: Response) {
    try {
        const { page = 1, maxResults = 10 } = req.body;

        const totalResult = await prisma.history.count();
        const totalPages = Math.ceil(totalResult / maxResults);

        const parsedPage = parseInt(page as string) || 1;

        const history = await prisma.history.findMany({
            skip: (parsedPage - 1) * maxResults,
            take: maxResults,
        });

        return res.status(200).json({
            history: history,
            currentPage: parsedPage,
            totalPages: totalPages,
            maxResults: totalResult,
        });

    } catch (error) {
        return res.status(400).json({
            error: error,
        });
    }
}

//#endregion

//#region
//delete the withdraw request
async function deleteWithdraw(req: Request, res: Response) {
    try{

        const { userId } = req.query

        if(!userId) {
            return res.status(401).json({
                msg: "UserId is required"
            })
        }

        const existWithdraw = await prisma.withdrawal.findFirst({
            where: {
                userId: userId as string
            }
        })

        if(!existWithdraw) {
            return res.json({
                msg: "UserId not found"
            })
        }

        const deleteRequest = await prisma.withdrawal.delete({
            where: {
                userId: userId as string
            }
        })

        if(!deleteRequest) {
            return res.json({
                msg : "Delete request id not found"
            })
        }

        return res.status(200).json({
            msg: "Withdrawal request Deleted successfully"
        })

    } catch(error) {
        return res.status(400).json({
            error: error
        })
    }
}
//#endregion
