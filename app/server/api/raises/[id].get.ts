import { defineEventHandler } from 'h3';
import { Raise } from '@/server/models/raise';

interface RaiseDocument {
  _id: any;
  user: any;
  raiser?: {
    _id: any;
    firstName: string;
    lastName: string;
  } | null;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RaiseResponse {
  _id: string;
  user: string;
  raiser: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.params?.id;
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      });
    }

    const [raises, total] = await Promise.all([
      Raise.find({ user: userId })
        .populate<{ raiser: { _id: any; firstName: string; lastName: string } | null }>('raiser', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<RaiseDocument[]>(),
      Raise.countDocuments({ user: userId })
    ]);

    return {
      raises: raises.map<RaiseResponse>(raise => ({
        ...raise,
        _id: raise._id.toString(),
        user: raise.user.toString(),
        raiser: raise.raiser ? {
          _id: raise.raiser._id.toString(),
          firstName: raise.raiser.firstName,
          lastName: raise.raiser.lastName
        } : null,
        amount: raise.amount,
        createdAt: raise.createdAt,
        updatedAt: raise.updatedAt
      })),
      total
    };

  } catch (error) {
    console.error('Error fetching user raises:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user raises';
    const statusCode = (error as any)?.statusCode || 500;
    
    throw createError({
      statusCode: statusCode,
      statusMessage: errorMessage,
      data: {
        message: 'Failed to fetch user raises'
      }
    });
  }
});