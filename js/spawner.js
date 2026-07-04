/**
 * Spawner module for spawning, updating, cleaning up, and querying overlap bounds of fish, hazards, and platforms.
 */

let container = null;
let entities = [];
let platforms = [];

let spawnTimer = 0;
let nextSpawnInterval = 100;

let platformTimer = 0;
let nextPlatformInterval = 80;

/**
 * Initializes container and resets variables.
 * @param {HTMLElement} entitiesContainer 
 */
export function initSpawner(entitiesContainer) {
    container = entitiesContainer;
    clearSpawner();
}

/**
 * Empties DOM entities container and resets variables.
 */
export function clearSpawner() {
    entities = [];
    platforms = [];
    spawnTimer = 0;
    platformTimer = 0;
    nextSpawnInterval = 50;
    nextPlatformInterval = 80;
    if (container) {
        container.innerHTML = '';
    }
}

/**
 * Exposes active platforms array.
 * @returns {Array}
 */
export function getActivePlatforms() {
    return platforms;
}

/**
 * Handles spawns checks, entity translation movements, offscreen cleanups, and queries bounding overlaps.
 * @param {number} speed 
 * @param {object} playerBounds 
 * @param {Function} collisionCallback 
 */
export function updateSpawner(speed, playerBounds, collisionCallback, stageIndex = 2) {
    // 1. Entities Spawn Check (fish & hazards)
    spawnTimer++;
    if (spawnTimer >= nextSpawnInterval) {
        spawnTimer = 0;
        nextSpawnInterval = 75 + Math.random() * 60; // randomized intervals
        spawnEntity();
    }

    // 2. Platforms Spawn Check
    platformTimer++;
    if (platformTimer >= nextPlatformInterval) {
        platformTimer = 0;
        nextPlatformInterval = 130 + Math.random() * 90; // randomized intervals
        spawnPlatform(stageIndex);
    }

    // 3. Translate & Query Entity Collisions
    for (let i = entities.length - 1; i >= 0; i--) {
        const entity = entities[i];
        entity.x -= (speed + entity.speedOffset);
        entity.element.style.left = `${entity.x}px`;

        // Offscreen cleanup
        if (entity.x < -50) {
            entity.element.remove();
            entities.splice(i, 1);
            continue;
        }

        // Bounding Overlap Box Check (handling different sizes for fish and hazards)
        const size = entity.type === 'fish' ? 64 : 35;
        const padding = entity.type === 'fish' ? 12 : 5;
        
        const entX1 = entity.x + padding;
        const entX2 = entity.x + size - padding;
        const entY1 = entity.y + padding;
        const entY2 = entity.y + size - padding;

        if (
            playerBounds.x1 < entX2 &&
            playerBounds.x2 > entX1 &&
            playerBounds.y1 < entY2 &&
            playerBounds.y2 > entY1
        ) {
            collisionCallback(entity, i);
        }
    }

    // 4. Translate & Clean Up Platforms
    for (let i = platforms.length - 1; i >= 0; i--) {
        const plat = platforms[i];
        plat.x -= speed; // moves left at scroll speed
        plat.element.style.left = `${plat.x}px`;

        // Offscreen cleanup
        if (plat.x < -160) {
            plat.element.remove();
            platforms.splice(i, 1);
        }
    }
}

/**
 * Helper to spawn a new img (hazard) or animated div (fish) entity element.
 */
function spawnEntity() {
    if (!container) return;

    const isHazard = Math.random() < 0.45; // 45% hazard, 55% fish
    let entity;
    const x = 850; // starts offscreen
    let y = 64;    // ground level
    let type = '';

    if (isHazard) {
        type = 'hazard';
        entity = document.createElement('img');
        entity.src = 'assets/spr_puffi_50.png';
        entity.className = 'hazard animate__animated animate__pulse animate__infinite';
        if (Math.random() < 0.35) {
            y = 120; // floating hazard
        }
    } else {
        type = 'fish';
        entity = document.createElement('div');
        const fishType = Math.floor(Math.random() * 6) + 1; // variety 1 to 6
        entity.className = 'swim-fish';
        entity.style.backgroundImage = `url("assets/fishespixel/${fishType}/Walk.png")`;
        entity.style.backgroundSize = '256px 64px'; // 4 frames * 64px = 256px wide
        
        // Spawn height: sometimes on ground, sometimes in air
        y = 70 + Math.random() * 110;
    }

    entity.style.left = `${x}px`;
    entity.style.bottom = `${y}px`;
    container.appendChild(entity);

    entities.push({
        element: entity,
        x: x,
        y: y,
        type: type,
        speedOffset: (Math.random() - 0.5) * 2 // slight speed variation
    });
}

/**
 * Spawns a floating platform ledge.
 */
function spawnPlatform(stageIndex = 2) {
    if (!container) return;

    const element = document.createElement('div');
    element.className = 'platform-ledge';
    const x = 850;
    
    // Spawn heights: y = 135 (mid jump) or y = 200 (high jump)
    const y = Math.random() < 0.5 ? 135 : 200;

    element.style.left = `${x}px`;
    element.style.bottom = `${y}px`;
    
    // Match colors to stage theme
    let color = '#8b5a2b'; // default brown (Stage 1 Cake fallback)
    if (stageIndex === 0) color = '#ff7675'; // pink cake block
    else if (stageIndex === 1) color = '#4a5568'; // dark slate block
    else if (stageIndex === 2) color = '#27ae60'; // grass green block
    else if (stageIndex === 3) color = '#7f8c8d'; // rock grey block

    element.style.backgroundColor = color;

    container.appendChild(element);

    platforms.push({
        element: element,
        x: x,
        y: y,
        width: 150,
        height: 16
    });
}

/**
 * Removes entity visually and logically.
 * @param {number} index 
 */
export function removeEntityAt(index) {
    if (entities[index]) {
        entities[index].element.remove();
        entities.splice(index, 1);
    }
}
