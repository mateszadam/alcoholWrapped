'use client';

import React, { useEffect, useState } from 'react';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	PointElement,
	LineElement,
	ArcElement,
	Title,
	Tooltip,
	Legend,
	Filler,
	ChartData,
	ChartOptions,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import './Dashboard.css';

interface Kpi {
	_id: null;
	totalVolume: number;
	totalCount: number;
	activeDays: number;
	avgPerDay: number;
}

interface DailyTrend {
	_id: string;
	dailyTotal: number;
}

interface HourlyDist {
	_id: number;
	hourlyTotal: number;
}

interface DrinkDetails {
	_id: string;
	name: string;
	alcohol: number;
	imageUrl: string;
	unitOfMeasurement: string;
	__v: number;
}

interface TopDrink {
	_id: string;
	count: number;
	volume: number;
	drinkDetails: DrinkDetails;
}

interface DashboardData {
	kpis: Kpi[];
	dailyTrend: DailyTrend[];
	hourlyDist: HourlyDist[];
	topDrinks: TopDrink[];
}

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	PointElement,
	LineElement,
	ArcElement,
	Title,
	Tooltip,
	Legend,
	Filler
);

export default function StatisticsPage() {
	const [data, setData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const res = await fetch('/api/statistic');
				if (!res.ok) throw new Error('Hiba a lekérdezésben');

				const json: DashboardData = await res.json();
				setData(json);
			} catch (err) {
				console.error('Hiba:', err);
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, []);

	if (loading)
		return (
			<div className="p-10 text-center text-gray-500">Adatok betöltése...</div>
		);
	if (!data)
		return (
			<div className="p-10 text-center text-red-500">
				Nem sikerült betölteni az adatokat.
			</div>
		);

	const KpiCard: React.FC<{ label: string; value: string | number }> = ({
		label,
		value,
	}) => (
		<div className="kpi-card">
			<div className="kpi-value">{value}</div>
			<div className="kpi-label">{label}</div>
		</div>
	);

	const HourlyChart: React.FC<{ data: HourlyDist[] }> = ({ data }) => {
		const fullDay = Array.from({ length: 24 }, (_, i) => {
			const found = data.find((d) => d._id === i);
			return { hour: i, total: found ? found.hourlyTotal : 0 };
		});

		const maxVal = Math.max(...fullDay.map((d) => d.total), 10);

		return (
			<div className="chart-container">
				<h3>Óránkénti eloszlás (mennyiség)</h3>
				<div className="bar-chart">
					{fullDay.map((d) => (
						<div
							key={d.hour}
							className="bar-wrapper"
							title={`${d.hour}:00 - ${d.total}`}
						>
							<div
								className="bar"
								style={{ height: `${(d.total / maxVal) * 100}%` }}
							></div>
							<span className="bar-label">{d.hour}</span>
						</div>
					))}
				</div>
			</div>
		);
	};

	const DailyChart: React.FC<{ data: DailyTrend[] }> = ({ data }) => {
		if (data.length === 0) return <div>Nincs adat</div>;

		const maxVal = Math.max(...data.map((d) => d.dailyTotal), 1);

		return (
			<div className="chart-container">
				<h3>Napi trend (mennyiség)</h3>
				<div className="bar-chart trend-chart">
					{data.map((d) => (
						<div
							key={d._id}
							className="bar-wrapper"
							title={`${d._id}: ${d.dailyTotal}`}
						>
							<div className="bar-value">{d.dailyTotal}</div>
							<div
								className="bar trend-bar"
								style={{ height: `${(d.dailyTotal / maxVal) * 100}%` }}
							></div>
							<span className="bar-label">
								{new Date(d._id).toLocaleDateString(undefined, {
									month: 'short',
									day: 'numeric',
								})}
							</span>
						</div>
					))}
				</div>
			</div>
		);
	};

	const DrinkItem: React.FC<{ drink: TopDrink }> = ({ drink }) => (
		<div className="drink-row">
			<div className="drink-img-wrapper">
				<img
					src={drink.drinkDetails.imageUrl}
					alt={drink.drinkDetails.name}
				/>
			</div>
			<div className="drink-info">
				<h4>{drink.drinkDetails.name}</h4>
				<div className="drink-stats">
					<span>
						Mennyiség:{' '}
						<strong>
							{Number(drink.volume).toFixed(2)}{' '}
							{drink.drinkDetails.unitOfMeasurement}
						</strong>
					</span>
					<span>
						Darabszám: <strong>{drink.count}</strong>
					</span>
					<span>
						Alkoholfok: <strong>{drink.drinkDetails.alcohol}%</strong>
					</span>
				</div>
			</div>
		</div>
	);

	const Dashboard: React.FC = () => {
		const { kpis, hourlyDist, dailyTrend, topDrinks } = data;
		const kpi = kpis[0];

		return (
			<div
				className="dashboard"
				style={{ marginTop: '80px' }}
			>
				{kpi && (
					<section className="kpi-grid">
						<KpiCard
							label="Összes mennyiség"
							value={kpi.totalVolume}
						/>
						<KpiCard
							label="Összes darabszám"
							value={kpi.totalCount}
						/>
						<KpiCard
							label="Aktív napok"
							value={kpi.activeDays}
						/>
						<KpiCard
							label="Átlag / nap"
							value={kpi.avgPerDay}
						/>
					</section>
				)}

				<div className="main-content-grid">
					<div className="charts-column">
						<DailyChart data={dailyTrend} />
						<HourlyChart data={hourlyDist} />
					</div>

					<div className="drinks-column">
						<div className="card">
							<h3>Top italok</h3>
							<div className="drinks-list">
								{topDrinks.map((drink) => (
									<DrinkItem
										key={drink._id}
										drink={drink}
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};
	return <Dashboard />;
}
