import {z} from 'zod'

export const monthPackageSchema = z.object({
    amount : z.number({required_error: "amount is required"}),
    years : z.number({required_error: "years is required"}),
    returns : z.number({required_error: "returns is required"}),
})

export const monthPackageEditSchema = z.object({
    amount : z.number({required_error: "amount is required"}).optional(),
    years : z.number({required_error: "years is required"}).optional(),
    returns : z.number({required_error: "returns is required"}).optional(),
})

export const annualPackageSchema = z.object({
    amount : z.number({required_error: "amount is required"}),
    years : z.number({required_error: "years is required"}),
    returns : z.number({required_error: "returns is required"}),
})

export const annualPackageEditSchema = z.object({
    amount : z.number({required_error: "amount is required"}).optional(),
    years : z.number({required_error: "years is required"}).optional(),
    returns : z.number({required_error: "returns is required"}).optional(),
})

export type monthPackageData = z.infer<typeof monthPackageSchema>
export type monthPackageEditData = z.infer<typeof monthPackageEditSchema>
export type annualPackageData = z.infer<typeof annualPackageSchema>
export type annualPackageEditData = z.infer<typeof annualPackageEditSchema>