import { useEffect, useState } from "react";

interface LogoProps {
	className?: string;
	isDesktop?: boolean;
}

export function Logo({ className = "", isDesktop = false }: LogoProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [loadedQuadrants, setLoadedQuadrants] = useState<number[]>([]);

	useEffect(() => {
		if (isHovered) {
			// Staggered animation: fade in quadrants one by one
			const timeouts: NodeJS.Timeout[] = [];

			timeouts.push(setTimeout(() => setLoadedQuadrants([0]), 50)); // Top-left
			timeouts.push(setTimeout(() => setLoadedQuadrants([0, 1]), 100)); // Top-right
			timeouts.push(setTimeout(() => setLoadedQuadrants([0, 1, 2]), 150)); // Bottom-left
			timeouts.push(setTimeout(() => setLoadedQuadrants([0, 1, 2, 3]), 200)); // Bottom-right

			return () => timeouts.forEach(clearTimeout);
		} else {
			setLoadedQuadrants([]);
		}
	}, [isHovered]);

	const quadrants = [
		{ clipPath: "inset(0% 50% 50% 0%)", delay: "0ms" }, // Top-left
		{ clipPath: "inset(0% 0% 50% 50%)", delay: "50ms" }, // Top-right
		{ clipPath: "inset(50% 50% 0% 0%)", delay: "100ms" }, // Bottom-left
		{ clipPath: "inset(50% 0% 0% 50%)", delay: "150ms" }, // Bottom-right
	];

	return (
		<a
			href="/"
			className={`group flex items-center transition-colors duration-200 hover:bg-[#f5efe6] border-r border-[#d4c8b8] electrobun-webkit-app-region-no-drag relative z-0 ${className}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Inner wrapper with padding */}
			<div className={`flex items-center gap-3 w-full ${isDesktop ? 'pt-7 pl-3 pr-4 pb-0.5' : 'pl-2 pr-4 py-3 pt-3'}`}>
				{/* Icon container */}
				<div className={`relative flex-shrink-0 ${isDesktop ? 'w-6 h-6' : 'w-10 h-10'}`}>
				{/* Base: Filled icon (complete) */}
				<img
					src="/struktur-icon.png"
					alt=""
					className="absolute inset-0 w-full h-full object-cover"
					draggable="false"
				/>

					{/* Empty quadrants that appear on hover, "removing" the filled shapes */}
					{quadrants.map((quad) => (
						<div
							key={quad.clipPath}
							className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none transition-opacity duration-[120ms] ease-out ${
								loadedQuadrants.includes(quadrants.indexOf(quad))
									? "opacity-100"
									: "opacity-0"
							}`}
							style={{
								clipPath: quad.clipPath,
								transitionDelay: isHovered ? quad.delay : "0ms",
							}}
						>
							<img
								src="/struktur-icon-empty.webp"
								alt=""
								className="absolute inset-0 w-full h-full object-cover"
								draggable="false"
								aria-hidden="true"
							/>
						</div>
					))}
				</div>

				{/* Text */}
				{isDesktop ? (
					<h1 className="text-lg font-semibold text-[#2d1b0e] tracking-tight">
						struktur
					</h1>
				) : (
					<div className="flex flex-col">
						<div className="text-xs text-[#a0926f] italic leading-none">
							/ʃtʁʊkˈtuːɐ̯/
						</div>
						<h1 className="text-xl font-semibold text-[#2d1b0e] tracking-tight">
							struktur
						</h1>
					</div>
				)}
			</div>
		</a>
	);
}
