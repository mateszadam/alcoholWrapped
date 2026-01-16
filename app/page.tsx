import connectDB from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import './globals.css';
import Login from './Login/login';
import LeftSide from './consumptions/page';
import UserConsumptions from './consumptions/page';
import Drinks from './drinks/page';
import { redirect } from 'next/dist/server/api-utils';

export default async function Home() {
	await connectDB();
	const user = await currentUser();
	if (!user) {
		return Login();
	}
	return <UserConsumptions />;
}
