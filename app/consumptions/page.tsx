import Consumptions from '@/models/Consumptions';
import Drink from '@/models/Drinks';
import {
	SignedIn,
	SignInButton,
	SignUpButton,
	UserButton,
} from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function UserConsumptions() {
	const drinks = await Drink.find({});
	const user = await currentUser();

	const consumption = await Consumptions.aggregate([
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

	console.log(consumption);

	return (
		<div className="page-wrapper">
			<style>{`

            .page-wrapper {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background-color: #0f172a;
                padding: 0px 20px 40px 20px;
                color: #ffffffff;
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
                display: grid;
                grid-template-columns: 1fr;
                gap: 40px;
            }

            @media (min-width: 900px) {
                .container {
                    grid-template-columns: 2fr 1fr;
                    align-items: start;
                }
                .sticky-sidebar {
                    position: sticky;
                    top: 20px;
                }
            }

            .drink-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                gap: 13px;
            }

            .card {
                background: #1e293b;
                border-radius: 16px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                border: 1px solid #334155;
                overflow: hidden;
            }

            .card:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
            }

            .card2 {
                background: #1e293b;
                border-radius: 16px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                border: 1px solid #334155;
                overflow: hidden;
            }

            .form-input {
                width: 100%;
                padding: 12px 16px;
                background-color: #0f172a;
                color: #ffffff;
                border: 2px solid #334155;
                border-radius: 8px;
                font-size: 15px;
                outline: none;
                transition: all 0.2s;
                box-sizing: border-box;
            }

            .form-input:focus {
                border-color: #818cf8;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
            }

            .submit-btn {
                background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                color: white;
                font-weight: 600;
                padding: 14px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: filter 0.2s;
                font-size: 16px;
            }

            .submit-btn:hover {
                filter: brightness(120%);
            }

            .badge {
                display: inline-block;
                padding: 4px 8px;
                background-color: #312e81;
                color: #c7d2fe;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 700;
            }

            .section-title {
                font-size: 24px;
                font-weight: 800;
                margin-bottom: 24px;
                color: #f1f5f9;
                letter-spacing: -0.5px;
            }
            `}</style>

			<div
				className="container"
				style={{ marginTop: '80px' }}
			>
				<div className="left-section">
					<h2 className="section-title">Eddigi fogyasztások</h2>

					<div className="drink-grid">
						{consumption.map((drink) => (
							<div
								// Updated: uses drinkId from aggregation
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
											// Updated: drinkName
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
										{/* Updated: alcoholContent */}
										<span className="badge">{drink.alcoholContent}%</span>
									</div>

									{/* --- EXISTING UNIT INFO --- */}
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '8px',
											color: '#ffffffff',
											fontSize: '14px',
										}}
									></div>

									{/* --- NEW AGGREGATED DATA SECTION --- */}
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
													'hu-HU'
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
								'use server';
								const drinkId = formData.get('drinkId')?.toString();
								const amountRaw = formData.get('amount')?.toString().trim();
								const timeValue = formData.get('time')?.toString();
								const user = formData.get('user')?.toString();
								console.log(user);
								if (!drinkId || !amountRaw || !user) {
									throw new Error('Ital és mennyiség megadása kötelező.');
								}
								const payload: {
									drinkId: string;
									amount: string;
									time?: Date;
									user: string;
								} = {
									drinkId,
									amount: amountRaw,
									user,
								};

								if (timeValue) {
									const parsedTime = new Date(timeValue);
									if (!Number.isNaN(parsedTime.getTime())) {
										payload.time = parsedTime;
									}
								}

								console.log(payload);

								const { default: Consumption } = await import(
									'@/models/Consumptions'
								);
								await Consumption.create(payload);
								redirect('/');
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
									className="form-input"
									defaultValue=""
								>
									<option
										value=""
										disabled
									>
										Válassz egy italt
									</option>
									{drinks.map((drink) => (
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
									<img
										id="consumption-selected-image"
										src={undefined}
										alt="Kiválasztott ital"
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'cover',
											display: 'none',
										}}
									/>
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
										Válassz italt
									</p>
									<p style={{ margin: '4px 0 0', color: '#94a3b8' }}>
										Mértékegység: <span id="consumption-selected-unit">-</span>
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
									<span id="consumption-amount-unit">-</span> )
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
								<input
									style={{
										display: 'none',
									}}
									className="form-input"
									type="text"
									name="user"
									required
									readOnly
									value={user?.id || ''}
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
									defaultValue=""
								/>
							</div>

							<script
								dangerouslySetInnerHTML={{
									__html: `
										(() => {
											const select = document.getElementById('consumption-drink-select');
											if (!select) return;
											const nameEl = document.getElementById('consumption-selected-name');
											const unitEl = document.getElementById('consumption-selected-unit');
											const amountUnitEl = document.getElementById('consumption-amount-unit');
											const imgEl = document.getElementById('consumption-selected-image');
											const placeholderEl = document.getElementById('consumption-selected-placeholder');
											const update = () => {
												const option = select.options[select.selectedIndex];
												if (!option || !option.value) {
													if (nameEl) nameEl.textContent = 'Válassz italt';
													if (unitEl) unitEl.textContent = '-';
													if (amountUnitEl) amountUnitEl.textContent = '-';
													if (imgEl) {
														imgEl.style.display = 'none';
														imgEl.removeAttribute('src');
													}
													if (placeholderEl) placeholderEl.style.display = 'flex';
													return;
												}
												const unit = option.getAttribute('data-unit') || '-';
												const image = option.getAttribute('data-image') || '';
												if (nameEl) nameEl.textContent = option.textContent?.trim() || '';
												if (unitEl) unitEl.textContent = unit;
												if (amountUnitEl) amountUnitEl.textContent = unit;
												if (image && imgEl) {
													imgEl.src = image;
													imgEl.style.display = 'block';
												} else if (imgEl) {
													imgEl.style.display = 'none';
													imgEl.removeAttribute('src');
												}
												if (placeholderEl) placeholderEl.style.display = image ? 'none' : 'flex';
											};
											select.addEventListener('change', update);
											update();
										})();
									`,
								}}
							/>

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
