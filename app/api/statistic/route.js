// stats/hourly/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Consumption from '../../../models/Consumptions';
import connectDB from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request) {
	try {
		await connectDB();
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		const user = await currentUser();

		if (user) {
			const stats = await Consumption.aggregate([
				{
					$match: {
						user: user?.id,
						time: { $gte: thirtyDaysAgo },
					},
				},
				{
					$addFields: {
						amountNum: { $toDouble: '$amount' },
						dateString: {
							$dateToString: { format: '%Y-%m-%d', date: '$time' },
						},
						hour: { $hour: '$time' },
					},
				},
				{
					$facet: {
						kpis: [
							{
								$group: {
									_id: null,
									totalVolume: { $sum: '$amountNum' },
									totalCount: { $sum: 1 },
									uniqueDays: { $addToSet: '$dateString' },
								},
							},
							{
								$project: {
									totalVolume: 1,
									totalCount: 1,
									activeDays: { $size: '$uniqueDays' },
									avgPerDay: {
										$divide: ['$totalVolume', { $size: '$uniqueDays' }],
									},
								},
							},
						],
						dailyTrend: [
							{
								$group: {
									_id: '$dateString',
									dailyTotal: { $sum: '$amountNum' },
								},
							},
							{ $sort: { _id: 1 } },
						],
						hourlyDist: [
							{
								$group: {
									_id: '$hour',
									hourlyTotal: { $sum: '$amountNum' },
								},
							},
							{ $sort: { _id: 1 } },
						],
						topDrinks: [
							{
								$group: {
									_id: '$drinkId',
									count: { $sum: 1 },
									volume: { $sum: '$amountNum' },
								},
							},
							{
								$lookup: {
									from: 'drinks',
									localField: '_id',
									foreignField: '_id',
									as: 'drinkDetails',
								},
							},
							{
								$unwind: '$drinkDetails',
							},
							{ $sort: { count: -1 } },
							{ $limit: 5 },
						],
					},
				},
			]);

			return NextResponse.json(stats[0]);
		} else {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: 'Server Error' }, { status: 500 });
	}
}
