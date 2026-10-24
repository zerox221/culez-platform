const {z} = require('zod');

exports.registerSchema = z.object({
    name : z.string().min(4,"password must contain 4 characters").max(30,"password should be of less then 30 characters"),
    email : z.email(),
    password : z.string().min(4,"Password must contain more then 4 characters"),
    college: z.string().min(1, "College is required")
})

