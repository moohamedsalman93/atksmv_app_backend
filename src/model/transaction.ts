import { z } from "zod"

export const transactionSchema = z.object({
    userId: z.string({required_error: "userId is required"}),
    name: z.string({required_error: "name is required"}),
    amount: z.number({required_error: "amount is required"}),
    transId: z.string({required_error: "transId is required"}).optional(),
    count: z.number({required_error: "count is required"}),
    packId: z.string({required_error: "packId is required"})
})

export type transactionData = z.infer<typeof transactionSchema>