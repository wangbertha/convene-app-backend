const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient().$extends({
    model: {
        user: {
            async register(email, password, firstname) {
                try {
                    const hashedPass = await bcrypt.hash(password, 10);
                    const user = await prisma.user.create({
                        data: { email, password: hashedPass, firstname },
                    });
                    return user;
                } catch (e) {
                    if (e.code === 'P2002') {
                        throw new Error("email already taken...");
                    }
                    throw e;
                }
            },
            async login(email, password) {
                try {
                    const user = await prisma.user.findUniqueOrThrow({
                        where: { email },
                    });
                    const valid = await bcrypt.compare(password, user.password);
                    if(!valid) {
                        throw Error("Invalid password");
                    }
                    return user
                } catch (e) {
                    throw e;
                }
            },
        }
    }
})

module.exports = prisma