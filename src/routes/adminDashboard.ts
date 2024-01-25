import { PrismaClient } from '@prisma/client';
import express, { Request, Response } from 'express';

import { startOfMonth, endOfMonth } from 'date-fns';

const prisma = new PrismaClient();
export const adminDashboard = express.Router()

//Routes
adminDashboard.get('/dashboard', getDashboard)

//#region getDashboard
async function getDashboard(req: Request, res: Response) {


    const currentDate = new Date();
    const startOfMonthDate = startOfMonth(currentDate);
    const endOfMonthDate = endOfMonth(currentDate);

    try {
        const [allTransactions, allHistory] = await Promise.all([
            prisma.transaction.findMany({where:{
                status:"Success"
            }}),
            prisma.history.findMany()
        ]);

        // Batch the database queries for current month transactions and withdrawals
        const [currentMonthTransactions, currentMonthWithdrawals] = await Promise.all([
            prisma.transaction.findMany({
                where: {
                    createdOn: {
                        gte: startOfMonthDate,
                        lte: endOfMonthDate,
                    },
                    status:"Success"
                },
            }),
            prisma.history.findMany({
                where: {
                    createdOn: {
                        gte: startOfMonthDate,
                        lte: endOfMonthDate,
                    },
                },
            }),
        ]);

        // Perform necessary data manipulation for current month transactions and withdrawals
        const currentMonthTransAmount = currentMonthTransactions.reduce((acc, curr) => acc + (curr?.amount ?? 0), 0);
        const currentMonthWithAmount = currentMonthWithdrawals.reduce((acc, curr) => acc + (curr?.amount ?? 0), 0);
        const noCurrentMonthTrans = currentMonthTransactions.length;
        const noCurrentMonthWith = currentMonthWithdrawals.length;
        // Perform necessary data manipulation
        const overallAmount = allTransactions.reduce((acc, curr) => acc + (curr?.amount ?? 0), 0);
        const overallWith = allHistory.reduce((acc, curr) => acc + (curr?.amount ?? 0), 0);


        // Construct the response
        return res.status(200).json({
            data: [
                {
                    title: 'Total amount',
                    amount: overallAmount
                },
                {
                    title: 'Total returned',
                    amount: overallWith
                },
                {
                    title: 'Total amount',
                    amount: currentMonthTransAmount
                },
                {
                    title: 'Total returned',
                    amount: currentMonthWithAmount
                },
                {
                    title: 'No. Paid',
                    amount: noCurrentMonthTrans
                },
                {
                    title: 'No. Withdraw',
                    amount: noCurrentMonthWith
                },
            ]
        });
    } catch (error) {
        return res.status(400).json({
            error: error,
        });
    }
}

//#endregion


