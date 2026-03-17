import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

function App() {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const stateRef = useRef(null);
  const [status, setStatus] = useState('Connecting...');
  const [myTeam, setMyTeam] = useState(null);
  const [score, setScore] = useState({ red: 0, blue: 0 });

  useEffect(() => {
    const socket = io(window.location.origin, {
      path: '/ws/game/',
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('joined', (data) => {
      setMyTeam(data.team);
      setStatus(`Connected! Team: ${data.team.toUpperCase()}`);
    });

    socket.on('room_full', () => {
      setStatus('Room full! Max 2 players.');
    });

    socket.on('state', (state) => {
      stateRef.current = state;
      setScore(state.score);
    });

    socket.on('disconnect', () => {
      setStatus('Disconnected.');
    });

    return () => socket.disconnect();
  }, []);

  // Keyboard input
  useEffect(() => {
    const keys = {};

    const sendInput = () => {
      if (!socketRef.current) return;
      socketRef.current.emit('input', {
        up: keys['ArrowUp'] || keys['w'] || keys['W'] || false,
        down: keys['ArrowDown'] || keys['s'] || keys['S'] || false,
        left: keys['ArrowLeft'] || keys['a'] || keys['A'] || false,
        right: keys['ArrowRight'] || keys['d'] || keys['D'] || false,
        kick: keys['x'] || keys['X'] || false,
      });
    };

    const onKeyDown = (e) => { keys[e.key] = true; sendInput(); };
    const onKeyUp = (e) => { keys[e.key] = false; sendInput(); };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const state = stateRef.current;

      if (!state) {
        ctx.fillStyle = '#888';
        ctx.font = '18px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText('Waiting for server...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        animId = requestAnimationFrame(draw);
        return;
      }

      const { players, ball, field } = state;

      // Draw field
      drawField(ctx, field);

      // Draw players
      for (const id in players) {
        const p = players[id];
        const isMe = p.team === myTeam;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.team === 'red' ? '#e94560' : '#4a90d9';
        ctx.fill();
        ctx.strokeStyle = isMe ? '#fff' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = isMe ? 3 : 1;
        ctx.stroke();

        if (isMe) {
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px Segoe UI';
          ctx.textAlign = 'center';
          ctx.fillText('SEN', p.x, p.y - p.radius - 6);
        }
      }

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
      ctx.stroke();

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [myTeam]);

  return (
    <div style={{
      background: '#1a1a2e',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
      color: '#fff',
    }}>
      <h1 style={{ marginBottom: 10, fontSize: 20, color: '#e94560' }}>
        Haxball - ft_transcendence
      </h1>
      <div style={{ marginBottom: 10, fontSize: 14, color: '#aaa' }}>
        WASD/Arrow keys: Move | X: Kick
      </div>
      <div style={{ fontSize: 28, marginBottom: 10, letterSpacing: 8 }}>
        <span style={{ color: '#e94560' }}>{score.red}</span>
        &nbsp;-&nbsp;
        <span style={{ color: '#4a90d9' }}>{score.blue}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          border: '2px solid #e94560',
          borderRadius: 8,
          background: '#16213e',
        }}
      />
      <div style={{
        marginTop: 10,
        fontSize: 13,
        color: myTeam === 'red' ? '#e94560' : myTeam === 'blue' ? '#4a90d9' : '#888',
      }}>
        {status}
      </div>
    </div>
  );
}

function drawField(ctx, field) {
  const { width, height, goalHeight } = field;
  const goalTop = (height - goalHeight) / 2;
  const goalBottom = (height + goalHeight) / 2;

  // Center line
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();

  // Center circle
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 50, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Goals - left (red)
  ctx.strokeStyle = '#e94560';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, goalTop);
  ctx.lineTo(0, goalBottom);
  ctx.stroke();

  // Goals - right (blue)
  ctx.strokeStyle = '#4a90d9';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width, goalTop);
  ctx.lineTo(width, goalBottom);
  ctx.stroke();

  // Goal area backgrounds
  ctx.fillStyle = 'rgba(233, 69, 96, 0.08)';
  ctx.fillRect(0, goalTop, 30, goalHeight);
  ctx.fillStyle = 'rgba(74, 144, 217, 0.08)';
  ctx.fillRect(width - 30, goalTop, 30, goalHeight);
}

export default App;
