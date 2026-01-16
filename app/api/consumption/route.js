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
					// Stage 1: Group by drinkId to calculate stats
					$group: {
						_id: '$drinkId',
						totalAmountConsumed: {
							$sum: { $toDouble: '$amount' }, // Convert String to Number to sum it
						},
						lastTimeDrank: {
							$max: '$time', // Get the most recent date
						},
						timesConsumed: {
							$sum: 1, // Count how many times it was logged
						},
					},
				},
				{
					// Stage 2: Join with the Drinks collection to get details
					$lookup: {
						from: 'drinks', // Target collection
						localField: '_id', // The _id from Stage 1 is the drinkId
						foreignField: '_id', // Matching _id in Drinks
						as: 'drinkDetails',
					},
				},
				{
					// Stage 3: Flatten the drinkDetails array
					$unwind: '$drinkDetails',
				},
				{
					// Stage 4: Format the final output (Optional but recommended)
					$project: {
						_id: 0, // Hide the raw ID
						drinkId: '$_id', // Keep the ID reference
						drinkName: '$drinkDetails.name', // Pull name to top level
						unit: '$drinkDetails.unitOfMeasurement',
						alcoholContent: '$drinkDetails.alcohol',
						imageUrl: '$drinkDetails.imageUrl',
						totalAmountConsumed: 1, // Pass through calculated field
						lastTimeDrank: 1, // Pass through calculated field
						timesConsumed: 1, // Pass through calculated field
					},
				},
				{
					// Stage 5: Sort by most recently consumed (Optional)
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
				{ status: 400 }
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
