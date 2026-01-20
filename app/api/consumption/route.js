// stats/hourly/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Consumption from '../../../models/Consumptions';
import connectDB from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request) {
	try {
		await connectDB();
		const user = await currentUser();

		if (user) {
			const consumption = await Consumption.aggregate([
				{
					$match: { user: user.id },
				},
				{
					$group: {
						_id: '$drinkId',
						totalAmountConsumed: {
							$sum: { $toDouble: '$amount' },
						},
						lastTimeDrank: {
							$max: '$time',
						},
						timesConsumed: {
							$sum: 1,
						},
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
				{
					$project: {
						_id: 0,
						drinkId: '$_id',
						drinkName: '$drinkDetails.name',
						unit: '$drinkDetails.unitOfMeasurement',
						alcoholContent: '$drinkDetails.alcohol',
						imageUrl: '$drinkDetails.imageUrl',
						totalAmountConsumed: 1,
						lastTimeDrank: 1,
						timesConsumed: 1,
					},
				},
				{
					$sort: { lastTimeDrank: -1 },
				},
			]);
			return NextResponse.json(consumption);
		} else {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: 'Server Error' }, { status: 500 });
	}
}
export async function POST(request) {
	try {
		await connectDB();
		const user = await currentUser();
		if (!user) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const { drinkId, amount, time } = await request.json();
		if (!drinkId || amount === undefined) {
			return NextResponse.json(
				{ message: 'drinkId and amount are required' },
				{ status: 400 },
			);
		}

		const entry = await Consumption.create({
			drinkId,
			amount,
			time: time ? new Date(time) : new Date(),
			user: user.id,
		});

		return NextResponse.json(entry, { status: 201 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: 'Server Error' }, { status: 500 });
	}
}
