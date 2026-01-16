// stats/hourly/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Consumption from '../../../models/Consumptions';
import connectDB from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import Drinks from '../../../models/Drinks';

export async function GET(request) {
	try {
		await connectDB();
		const user = await currentUser();

		if (user) {
			const drinks = await Drinks.find({});
			return NextResponse.json(drinks);
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

		const payload = await request.json();
		if (!payload || !payload.name) {
			return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
		}

		const createdDrink = await Drinks.create({ ...payload });
		return NextResponse.json(createdDrink, { status: 201 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: 'Server Error' }, { status: 500 });
	}
}
