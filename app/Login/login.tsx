import {
	SignedIn,
	SignInButton,
	SignUpButton,
	UserButton,
} from '@clerk/nextjs';

export default async function Login() {
	return (
		<main
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: '100vh',
				padding: '1rem',
				background:
					'linear-gradient(135deg, var(--background) 0%, rgba(136, 45, 45, 0.05) 100%)',
			}}
		>
			<style>{`
                .sign-up-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
                }
                .sign-in-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
                }
            `}</style>
			<div
				style={{
					background: 'rgba(255, 255, 255, 0.1)',
					backdropFilter: 'blur(20px)',
					border: '1px solid rgba(255, 255, 255, 0.2)',
					borderRadius: '16px',
					padding: '3rem 2rem',
					maxWidth: '400px',
					width: '100%',
					textAlign: 'center',
					boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
				}}
			>
				<h1
					style={{
						fontSize: '2.5rem',
						fontWeight: '700',
						marginBottom: '0.5rem',
						color: 'var(--foreground)',
						letterSpacing: '-0.5px',
					}}
				>
					Welcome
				</h1>
				<p
					style={{
						fontSize: '0.95rem',
						color: 'rgba(128, 128, 128, 0.7)',
						marginBottom: '2.5rem',
						fontWeight: '500',
					}}
				>
					Log in to use the app
				</p>
				<SignUpButton>
					<button
						style={{
							background: 'var(--foreground)',
							color: 'var(--background)',
							border: 'none',
							borderRadius: '10px',
							padding: '0.875rem 2rem',
							fontSize: '1rem',
							fontWeight: '600',
							cursor: 'pointer',
							width: '100%',
							transition: 'all 0.3s ease',
						}}
						className="sign-up-button"
					>
						Sign Up
					</button>
				</SignUpButton>
				<p style={{ margin: '1.5rem 0' }}>or</p>
				<SignInButton>
					<button
						style={{
							background: 'transparent',
							color: 'var(--foreground)',
							border: '1.5px solid var(--foreground)',
							borderRadius: '10px',
							padding: '0.875rem 2rem',
							fontSize: '1rem',
							fontWeight: '600',
							cursor: 'pointer',
							width: '100%',
							transition: 'all 0.3s ease',
						}}
						className="sign-in-button"
					>
						Sign In
					</button>
				</SignInButton>
			</div>
		</main>
	);
}
