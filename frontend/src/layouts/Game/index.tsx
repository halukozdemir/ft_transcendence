import { useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import Chat from "../../components/game/Chat";
import GameScreen from "../../components/game/Screen";
import DebugPanel from "../../components/game/DebugPanel";
import { useGameSocket } from "../../hooks/useGameSocket";
import { useGameInput } from "../../hooks/useGameInput";
import { useAuth } from "../../context/authContext";

const GameLayout = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { accessToken, user } = useAuth();

	const roomId = useMemo(() => {
		const params = new URLSearchParams(location.search);
		return params.get("roomId") || undefined;
	}, [location.search]);

	const roomPassword = useMemo(() => {
		if (!roomId) return undefined;
		return sessionStorage.getItem(`game-room-password:${roomId}`) || undefined;
	}, [roomId]);

	const { state, myPlayerId, connected, joinError, socket, debug, switchTeam, toggleReady } = useGameSocket(accessToken, {
		roomId,
		roomPassword,
		username: user?.username,
	});
	useGameInput(socket);

	const handleLeaveRoom = useCallback(() => {
		socket.current?.disconnect();
		navigate("/");
	}, [socket, navigate]);

	return (
		<div className="w-full h-screen flex justify-center bg-bg">
			<div className="flex flex-col lg:relative w-full max-w-[1080px] h-full p-2 gap-2 lg:gap-0">
				{joinError && (
					<div className="shrink-0 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
						{joinError}
					</div>
				)}
				<div className="flex-1 min-h-0 lg:absolute lg:inset-2 rounded-xl overflow-hidden">
					<GameScreen
						state={state}
						myPlayerId={myPlayerId}
						connected={connected}
						onLeaveRoom={handleLeaveRoom}
						onSwitchTeam={switchTeam}
						onToggleReady={toggleReady}
					/>
				</div>
				<div className="shrink-0 w-full lg:absolute lg:left-2 lg:bottom-2 lg:w-80">
					<Chat
						roomName={roomId ? `game_${roomId}` : "game_lobby"}
						username={user?.username || "Player"}
					/>
				</div>
			</div>
			<DebugPanel socketRef={socket} debug={debug} connected={connected} />
		</div>
	);
}

export default GameLayout;
