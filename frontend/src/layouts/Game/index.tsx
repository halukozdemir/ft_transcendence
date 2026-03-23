import Chat from "../../components/Game/Chat";
import GameScreen from "../../components/Game/Screen";
import type { GameState } from "../../game/types";

// TODO: replace with useGameSocket hook
const MOCK_STATE: GameState = {
	players: [
		{ id: "p1", name: "emur",      team: "red",  x: 300, y: 350 },
		{ id: "p2", name: "CyberGoalie", team: "blue", x: 900, y: 350 },
	],
	ball:  { x: 600, y: 350 },
	score: { red: 2, blue: 1 },
	match: { redTeamName: "Sharks", blueTeamName: "Vortex", round: 1, timeLeft: 292 },
};

const GameLayout = () => {
	return (
		<div className="w-full h-screen flex justify-center bg-bg">
			<div className="flex flex-col lg:relative w-full max-w-[1080px] h-full p-2 gap-2 lg:gap-0">
				<div className="flex-1 min-h-0 lg:absolute lg:inset-2 rounded-xl overflow-hidden">
					<GameScreen state={MOCK_STATE} myPlayerId="p1" />
				</div>
				<div className="shrink-0 w-full lg:absolute lg:left-2 lg:bottom-2 lg:w-80">
					<Chat/>
				</div>
			</div>
		</div>
	);
}

export default GameLayout;
