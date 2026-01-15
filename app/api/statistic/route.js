// stats/hourly/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Consumption from '../../../models/Consumptions';
import connectDB from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request) {
	try {
		await connectDB();

		// 1. Dátum szűrés (pl. elmúlt 30 nap) - Opcionális, de ajánlott
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		const user = await currentUser();
		const stats = await Consumption.aggregate([
			{
				$match: {
					user: user?.id,
					time: { $gte: thirtyDaysAgo },
				},
			},
			// Előkészítő lépés: konvertáljuk a stringet számmá és kinyerjük a dátum részeket
			{
				$addFields: {
					amountNum: { $toDouble: '$amount' }, // "200" -> 200
					dateString: { $dateToString: { format: '%Y-%m-%d', date: '$time' } },
					hour: { $hour: '$time' },
				},
			},
			{
				$facet: {
					// 1. SZEKCIÓ: KPI Kártyák (Összesítő adatok)
					kpis: [
						{
							$group: {
								_id: null,
								totalVolume: { $sum: '$amountNum' }, // Összes megivott
								totalCount: { $sum: 1 }, // Hányszor ivott
								uniqueDays: { $addToSet: '$dateString' }, // Egyedi napok
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

					// 2. SZEKCIÓ: Napi trend (utolsó 30 nap)
					dailyTrend: [
						{
							$group: {
								_id: '$dateString',
								dailyTotal: { $sum: '$amountNum' },
							},
						},
						{ $sort: { _id: 1 } }, // Dátum szerint növekvő
					],

					// 3. SZEKCIÓ: Óránkénti eloszlás (amit az előbb beszéltünk)
					hourlyDist: [
						{
							$group: {
								_id: '$hour',
								hourlyTotal: { $sum: '$amountNum' },
							},
						},
						{ $sort: { _id: 1 } },
					],

					// 4. SZEKCIÓ: Top Italok (DrinkID szerint)
					// Ha van 'drinks' táblád, itt használnál $lookup-ot
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
								from: 'drinks', // Target collection
								localField: '_id', // The _id from Stage 1 is the drinkId
								foreignField: '_id', // Matching _id in Drinks
								as: 'drinkDetails',
							},
						},
						{
							$unwind: '$drinkDetails',
						},
						{ $sort: { count: -1 } }, // Legnépszerűbb elöl
						{ $limit: 5 },
					],
				},
			},
		]);

		return NextResponse.json(stats[0]);
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: 'Server Error' }, { status: 500 });
	}
}
