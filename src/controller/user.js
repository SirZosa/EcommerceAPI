import { validateUser, validatePartialUser, validateProduct } from "../validations/userValidation.js"

export class UserController{
    constructor({userModel}){
        this.userModel = userModel
    }

    logIn = async(req, res)=>{
        const result = validatePartialUser(req.body)
        if(result.error){
            return res.status(400).json(JSON.parse(result.error.message))
        }
        const isLogged = await this.userModel.logIn({input:result.data})
        if(!isLogged){
            return res.status(401).json({message:'Incorrect user and/or password.'})
        }
        return res.status(200).json(isLogged)
    }

    register = async(req, res)=>{
        const result = validateUser(req.body)
        if(result.error){
            return res.status(400).json(JSON.parse(result.error.message))
        }
        const isRegistered = await this.userModel.register({input:result.data})
        if(isRegistered.error){
            return res.status(409).json(isRegistered)
        }
        
        return res.status(201).json(isRegistered)
    }

    profile = async(req, res)=>{
        const userData = await this.userModel.profile({input:req.user})
        if(userData.e){
            return res.status(400).json(userData)
        }
        return res.status(200).json(userData)
    }

    editUser = async(req,res)=>{
        const result = validatePartialUser(req.body)
        if(result.error){
            return res.status(400).json(JSON.parse(result.error.message))
        }
        const user = await this.userModel.editUser({input:result.data, id:req.user.userId})
        if(user.e){
            return res.status(400).json({message:"Changes could not been made."})
        }
        return res.status(200).json({message:"changes saved"})
    }

    addProduct = async(req, res) =>{
        
        const result = validateProduct(req.body)
        if(result.error){
            console.log(result.error)
            return res.status(400).json(JSON.parse(result.error.message))
        }
        const addToCart = await this.userModel.addProduct({input:result.data, id:req.user.userId})
        if(addToCart.e){
            return res.status(400).json({message:"Internal error"})
        }
        return res.status(200).json({message:"Product added"})
    }

    getCart = async(req, res)=>{
        const cart = await this.userModel.getCart({id:req.user.userId})
        if(cart.e){
            return res.status(400).json({messaje:'Cart could not be retreived.'})
        }
        return res.status(200).json(cart)
    }

    deleteProduct = async(req, res) =>{
        const { id } = req.params
        const results = await this.userModel.deleteProduct({id:id})
        if(results.e){
            return res.status(400).json(results.e)
        }
        return res.status(200).json(results)
    }

    createOrder = async(req, res) =>{
        const results = await this.userModel.createOrder({input:req.body, user:req.user.userId})
        if(results.e){
            return res.status(400).json(results.e)
        }
        return res.status(200).json(results)
    }

    getOrder = async(req, res)=>{
        const results = await this.userModel.getOrder({user:req.user.userId})
        if(results.e){
            return res.status(400).json(results.e)
        }
        return res.status(200).json(results)
    }
}