import {z} from 'zod'

export const nomineeSchema = z.object({
    name: z.string({required_error: "Name is required"}),
    email: z.string({required_error: "Email id is required"}),
    mobile: z.string({required_error: "Mobile number is required"}).min(10),
    aadhar: z.string({required_error: "aadhar is required"}),
    pan: z.string({required_error: "pan is required"}).optional(),
    upi_id: z.string({required_error: "upi_id id is required"}).optional(),
    IFSC: z.string({required_error: "IFSC code is required"}),
    account_no: z.string({required_error: "Account number is required"}),
    account_holder: z.string({required_error: "Account Holder name is required"}),
    userId: z.string({required_error: "userId is required"})
})

export type nomineeData = z.infer<typeof nomineeSchema>