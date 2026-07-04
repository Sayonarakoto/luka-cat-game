import { initInput, isMovingLeft, isMovingRight } from './input.js';
import { 
    initPlayer, 
    resetPlayer, 
    setPlayerIdle, 
    jump, 
    updatePlayerPhysics, 
    getPlayerBounds, 
    getPlayerX, 
    isPlayerInvincible, 
    triggerHurt, 
    triggerDeath 
} from './player.js';
import { BACKGROUNDS, initParallax, updateParallax, applyBackground, resetOffsets } from './parallax.js';
import { initSpawner, clearSpawner, updateSpawner, removeEntityAt, getActivePlatforms } from './spawner.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('highScore');
    const livesEl = document.getElementById('lives');
    const screenOverlay = document.getElementById('screen-overlay');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    
    const startGameBtn = document.getElementById('startGameBtn');
    const restartGameBtn = document.getElementById('restartGameBtn');
    const finalScoreEl = document.getElementById('final-score');
    const gameContainer = document.getElementById('gameContainer');
    const flashEffect = document.getElementById('flash-effect');

    // Controls Buttons
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const btnJump = document.getElementById('btnJump');

    // Stage Selector elements
    const prevBgBtn = document.getElementById('prevBgBtn');
    const nextBgBtn = document.getElementById('nextBgBtn');
    const bgName = document.getElementById('bgName');
    const miniSky = document.getElementById('miniSky');
    const miniGround = document.getElementById('miniGround');

    // Parallax Layers DOM elements
    const parallaxLayers = {
        sky: document.querySelector('.layer-sky'),
        clouds: document.querySelector('.layer-clouds'),
        rocks: document.querySelector('.layer-rocks'),
        hills2: document.querySelector('.layer-hills2'),
        hills1: document.querySelector('.layer-hills1'),
        trees: document.querySelector('.layer-trees'),
        platform: document.querySelector('.platform')
    };

    // Constants
    const baseSpeed = 6;

    // Game Variables
    let score = 0;
    let highScore = 0;
    let lives = 3;
    let isPlaying = false;
    let isGameOver = false;
    let animationFrameId = null;

    // Background Selection Index (Green Hills BG 3 is default)
    let selectedBgIndex = 2;

    // Load High Score
    try {
        highScore = parseInt(localStorage.getItem('luka_high_score') || '0', 10);
        highScoreEl.textContent = `Hi-Score: ${highScore}`;
    } catch (e) {
        console.error('Failed to access localStorage:', e);
    }

    /**
     * Cycles backgrounds, updates label, and redraws static layers.
     * @param {number} dir 
     */
    function updateBgSelection(dir) {
        selectedBgIndex = (selectedBgIndex + dir + BACKGROUNDS.length) % BACKGROUNDS.length;
        bgName.textContent = BACKGROUNDS[selectedBgIndex].name;
        resetOffsets();
        applyBackground(selectedBgIndex);
        updateMiniPreview();
    }

    /**
     * Updates the miniature preview frame of the selected stage.
     */
    function updateMiniPreview() {
        const bg = BACKGROUNDS[selectedBgIndex];
        if (!bg) return;

        const skyLayer = bg.layers.find(l => l.key === 'sky');
        const groundLayer = bg.layers.find(l => l.key === 'platform');

        if (skyLayer && skyLayer.file && miniSky) {
            miniSky.style.backgroundImage = `url("assets/Parallax-2D-Backgrounds/${bg.folder}/Layers/${skyLayer.file}")`;
        } else if (miniSky) {
            miniSky.style.backgroundImage = 'none';
        }

        if (groundLayer && groundLayer.file && miniGround) {
            miniGround.style.backgroundImage = `url("assets/Parallax-2D-Backgrounds/${bg.folder}/Layers/${groundLayer.file}")`;
        } else if (miniGround) {
            miniGround.style.backgroundImage = 'none';
        }
    }

    // Initialize Submodules
    initInput(
        btnLeft, btnRight, btnJump, 
        () => {
            if (isPlaying && !isGameOver) {
                jump();
            }
        },
        {
            isActive: () => !isPlaying && !isGameOver, // active only on menu screen
            onLeft: () => updateBgSelection(-1),
            onRight: () => updateBgSelection(1),
            onEnter: () => startGame()
        }
    );

    initPlayer(document.getElementById('luka'));
    initParallax(parallaxLayers);
    initSpawner(document.getElementById('entities'));

    // Apply default background preview
    applyBackground(selectedBgIndex);
    updateMiniPreview();
    bgName.textContent = BACKGROUNDS[selectedBgIndex].name;

    /**
     * Rebuilds HUD hearts depending on lives.
     */
    function updateLivesUI() {
        livesEl.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            if (i < lives) {
                livesEl.innerHTML += '<i class="nes-icon heart"></i>';
            } else {
                livesEl.innerHTML += '<i class="nes-icon heart is-empty"></i>';
            }
        }
    }

    /**
     * Handles collision detection responses (Score increments or Hurt triggers).
     * @param {object} entity 
     * @param {number} index 
     */
    function handleCollision(entity, index) {
        if (entity.type === 'fish') {
            removeEntityAt(index);
            score += 10;
            scoreEl.textContent = `Score: ${score}`;
            
            // Score feedback pop animation
            scoreEl.classList.remove('animate__animated', 'animate__rubberBand');
            void scoreEl.offsetWidth; // trigger reflow
            scoreEl.classList.add('animate__animated', 'animate__rubberBand');
        } else if (entity.type === 'hazard') {
            if (isPlayerInvincible()) return;

            removeEntityAt(index);
            lives--;
            updateLivesUI();

            // Screen flash red on hazard collision
            if (flashEffect) {
                flashEffect.classList.remove('flash');
                void flashEffect.offsetWidth; // trigger reflow
                flashEffect.classList.add('flash');
                setTimeout(() => {
                    flashEffect.classList.remove('flash');
                }, 150);
            }

            // Hurt state animations
            triggerHurt();

            // Screen Shake Effect
            gameContainer.classList.remove('hit-shake');
            void gameContainer.offsetWidth; // trigger reflow
            gameContainer.classList.add('hit-shake');
            setTimeout(() => {
                gameContainer.classList.remove('hit-shake');
            }, 300);

            if (lives <= 0) {
                triggerGameOver();
            }
        }
    }

    /**
     * Stops loops, updates high scores, and shows menu overlay after 2.5 seconds.
     */
    function triggerGameOver() {
        isGameOver = true;
        isPlaying = false;
        cancelAnimationFrame(animationFrameId);
        triggerDeath();

        // Update High Score
        if (score > highScore) {
            highScore = score;
            try {
                localStorage.setItem('luka_high_score', highScore);
            } catch (e) {
                console.error('Failed to save high score:', e);
            }
            highScoreEl.textContent = `Hi-Score: ${highScore}`;
        }

        // Delay menu pop for death animation to roll out smoothly (increased to 2500ms)
        setTimeout(() => {
            finalScoreEl.textContent = `Score: ${score}`;
            gameOverScreen.style.display = 'flex';
            screenOverlay.style.display = 'flex';
            startScreen.style.display = 'none';

            // Return to slow idle background drift
            animateIdleBackground();
        }, 2500);
    }

    /**
     * Launches a playing round.
     */
    function startGame() {
        isPlaying = true;
        isGameOver = false;
        score = 0;
        lives = 3;

        resetPlayer();
        clearSpawner();
        resetOffsets();
        applyBackground(selectedBgIndex);

        scoreEl.textContent = 'Score: 0';
        updateLivesUI();
        screenOverlay.style.display = 'none';

        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    /**
     * Slow scrolling animation while in menus.
     */
    function animateIdleBackground() {
        if (isPlaying) return;
        updateParallax(1.5, selectedBgIndex); // slow menu drift
        animationFrameId = requestAnimationFrame(animateIdleBackground);
    }

    /**
     * Active Game Loop updates
     */
    function gameLoop() {
        if (!isPlaying) return;

        // Scrolling speed scale factor based on cat position offset
        const speed = baseSpeed + (getPlayerX() - 150) * 0.015;
        const activePlatforms = getActivePlatforms();

        updatePlayerPhysics(isMovingLeft(), isMovingRight(), activePlatforms);
        updateParallax(speed, selectedBgIndex);
        updateSpawner(speed, getPlayerBounds(), handleCollision, selectedBgIndex);

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Set Listeners
    prevBgBtn.addEventListener('click', () => updateBgSelection(-1));
    nextBgBtn.addEventListener('click', () => updateBgSelection(1));
    startGameBtn.addEventListener('click', startGame);
    restartGameBtn.addEventListener('click', startGame);

    // Initial setup
    updateLivesUI();
    setPlayerIdle();
    animateIdleBackground();
});
