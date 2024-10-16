import { Request, Response } from 'express';

import User from '../models/User.js';
import { signToken } from '../services/auth.js';


const resolvers = {
    Query: {
        getSingleUser: async (_: any, { id, username }: { id: string; username: string }, context: { req: Request; res: Response }) => {
            const foundUser = await User.findOne({
                $or: [{ _id: context.req.user ? context.req.user._id : id }, { username }],
            });

            if (!foundUser) {
                throw new Error('Cannot find a user with this id!');
            }

            return foundUser;
        },
    },
    Mutation: {
        addUser: async (_: any, args: any) => {
            const user = await User.create(args);

            if (!user) {
                throw new Error('Something is wrong!');
            }
            const token = signToken(user.username, user.password, user._id);
            return { token, user };
        },
        login: async (_: any, { username, email, password }: { username: string; email: string; password: string }, context: { req: Request; res: Response }) => {
            const user = await User.findOne({ $or: [{ username }, { email }] });
            if (!user) {
                throw new Error("Can't find this user");
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new Error('Wrong password!');
            }
            const token = signToken(user.username, user.password, user._id);
            return { token, user };
        },
        saveBook: async (_: any, args: any, context: { req: Request; res: Response }) => {
            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.req.user._id },
                    { $addToSet: { savedBooks: args } },
                    { new: true, runValidators: true }
                );
                return updatedUser;
            } catch (err) {
                console.log(err);
                throw new Error('Error saving book');
            }
        },
        deleteBook: async (_: any, { bookId }: { bookId: string }, context: { req: Request; res: Response }) => {
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.req.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );
            if (!updatedUser) {
                throw new Error("Couldn't find user with this id!");
            }
            return updatedUser;
        },
    },
};

export default resolvers;