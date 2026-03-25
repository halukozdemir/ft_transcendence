import Chat from "../../components/Game/Chat";
import GameScreen from "../../components/Game/Screen";
import DebugPanel from "../../components/Game/DebugPanel";
import { useGameSocket } from "../../hooks/useGameSocket";
import { useGameInput } from "../../hooks/useGameInput";
import { useAuth } from "../../infrastructure/auth/authContext";

const GameLayout = () => {
	const { accessToken } = useAuth();
	const { state, myPlayerId, connected, socket, debug } = useGameSocket(accessToken);
	useGameInput(socket);

	return (
		<div className="w-full h-screen flex justify-center bg-bg">
			<div className="flex flex-col lg:relative w-full max-w-[1080px] h-full p-2 gap-2 lg:gap-0">
				<div className="flex-1 min-h-0 lg:absolute lg:inset-2 rounded-xl overflow-hidden">
					<GameScreen state={state} myPlayerId={myPlayerId} />
				</div>
				<div className="shrink-0 w-full lg:absolute lg:left-2 lg:bottom-2 lg:w-80">
					<Chat/>
				</div>
			</div>
			<DebugPanel socketRef={socket} debug={debug} connected={connected} />
		</div>
	);
}

export default GameLayout;
