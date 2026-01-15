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
import './Consumptions.css';

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

	const now = new Date();
	now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
	const currentDateTime = now.toISOString().slice(0, 16);
	return (
		<div className="page-wrapper">
			<div
				className="container"
				style={{ marginTop: '80px' }}
			>
				{/* --- LEFT SECTION (Existing Consumptions) --- */}
				{/* Because of column-reverse, this appears at the BOTTOM on mobile */}
				<div className="left-section">
					<h2 className="section-title">Eddigi fogyasztások</h2>

					<div className="drink-grid">
						{consumption.map((drink) => (
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

				{/* --- RIGHT SECTION (Add New Form) --- */}
				{/* Because of column-reverse, this appears at the TOP on mobile */}
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
									defaultValue={currentDateTime}
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
