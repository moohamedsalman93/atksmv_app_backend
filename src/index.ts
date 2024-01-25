import express from 'express';
import cors from 'cors';
import { loginRouter } from './routes/login';
import { transactionRouter } from './routes/transaction';
import { packageRouter } from './routes/packages';
import { adminRouter } from './routes/admin';
import { userRouter } from './routes/user';
import { withdrawRouter } from './routes/withdrawal';
import { nomineeRouter } from './routes/nominee';
import { adminDashboard } from './routes/adminDashboard';

const app = express();


require('dotenv').config()

app.use(cors());

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 3001;

app.use('/user', loginRouter, transactionRouter, packageRouter, userRouter, withdrawRouter);
app.use('/admin', adminRouter, withdrawRouter, packageRouter, loginRouter, transactionRouter, userRouter, nomineeRouter,adminDashboard)

app.listen(PORT, () => {
    console.log(`sip backend server listening on ${PORT}`)    
})