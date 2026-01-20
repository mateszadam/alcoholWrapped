'use client';
import Drink from '@/models/Drinks';
import { redirect } from 'next/navigation';
import './Drinks.css';
import { useEffect, useState } from 'react';
export default function Drinks() {
	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL ??
		(process.env.VERCEL_URL
			? `https://${process.env.VERCEL_URL}`
			: 'http://localhost:3000');

	interface IDrink {
		_id: string;
		name: string;
		alcohol: number;
		imageUrl: string;
		unitOfMeasurement: string;
	}
	const [drinks, setDrinks] = useState<IDrink[] | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const res = await fetch('/api/drinks');
				if (!res.ok) throw new Error('Hiba a lekérdezésben');

				const json: IDrink[] = await res.json();
				setDrinks(json);
			} catch (err) {
				console.error('Hiba:', err);
			}
		};
		fetchStats();
	}, []);

	return (
		<div
			className="page-wrapper"
			style={{ marginTop: '80px' }}
		>
			<div className="container">
				<div className="left-section">
					<h2 className="section-title">Itallap</h2>

					<div className="drink-grid">
						{drinks?.map((drink) => (
							<div
								key={drink._id.toString()}
								className="card"
							>
								<div
									style={{
										height: '180px',
										backgroundColor: '#eee',
										position: 'relative',
									}}
								>
									{drink.imageUrl ? (
										<img
											src={drink.imageUrl}
											alt={drink.name}
											style={{
												width: '100%',
												height: '100%',
												objectFit: 'cover',
											}}
										/>
									) : null}
									<div
										style={{
											display: drink.imageUrl ? 'none' : 'flex',
											width: '100%',
											height: '100%',
											alignItems: 'center',
											justifyContent: 'center',
											backgroundColor: '#e2e8f0',
											color: '#94a3b8',
											position: 'absolute',
											top: 0,
											left: 0,
										}}
									>
										<span style={{ fontSize: '40px' }}>🍸</span>
									</div>
								</div>

								<div style={{ padding: '20px' }}>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'start',
											marginBottom: '10px',
										}}
									>
										<h4
											style={{
												margin: 0,
												fontSize: '18px',
												fontWeight: '700',
												maxWidth: '160px',
												whiteSpace: 'nowrap',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
											}}
										>
											{drink.name}
										</h4>
										<span className="badge">{drink.alcohol}%</span>
									</div>

									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '8px',
											color: '#64748b',
											fontSize: '14px',
										}}
									>
										<svg
											width="16"
											height="16"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
											></path>
										</svg>
										<span>Mértékegység: {drink.unitOfMeasurement}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="right-section sticky-sidebar">
					<div
						className="card2"
						style={{ padding: '30px' }}
					>
						<h3
							className="section-title"
							style={{ fontSize: '20px', marginBottom: '20px' }}
						>
							Új ital hozzáadása
						</h3>

						<form
							action={async (formData) => {
								await fetch(`${baseUrl}/api/drinks`, {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({
										name: formData.get('name'),
										alcohol: Number(formData.get('alcohol')),
										imageUrl: formData.get('imageUrl'),
										unitOfMeasurement: formData.get('unitOfMeasurement'),
									}),
								});

								const refreshed = await fetch('/api/drinks');
								if (!refreshed.ok)
									throw new Error('Hiba a statisztika frissítésénél');
								const updatedDrinks: IDrink[] = await refreshed.json();
								setDrinks(updatedDrinks);
							}}
							style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
						>
							<div>
								<label
									style={{
										display: 'block',
										marginBottom: '8px',
										fontSize: '14px',
										fontWeight: '600',
										color: '#475569',
									}}
								>
									Ital neve
								</label>
								<input
									className="form-input"
									type="text"
									name="name"
									required
									placeholder="Kőbányai"
								/>
							</div>

							<div style={{ display: 'flex', gap: '15px' }}>
								<div style={{ flex: 1 }}>
									<label
										style={{
											display: 'block',
											marginBottom: '8px',
											fontSize: '14px',
											fontWeight: '600',
											color: '#475569',
										}}
									>
										Alkoholtartalom (%)
									</label>
									<input
										className="form-input"
										type="number"
										name="alcohol"
										step="0.1"
										required
										placeholder="0.0"
									/>
								</div>
								<div style={{ flex: 1 }}>
									<label
										style={{
											display: 'block',
											marginBottom: '8px',
											fontSize: '14px',
											fontWeight: '600',
											color: '#475569',
										}}
									>
										Mértékegység
									</label>
									<select
										className="form-input"
										name="unitOfMeasurement"
										required
										defaultValue=""
									>
										<option value="l">Liter</option>
										<option value="cl">Centiliter</option>
									</select>
								</div>
							</div>

							<div>
								<label
									style={{
										display: 'block',
										marginBottom: '8px',
										fontSize: '14px',
										fontWeight: '600',
										color: '#475569',
									}}
								>
									Kép URL{' '}
									<span style={{ fontWeight: '400', color: '#94a3b8' }}>
										(opcionális)
									</span>
								</label>
								<input
									className="form-input"
									type="url"
									name="imageUrl"
									placeholder="https://..."
								/>
							</div>

							<button
								type="submit"
								className="submit-btn"
							>
								Hozzáadás
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
