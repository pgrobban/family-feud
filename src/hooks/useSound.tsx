"use client";

import {
	createContext,
	useContext,
	useEffect,
	useRef,
	type ReactNode,
} from "react";

type SoundContextType = {
	playDing: () => void;
	playBuzz: () => void;
	playYouSaid: () => void;
};

const SoundContext = createContext<SoundContextType | null>(null);

export const SoundProvider = ({ children }: { children: ReactNode }) => {
	const dingRef = useRef<HTMLAudioElement | null>(null);
	const buzzRef = useRef<HTMLAudioElement | null>(null);
	const youSaidRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		dingRef.current = new Audio("/sounds/ding.mp3");
		buzzRef.current = new Audio("/sounds/buzz.mp3");
		youSaidRef.current = new Audio("/sounds/you said.mp3");

		// Optional: preload
		dingRef.current.preload = "auto";
		buzzRef.current.preload = "auto";
		youSaidRef.current.preload = "auto";
	}, []);

	const playDing = () => dingRef.current?.play();
	const playBuzz = () => buzzRef.current?.play();
	const playYouSaid = () => youSaidRef.current?.play();

	return (
		<SoundContext.Provider value={{ playDing, playBuzz, playYouSaid }}>
			{children}
		</SoundContext.Provider>
	);
};

export const useSound = () => {
	const ctx = useContext(SoundContext);
	if (!ctx) throw new Error("useSound must be used within a SoundProvider");
	return ctx;
};
