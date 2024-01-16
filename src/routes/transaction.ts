import express, { Request, Response, json } from 'express';
import { PrismaClient } from "@prisma/client";
import { transactionData, transactionSchema } from '../model/transaction';
import { fromZodError } from 'zod-validation-error';
import { date } from 'zod';

const prisma = new PrismaClient();

export const transactionRouter = express.Router();

//Routes
transactionRouter.post('/transaction', transaction)
transactionRouter.put('/transaction', getTransaction)
transactionRouter.put('/editTransaction', editTransaction)
transactionRouter.delete('/deleteTransaction', deleteTransaction)


//admin transaction
transactionRouter.get('/successTransaction', getSuccessTransaction)
transactionRouter.get('/pendingTransaction', getPendingTransaction)

//#region 
//success transaction
async function getSuccessTransaction(req: Request, res: Response) {
  try {
    const { page = 1, maxResults = 10 } = req.query;

    const parsedPage = parseInt(page as string) || 1;
    const parsedMaxResults = parseInt(maxResults as string) || 10;

    const totalEntries = await prisma.transaction.count({
      where: {
        status: "Success",
      },
    });

    const totalPages = Math.ceil(totalEntries / parsedMaxResults);

    const successTransaction = await prisma.transaction.findMany({
      where: {
        status: "Success",
      },
      orderBy: {
        createdOn: 'desc',
      },
      take: parsedMaxResults,
      skip: (parsedPage - 1) * parsedMaxResults,
    });

    return res.status(200).json({
      successTransaction: successTransaction,
      currentPage: parsedPage,
      totalPages: totalPages,
      totalEntries: totalEntries,
      maxResults: parsedMaxResults,
    });

  } catch (error) {
    return res.status(400).json({
      error: error,
    });
  }
}
//#endregion 


//#region 
//pending transaction
async function getPendingTransaction(req: Request, res: Response) {
  try {
    const { page = 1, maxResults = 10 } = req.query;

    const parsedPage = parseInt(page as string) || 1;
    const parsedMaxResults = parseInt(maxResults as string) || 10;

    const totalEntries = await prisma.transaction.count({
      where: {
        status: "Pending",
      },
    });

    const totalPages = Math.ceil(totalEntries / parsedMaxResults);

    const pendingTransaction = await prisma.transaction.findMany({
      where: {
        status: "Pending",
      },
      orderBy: {
        createdOn: 'desc',
      },
      take: parsedMaxResults,
      skip: (parsedPage - 1) * parsedMaxResults,
    });

    return res.status(200).json({
      pendingTransaction: pendingTransaction,
      currentPage: parsedPage,
      totalPages: totalPages,
      totalEntries: totalEntries,
      maxResults: parsedMaxResults,
    });

  } catch (error) {
    return res.status(400).json({
      error: error,
    });
  }
}
//#endregion 

//#region
//make traction
async function transaction(req: Request, res: Response) {
    try{

        const data = transactionSchema.safeParse(req.body);
  
        if (!data.success) {
          let errMessage: string = fromZodError(data.error).message;
          return res.status(400).json({
            error: {
              message: errMessage,
            },
          });
        }
    
        const resultData: transactionData = data.data;
    
        if (!resultData) {
          return res.status(409).json({
            error: {
              message: "Invalid params",
            },
          });
        }

        const user = await prisma.user.findFirst({
            where: {
                userId: resultData.userId
            }
          });

        if(!user) {
            return res.status(401).json({
                error: "userId not found"
            });
        }

        const success = await prisma.transaction.create({
            data: {
                userId: resultData.userId,
                name: resultData.name,
                amount: resultData.amount,
                transId: resultData.transId,
                count: resultData.count,
                packId: resultData.packId
            }
        });

        if(success) {
            return res.status(200).json({
                msg: "Send money via online. Take screenshot and contact admin in whatspp"
            })
        }

    } catch(error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
//#endregion

//#region
//get transaction history
async function getTransaction(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;

    // Fetch all transactions for the user
    let allTransactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
      },
    });

    // Sort the transactions array to ensure 'Pending' status records appear first
    allTransactions.sort((a, b) => {
      if (a.status === "Pending") return -1; // 'Pending' records come first
      if (b.status === "Pending") return 1;  // 'Pending' records come first
      return 0; // All other records maintain their original order
    });

    return res.status(200).json({
      transactions: allTransactions,
    });

  } catch (err) {
    console.error("Error fetching transactions:", err); // Log the error for debugging
    return res.status(400).json({
      error: "Failed to fetch transactions",
    });
  }
}
//#endregion

//#region
//edit the amount of transaction
async function editTransaction(req: Request, res: Response) {
  try{

    const { id } = req.body;

    if(!id) {
      return res.json({
        msg: "id is required"
      })
    }

    const amount = await prisma.transaction.update({
      where: {
        id: id,
      },
      data: {
        status: "Success"
      }
    })

    return res.status(200).json({
      msg: "Status Changed to success"
    })

  } catch(err) {
    return res.status(400).json({
      error: "Internal server error",err
    })
  }
}
//#endregion

//#region
//delete the transaction request
async function deleteTransaction(req: Request, res: Response) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.json({
        msg: "Transaction ID is required",
      });
    }

    const delUser = await prisma.transaction.delete({
      where: {
        id: parseInt(id as string),
      },
    });

    return res.status(200).json({
      msg: "Transaction request deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      error: error
    });
  }
}
//#endregion
