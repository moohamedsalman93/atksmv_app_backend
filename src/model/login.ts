import { z } from "zod"

export const loginSchema = z.object({
    email: z.string({required_error: "Email id is required"}),
    password: z.string({required_error: "password is required"})
})

export const signUpSchema = z.object({
    // userId: z.string({required_error: "userId is required"}), 
    name: z.string({required_error: "Name is required"}),
    email: z.string({required_error: "Email id is required"}),
    mobile: z.string({required_error: "Mobile number is required"}).min(10),
    password: z.string({required_error: "password is required"}),
    DOB: z.string({required_error: "DOB is required"}),
    aadhar: z.string({required_error: "aadhar is required"}).max(12),
    pan: z.string({required_error: "pan is required"}).optional(),
    address: z.string({required_error: "Address is required"}).optional(),
    secondary_mobile: z.string({ required_error: "secondary_mobile is required" }).optional(),
    upi_id: z.string({required_error: "UPI id is required"}).optional(),
    IFSC: z.string({required_error: "IFSC code is required"}),
    account_no: z.string({required_error: "Account number is required"}),
    account_holder: z.string({required_error: "Account Holder name is required"}),
})

export type loginData = z.infer<typeof loginSchema>
export type signUpData = z.infer<typeof signUpSchema>