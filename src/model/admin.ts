import {z} from 'zod'

export const userEditSchema = z.object({
    name: z.string({required_error: "name is required"}).optional(),
    email: z.string({required_error: "email is required"}).optional(),
    password: z.string({required_error: "password is required"}).optional(),
    DOB: z.string({required_error: "DOB is required"}).optional(),
    aadhar: z.string({required_error: "aadhar is required"}).optional(),
    pan: z.string({required_error: "pan is required"}).optional(),
    mobile: z.string({required_error: "mobile is required"}).optional(),
    secondary_mobile: z.string({required_error: "secondary_mobile is required"}).optional(),
    address: z.string({required_error: "address is required"}).optional(),
    account_no: z.string({required_error: "account_no is required"}).optional(),
    upi_id: z.string({required_error: "upi_id is required"}).optional(),
    account_holder: z.string({required_error: "account_holder is required"}).optional(),
    IFSC: z.string({required_error: "IFSC is required"}).optional(),
    amount: z.number({required_error: "amount is required"}).optional(),
    return: z.number({required_error: "return is required"}).optional(),
})

export type userEditData = z.infer<typeof userEditSchema>