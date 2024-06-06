import z, { object } from 'zod'

const userSchema = z.object({
    name: z.string({
        required_error: 'A name is required'
    }).max(20),
    lastname: z.string({
        required_error: 'A last name is required'
    }).max(20),
    country: z.string(),
    state: z.string(),
    city:z.string(),
    zipcode: z.number(), 
    street: z.string(),
    apartment: z.string().default(""),
    phone: z.string(),
    email: z.string({
        required_error:'An email adreess is required'
    }).email(),
    password: z.string().min(5)
})

const productSchema = z.object({
    productId: z.string(),
    name: z.string(),
    color: z.string(),
    size: z.string(),
    price: z.number(),
    quantity: z.number().positive(), 
    subtotal: z.number().positive(), 
    img: z.string()
})

export function validateUser(object){
    return userSchema.safeParse(object)
}

export function validatePartialUser(object){
    return userSchema.partial().safeParse(object)
}

export function validateProduct(object){
    return productSchema.safeParse(object)
}
