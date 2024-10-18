import { Request, Response } from 'express';
import { Schema } from 'mongoose';
import User from '../models/User.js';
import { signToken, AuthenticationError } from '../services/auth.js';
import { UserContext } from '../models/User.js';

const resolvers = {
    Query: {
        getSingleUser: async (_: any, _args: any, context: UserContext  | null) => {
            if (context) {
            const foundUser = await User.findOne({
                _id: context._id,
            });
        
            if (!foundUser) {
                throw new Error('Cannot find a user with this id!');
            }

            return foundUser;
            }
            else {
                throw new Error('You need to be logged in!');
            }
        },
    },
    Mutation: {
        addUser: async (_: any, args: any) => {
            const user = await User.create(args);

            if (!user) {
                throw new Error('Something is wrong!');
            }
            const token = signToken(user.username, user.password, user._id);
            return { 
                token, 
                user: {
                    username: user.username,
                    email: user.email,
                    _id: user._id as Schema.Types.ObjectId
                }
            };
        },
        login: async (_parent: any, { email, password }: { email: string; password: string }): Promise<{ token: string; user: UserContext }> => {
            const user = await User.findOne({ email });
      
            if (!user || !(await user.isCorrectPassword(password))) {
              throw new AuthenticationError('Invalid credentials');
            }
      
            const token = signToken(user.username, user.email, user._id);
            return { 
                token, 
                user: {
                    username: user.username,
                    email: user.email,
                    _id: user._id as Schema.Types.ObjectId,
                    password: null,
                    savedBooks: null
                }
            };
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
        removeBook: async (_: any, { bookId }: { bookId: string }, context: { req: Request; res: Response }) => {
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