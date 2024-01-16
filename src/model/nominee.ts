import {z} from 'zod'

export const nomineeEditSchema = z.object({
    name: z.string({required_error: "Name is required"}).optional(),
    email: z.string({required_error: "Email id is required"}).optional(),
    mobile: z.string({required_error: "Mobile number is required"}).min(10).optional(),
    aadhar: z.string({required_error: "aadhar is required"}).optional(),
    pan: z.string({required_error: "pan is required"}).optional(),
    upi_id: z.string({required_error: "upi_id id is required"}).optional(),
    IFSC: z.string({required_error: "IFSC code is required"}).optional(),
    account_no: z.string({required_error: "Account number is required"}).optional(),
    account_holder: z.string({required_error: "Account Holder name is required"}).optional(),
    userId: z.string({required_error: "userId is required"}).optional(),
})

export type nomineeEditData = z.infer<typeof nomineeEditSchema>