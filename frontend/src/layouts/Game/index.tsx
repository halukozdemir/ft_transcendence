import { Outlet } from "react-router";
import Chat from "../../components/Game/Chat";
import GameScreen from "../../components/Game/Screen";

const GameLayout = () => {
	return (
		<div className="relative w-full h-screen p-2">
			<div className="absolute inset-2 rounded-xl overflow-hidden">
				<GameScreen/>
			</div>
			<div className="absolute right-2 bottom-2">
				<Chat/>
			</div>
		</div>
	);
}

export default GameLayout;