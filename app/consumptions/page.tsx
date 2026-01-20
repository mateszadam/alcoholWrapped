'use client';
import './Consumptions.css';
import { useEffect, useState, ChangeEvent } from 'react';

export default function UserConsumptions() {
	interface IConsumptions {
		totalAmountConsumed: number;
		lastTimeDrank: Date;
		timesConsumed: number;
		drinkId: string;
		drinkName: string;
		unit: string;
		alcoholContent: number;
		imageUrl: string;
	}
	interface IDrink {
		_id: string;
		name: string;
		alcohol: number;
		imageUrl: string;
		unitOfMeasurement: string;
	}
	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL ??
		(process.env.VERCEL_URL
			? `https://${process.env.VERCEL_URL}`
			: 'http://localhost:3000');

	const [data, setData] = useState<IConsumptions[] | null>(null);
	const [drinks, setDrinks] = useState<IDrink[] | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const res = await fetch('/api/consumption');
				if (!res.ok) throw new Error('Hiba a lekérdezésben');

				const json: IConsumptions[] = await res.json();
				setData(json);

				const res2 = await fetch('/api/drinks');

				if (!res2.ok) throw new Error('Hiba a lekérdezésben');

				const json2: IDrink[] = await res2.json();
				setDrinks(json2);
			} catch (err) {
				console.error('Hiba:', err);
			}
		};
		fetchStats();
	}, []);

	const [selectedDrinkId, setSelectedDrinkId] = useState('');

	const selectedDrink = drinks?.find((d) => d._id === selectedDrinkId);

	const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>): void => {
		setSelectedDrinkId(e.target.value);
	};

	const now = new Date();
	now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
	const currentDateTime = now.toISOString().slice(0, 16);
	return (
		<div className="page-wrapper">
			<div
				className="container"
				style={{ marginTop: '80px' }}
			>
				<div className="left-section">
					<h2 className="section-title">Eddigi fogyasztások</h2>

					<div className="drink-grid">
						{data?.map((drink) => (
							<div
								key={drink.drinkId.toString()}
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
											alt={drink.drinkName}
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
											title={drink.drinkName}
										>
											{drink.drinkName}
										</h4>
										<span className="badge">{drink.alcoholContent}%</span>
									</div>

									<div
										style={{
											borderTop: '1px solid #ffffffff',
											paddingTop: '15px',
										}}
									>
										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												marginBottom: '5px',
											}}
										>
											<span style={{ fontSize: '14px', color: '#ffffffff' }}>
												Összesen:
											</span>
											<span style={{ fontWeight: 'bold', color: '#fdfdfdff' }}>
												{Number(drink.totalAmountConsumed).toFixed(2)}{' '}
												{drink.unit}
											</span>
										</div>

										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
											}}
										>
											<span style={{ fontSize: '14px', color: '#ffffffff' }}>
												Utoljára:
											</span>
											<span style={{ fontSize: '14px', color: '#ffffffff' }}>
												{new Date(drink.lastTimeDrank).toLocaleDateString(
													'hu-HU',
												)}
											</span>
										</div>
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
							Új fogyasztás hozzáadása
						</h3>

						<form
							action={async (formData) => {
								await fetch(`${baseUrl}/api/consumption`, {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({
										drinkId: formData.get('drinkId'),
										amount: Number(formData.get('amount')),
										time: formData.get('time'),
									}),
								});

								const refreshed = await fetch('/api/consumption');
								if (!refreshed.ok)
									throw new Error('Hiba a statisztika frissítésénél');
								const updatedConsumptions: IConsumptions[] =
									await refreshed.json();
								setData(updatedConsumptions);
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
									Válassz italt
								</label>
								<select
									id="consumption-drink-select"
									name="drinkId"
									required
									value={selectedDrinkId}
									onChange={handleSelectChange}
									className="form-input"
								>
									<option
										value=""
										disabled
									>
										Válassz egy italt
									</option>
									{drinks?.map((drink) => (
										<option
											key={drink._id.toString()}
											value={drink._id.toString()}
											data-unit={drink.unitOfMeasurement}
											data-image={drink.imageUrl ?? ''}
										>
											{drink.name}
										</option>
									))}
								</select>
							</div>

							<div
								style={{
									display: 'flex',
									gap: '16px',
									alignItems: 'center',
									padding: '16px',
									borderRadius: '12px',
									border: '1px solid #1e293b',
									backgroundColor: '#0f172a',
								}}
							>
								<div
									style={{
										width: '64px',
										height: '64px',
										borderRadius: '12px',
										overflow: 'hidden',
										backgroundColor: '#1e293b',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									{selectedDrink && selectedDrink.imageUrl ? (
										<img
											id="consumption-selected-image"
											src={selectedDrink.imageUrl}
											alt={selectedDrink.name}
											style={{ display: 'block' }}
										/>
									) : (
										<div
											id="consumption-selected-placeholder"
											style={{ display: 'flex' }}
										>
											<span
												id="consumption-selected-placeholder"
												style={{
													fontSize: '32px',
													display: 'flex',
													maxWidth: '160px',
													whiteSpace: 'nowrap',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
												}}
											>
												🍸
											</span>
										</div>
									)}
								</div>
								<div>
									<p
										id="consumption-selected-name"
										style={{
											margin: 0,
											fontWeight: 700,
											maxWidth: '200px',
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
										}}
									>
										{selectedDrink ? selectedDrink.name : 'Válassz italt'}
									</p>
									<p style={{ margin: '4px 0 0', color: '#94a3b8' }}>
										Mértékegység:{' '}
										<span id="consumption-selected-unit">
											{selectedDrink ? selectedDrink.unitOfMeasurement : '-'}
										</span>
									</p>
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
									Elfogyasztott mennyiség ({' '}
									<span id="consumption-amount-unit">
										{selectedDrink ? selectedDrink.unitOfMeasurement : '-'}
									</span>{' '}
									)
								</label>
								<input
									className="form-input"
									type="number"
									name="amount"
									step="0.01"
									min="0"
									required
									placeholder="0.5"
								/>
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
									Időpont
								</label>
								<input
									className="form-input"
									type="datetime-local"
									name="time"
									defaultValue={currentDateTime}
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
