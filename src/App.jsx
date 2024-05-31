/* eslint-disable */

import  { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
    const canvasRef = useRef(null);
    const [bird, setBird] = useState({ x: 50, y: 150, width: 20, height: 20, gravity: 0.3, lift: -5, velocity: 0 }); // Decreased gravity and lift
    const [pipes, setPipes] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const pipeWidth = 40; // Increased width of the pipes
    const pipeGap = 120; // Adjusted gap between pipes

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const handleKeyDown = (event) => {
            if (event.code === 'Space') {
                setBird(prevBird => ({ ...prevBird, velocity: prevBird.velocity + prevBird.lift }));
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!gameOver) {
                update();
            }
        }, 20);

        return () => clearInterval(interval);
    });

    const update = () => {
        setBird(prevBird => {
            let newY = prevBird.y + prevBird.velocity;
            let newVelocity = prevBird.velocity + prevBird.gravity;

            if (newY + prevBird.height > window.innerHeight) {
                newY = window.innerHeight - prevBird.height;
                newVelocity = 0;
                setGameOver(true);
            }

            if (newY < 0) {
                newY = 0;
                newVelocity = 0;
                setGameOver(true);
            }

            return { ...prevBird, y: newY, velocity: newVelocity };
        });

        setPipes(prevPipes => {
            let newPipes = prevPipes.map(pipe => ({ ...pipe, x: pipe.x - 2 }));

            if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < window.innerWidth - 200) {
                const pipeHeight = Math.floor(Math.random() * (window.innerHeight - pipeGap));
                newPipes.push({ x: window.innerWidth, y: 0, width: pipeWidth, height: pipeHeight });
                newPipes.push({ x: window.innerWidth, y: pipeHeight + pipeGap, width: pipeWidth, height: window.innerHeight - pipeHeight - pipeGap });
            }

            newPipes = newPipes.filter(pipe => pipe.x + pipeWidth > 0);

            return newPipes;
        });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FF0';
            ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

            ctx.fillStyle = '#0F0';
            pipes.forEach(pipe => {
                ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
            });

            if (checkCollision()) {
                setGameOver(true);
            }

            if (!gameOver) {
                requestAnimationFrame(render);
            }
        };

        render();
    });

    const checkCollision = () => {
        for (let i = 0; i < pipes.length; i++) {
            const pipe = pipes[i];
            if (bird.x < pipe.x + pipe.width &&
                bird.x + bird.width > pipe.x &&
                bird.y < pipe.y + pipe.height &&
                bird.y + bird.height > pipe.y) {
                return true;
            }
        }
        return false;
    };

    const handleRetry = () => {
        setBird({ x: 50, y: 150, width: 20, height: 20, gravity: 0.3, lift: -5, velocity: 0 }); // Reset values with decreased sensitivity
        setPipes([]);
        setGameOver(false);
    };

    return (
        <div className="App">
            <canvas ref={canvasRef}></canvas>
            {gameOver && <div className="retry" onClick={handleRetry}>Retry</div>}
        </div>
    );
}

export default App;
