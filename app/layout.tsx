'use client';

import { type Metadata } from 'next';
import {
	ClerkProvider,
	SignInButton,
	SignUpButton,
	SignedIn,
	SignedOut,
	UserButton,
} from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import 'tailwindcss';

import { useState } from 'react';
const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

type NavLinkProps = {
	href: string;
	children: React.ReactNode;
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const NavLink = ({ href, children }: NavLinkProps) => (
		<a
			href={href}
			className="relative px-4 py-2 text-sm font-medium text-slate-400 transition-all duration-300 hover:text-white hover:bg-white/5 rounded-full group"
		>
			{children}
			<span className="absolute bottom-1.5 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300 group-hover:w-1/2 opacity-0 group-hover:opacity-100" />
		</a>
	);

	const [isOpen, setIsOpen] = useState(false);

	const handleLinkClick = () => {
		setIsOpen(false);
	};

	return (
		<ClerkProvider>
			<html lang="en">
				<head>
					<title>Drink Wrapped</title>
				</head>
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased`}
					style={{ backgroundColor: '#0f172a', color: 'white' }}
				>
					<SignedIn>
						<nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-xl transition-all supports-[backdrop-filter]:bg-slate-950/60">
							<div className="flex h-16 items-center justify-between px-6 md:px-8">
								<div className="flex items-center gap-8">
									<a
										href="/"
										className="group flex items-center gap-3"
									>
										<div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/50 shadow-inner transition-transform group-hover:scale-105 group-hover:bg-slate-800/80">
											<span className="text-xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
												🍸
											</span>
										</div>
										<span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-lg font-bold tracking-tight text-transparent drop-shadow-sm">
											Drink Wrapped
										</span>
									</a>

									<div className="hidden md:flex items-center gap-2">
										<NavLink href="/consumptions">Fogyasztások</NavLink>
										<NavLink href="/drinks">Italok kezelése</NavLink>
										<NavLink href="/dashboard">Statisztika</NavLink>
									</div>
								</div>

								<div className="flex items-center gap-4">
									<div className="hidden h-6 w-px bg-white/10 sm:block" />

									<div className="relative">
										<UserButton />
									</div>

									<button
										onClick={() => setIsOpen(!isOpen)}
										className="group flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 md:hidden"
										aria-label="Toggle Menu"
									>
										<div className="relative h-4 w-4">
											<span
												className={`absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-current transition-all duration-300 ${
													isOpen ? 'rotate-45' : '-translate-y-1.5'
												}`}
											/>
											<span
												className={`absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-current transition-all duration-300 ${
													isOpen ? 'opacity-0' : 'opacity-100'
												}`}
											/>
											<span
												className={`absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-current transition-all duration-300 ${
													isOpen ? '-rotate-45' : 'translate-y-1.5'
												}`}
											/>
										</div>
									</button>
								</div>
							</div>

							<div
								className={`border-b border-white/10 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 ease-in-out md:hidden ${
									isOpen
										? 'max-h-64 opacity-100'
										: 'max-h-0 opacity-0 overflow-hidden'
								}`}
							>
								<div className="flex flex-col gap-2 p-6">
									<div
										onClick={handleLinkClick}
										className="flex flex-col gap-2"
									>
										<NavLink href="/consumptions">Fogyasztások</NavLink>
										<NavLink href="/drinks">Italok kezelése</NavLink>
										<NavLink href="/dashboard">Statisztika</NavLink>
									</div>
								</div>
							</div>
						</nav>
					</SignedIn>

					<main>{children}</main>
				</body>
			</html>
		</ClerkProvider>
	);
}
