import { Router } from "express";
import { UserController } from "../controller/user.js";
import { authenticate } from "../middlewares/tokenvalidation.js";

export const createUserRouter = ({userModel})=>{
    const apiRouter = Router()
    const userController = new UserController({userModel})
    
    apiRouter.post('/login', userController.logIn)
    apiRouter.post('/register', userController.register)
    apiRouter.get('/profile', authenticate, userController.profile)
    apiRouter.patch('/profile',authenticate, userController.editUser)
    apiRouter.post('/cart', authenticate, userController.addProduct)
    apiRouter.get('/cart', authenticate, userController.getCart)
    apiRouter.delete('/cart/:id', authenticate, userController.deleteProduct)
    apiRouter.post('/orders', authenticate, userController.createOrder)
    apiRouter.get('/orders', authenticate, userController.getOrder)
    return apiRouter
}
