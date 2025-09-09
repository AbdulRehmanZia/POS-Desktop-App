import jwt from "jsonwebtoken"

export const superAdminMiddleware = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1]

    if(!token){
        return res.status(403).send({
            status:403,
            message: "Unauthorized"
        })
    }

  jwt.verify(token, process.env.SA_SECRET, (err, _)=> {
        if (err) {
            return res.status(403).send({
                status:403,
                message: "Invalid token"
            })
        }else{
            next()
        }
    })
}