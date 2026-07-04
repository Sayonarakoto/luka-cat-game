/**
 * Input module for handling player controls.
 * Manages both keyboard keys and mobile/mouse buttons hold inputs.
 */

const activeKeys = {};
let btnLeftPressed = false;
let btnRightPressed = false;

/**
 * Initializes listeners and triggers jump actions.
 * @param {HTMLElement} btnLeft 
 * @param {HTMLElement} btnRight 
 * @param {HTMLElement} btnJump 
 * @param {Function} jumpCallback 
 */
export function initInput(btnLeft, btnRight, btnJump, jumpCallback, menuCallbacks = {}) {
    // Keyboard listeners
    window.addEventListener('keydown', (e) => {
        if (['Space', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Enter'].includes(e.code)) {
            // Prevent default page scrolling
            e.preventDefault();
        }

        activeKeys[e.code] = true;

        if (e.code === 'Space' || e.code === 'ArrowUp') {
            jumpCallback();
        }

        // Menu navigation
        if (menuCallbacks.isActive && menuCallbacks.isActive()) {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                if (menuCallbacks.onLeft) menuCallbacks.onLeft();
            } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                if (menuCallbacks.onRight) menuCallbacks.onRight();
            } else if (e.code === 'Enter') {
                if (menuCallbacks.onEnter) menuCallbacks.onEnter();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        activeKeys[e.code] = false;
    });

    // Mobile/mouse press-hold controllers helper
    function bindHoldButton(buttonElement, pressAction, releaseAction) {
        if (!buttonElement) return;

        buttonElement.addEventListener('mousedown', pressAction);
        buttonElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            pressAction();
        });

        buttonElement.addEventListener('mouseup', releaseAction);
        buttonElement.addEventListener('mouseleave', releaseAction);
        buttonElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            releaseAction();
        });
    }

    bindHoldButton(btnLeft, () => { btnLeftPressed = true; }, () => { btnLeftPressed = false; });
    bindHoldButton(btnRight, () => { btnRightPressed = true; }, () => { btnRightPressed = false; });

    if (btnJump) {
        btnJump.addEventListener('click', jumpCallback);
    }
}

/**
 * Checks if Left movement is active.
 * @returns {boolean}
 */
export function isMovingLeft() {
    return activeKeys['ArrowLeft'] || activeKeys['KeyA'] || btnLeftPressed;
}

/**
 * Checks if Right movement is active.
 * @returns {boolean}
 */
export function isMovingRight() {
    return activeKeys['ArrowRight'] || activeKeys['KeyD'] || btnRightPressed;
}
