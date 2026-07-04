/**
 * Player module for handling Luka's physics, coordinates, jumping, falling, and animation states.
 */

const gravity = 0.6;
const jumpForce = -12;
const bottomBase = 55; // aligned to style.css bottom coordinate

let luka = null;
let lukaScreenX = 150;
let lukaY = 0;
let yVelocity = 0;
let isJumping = false;
let isInvincible = false;
let standingOnPlatform = null; // tracks platform player stands on

/**
 * Initializes the player module.
 * @param {HTMLElement} lukaElement 
 */
export function initPlayer(lukaElement) {
    luka = lukaElement;
    resetPlayer();
}

/**
 * Resets player coordinates and sets character class to walking.
 */
export function resetPlayer() {
    lukaScreenX = 150;
    lukaY = 0;
    yVelocity = 0;
    isJumping = false;
    isInvincible = false;
    standingOnPlatform = null;
    if (luka) {
        luka.className = 'luka walk';
        luka.style.transform = 'scaleX(-1)'; // face forward
        luka.style.left = `${lukaScreenX}px`;
        luka.style.bottom = `${bottomBase}px`;
        luka.style.opacity = '1';
    }
}

/**
 * Sets player state to idle animation.
 */
export function setPlayerIdle() {
    if (luka) {
        luka.className = 'luka idle';
    }
}

/**
 * Triggers a player jump. Can jump from floor or platforms.
 */
export function jump() {
    if (!isJumping || standingOnPlatform) {
        isJumping = true;
        standingOnPlatform = null;
        yVelocity = jumpForce;
    }
}

/**
 * Updates coordinates on every tick based on gravity, speed inputs, and floating platforms.
 * @param {boolean} moveLeft 
 * @param {boolean} moveRight 
 * @param {Array} activePlatforms 
 */
export function updatePlayerPhysics(moveLeft, moveRight, activePlatforms = []) {
    if (!luka) return;

    // Horizontal Movement
    let dx = 0;
    if (moveLeft) {
        dx = -4;
        luka.style.transform = 'scaleX(1)'; // face left
    } else if (moveRight) {
        dx = 4;
        luka.style.transform = 'scaleX(-1)'; // face right
    }

    lukaScreenX += dx;
    // Keep in screen bounds
    if (lukaScreenX < 40) lukaScreenX = 40;
    if (lukaScreenX > 450) lukaScreenX = 450;
    luka.style.left = `${lukaScreenX}px`;

    const playerFeetLeft = lukaScreenX + 25;
    const playerFeetRight = lukaScreenX + 55;

    // If standing on a platform, check if we walked off or if the platform moved away/despawned
    if (standingOnPlatform) {
        const platX1 = standingOnPlatform.x;
        const platX2 = standingOnPlatform.x + standingOnPlatform.width;

        const walkedOff = playerFeetRight < platX1 || playerFeetLeft > platX2;
        const stillActive = activePlatforms.includes(standingOnPlatform);

        if (walkedOff || !stillActive) {
            standingOnPlatform = null;
            isJumping = true; // initiate falling state
        }
    }

    // Vertical Movement (Gravity & Jump calculation)
    if (isJumping) {
        const prevLukaY = lukaY;
        yVelocity += gravity;
        lukaY -= yVelocity;

        // Ground landing check
        if (lukaY <= 0) {
            lukaY = 0;
            yVelocity = 0;
            isJumping = false;
            standingOnPlatform = null;
        } else if (yVelocity > 0) {
            // Player is falling downwards - check if landing on any floating platform
            for (const platform of activePlatforms) {
                const platTopY = platform.y;
                const relativePlatY = platTopY - bottomBase; // relative lukaY value

                // Horizontal boundary overlap check
                const horizOverlap = playerFeetRight > platform.x && playerFeetLeft < platform.x + platform.width;
                
                // Vertical crossing check (was above platform top, now at or below platform top)
                const crossedVertically = prevLukaY >= relativePlatY && lukaY <= relativePlatY;

                if (horizOverlap && crossedVertically) {
                    lukaY = relativePlatY;
                    yVelocity = 0;
                    isJumping = false;
                    standingOnPlatform = platform;
                    break;
                }
            }
        }
    } else {
        // Natural gravity trigger if not on ground and standingOnPlatform is suddenly lost
        if (lukaY > 0 && !standingOnPlatform) {
            isJumping = true;
            yVelocity = 0; // start falling
        }
    }

    luka.style.bottom = `${bottomBase + lukaY}px`;
}

/**
 * Gets Luka's current relative horizontal screen coordinate.
 * @returns {number}
 */
export function getPlayerX() {
    return lukaScreenX;
}

/**
 * Gets Luka's collision bounding box coordinates.
 * @returns {object}
 */
export function getPlayerBounds() {
    return {
        x1: lukaScreenX + 15,
        x2: lukaScreenX + 65,
        y1: bottomBase + lukaY,
        y2: bottomBase + lukaY + 50
    };
}

/**
 * Returns player's invincibility state.
 * @returns {boolean}
 */
export function isPlayerInvincible() {
    return isInvincible;
}

/**
 * Plays player hurt animation and handles invincibility flash interval.
 * @param {Function} onHurtEndCallback 
 */
export function triggerHurt(onHurtEndCallback) {
    if (!luka) return;

    luka.className = 'luka hurt';
    isInvincible = true;
    let flashCount = 0;

    const flashInterval = setInterval(() => {
        luka.style.opacity = luka.style.opacity === '0.3' ? '1' : '0.3';
        flashCount++;

        if (flashCount > 10) {
            clearInterval(flashInterval);
            luka.style.opacity = '1';
            isInvincible = false;
            luka.className = 'luka walk'; // revert to running state
            if (onHurtEndCallback) onHurtEndCallback();
        }
    }, 100);
}

/**
 * Transitions class to death sprite animation.
 */
export function triggerDeath() {
    if (luka) {
        luka.className = 'luka death';
    }
}
