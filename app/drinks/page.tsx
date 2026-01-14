import Drink from '@/models/Drinks';
import { redirect } from 'next/navigation';

export default async function Drinks() {
	const drinks = await Drink.find({});
	async function handleSubmit(formData: FormData) {
		'use server';
		const newDrink = {
			name: formData.get('name') as string,
			alcohol: parseFloat(formData.get('alcohol') as string),
			imageUrl: formData.get('imageUrl') as string,
			unitOfMeasurement: formData.get('unitOfMeasurement') as string,
		};
		await Drink.create(newDrink);

		redirect('/');
		// Optionally, you can refresh the drinks list or handle the response
	}

	return (
		<div
			className="page-wrapper"
			style={{ marginTop: '80px' }}
		>
			<style>{`

            .page-wrapper {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background-color: #0f172a;
                padding: 0px 20px 40px 20px;
                color: #cbd5e1;
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

			<div className="container">
				<div className="left-section">
					<h2 className="section-title">Itallap</h2>

					<div className="drink-grid">
						{drinks.map((drink) => (
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
							action={handleSubmit}
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
										<option value="ml">Milliliter</option>
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
