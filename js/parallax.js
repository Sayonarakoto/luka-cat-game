/**
 * Parallax module to manage background selection and scrolling offsets.
 */

export const BACKGROUNDS = [
    {
        name: "Forest Cake (Stage 1)",
        folder: "platformer_background_1",
        layers: [
            { key: "sky", file: "layer06_sky.png", factor: 0.02 },
            { key: "clouds", file: "layer04_clouds.png", factor: 0.05, autoScroll: 0.15 },
            { key: "rocks", file: "layer05_rocks.png", factor: 0.12 },
            { key: "hills2", file: null, factor: 0 }, // not used
            { key: "hills1", file: "layer02_cake.png", factor: 0.45 },
            { key: "trees", file: "layer03_trees.png", factor: 0.75 },
            { key: "platform", file: "layer01_ground.png", factor: 1.0 }
        ]
    },
    {
        name: "Castle Space (Stage 2)",
        folder: "platformer_background_2",
        layers: [
            { key: "sky", file: "layer09_Sky.png", factor: 0.02 },
            { key: "clouds", file: "layer01_Clouds_1.png", factor: 0.05, autoScroll: 0.1 },
            { key: "rocks", file: "layer08_Stars_1.png", factor: 0.12 },
            { key: "hills2", file: "layer07_Stars_2.png", factor: 0.25 },
            { key: "hills1", file: "layer05_Castle.png", factor: 0.45 },
            { key: "trees", file: "layer02_Clouds_2.png", factor: 0.7 },
            { key: "platform", file: "layer04_Path.png", factor: 1.0 }
        ]
    },
    {
        name: "Green Hills (Stage 3)",
        folder: "platformer_background_3",
        layers: [
            { key: "sky", file: "layer07_Sky.png", factor: 0.02 },
            { key: "clouds", file: "layer05_Clouds.png", factor: 0.05, autoScroll: 0.15 },
            { key: "rocks", file: "layer06_Rocks.png", factor: 0.12 },
            { key: "hills2", file: "layer04_Hills_2.png", factor: 0.25 },
            { key: "hills1", file: "layer03_Hills_1.png", factor: 0.45 },
            { key: "trees", file: "layer02_Trees.png", factor: 0.7 },
            { key: "platform", file: "layer01_Ground.png", factor: 1.0 }
        ]
    },
    {
        name: "Castle Rocks (Stage 4)",
        folder: "platformer_background_4",
        layers: [
            { key: "sky", file: "layer07_Sky.png", factor: 0.02 },
            { key: "clouds", file: "layer04_Clouds.png", factor: 0.05, autoScroll: 0.15 },
            { key: "rocks", file: "layer06_Rocks.png", factor: 0.12 },
            { key: "hills2", file: "layer05_Hills.png", factor: 0.25 },
            { key: "hills1", file: "layer03_Hills_Castle.png", factor: 0.45 },
            { key: "trees", file: "layer02_Trees_rocks.png", factor: 0.7 },
            { key: "platform", file: "layer01_Ground.png", factor: 1.0 }
        ]
    }
];

let layers = {};
let offsets = { sky: 0, clouds: 0, rocks: 0, hills2: 0, hills1: 0, trees: 0, platform: 0 };

/**
 * Initializes layers DOM variables and offsets.
 * @param {object} parallaxLayers 
 */
export function initParallax(parallaxLayers) {
    layers = parallaxLayers;
    resetOffsets();
}

/**
 * Resets scrolling offsets.
 */
export function resetOffsets() {
    offsets = { sky: 0, clouds: 0, rocks: 0, hills2: 0, hills1: 0, trees: 0, platform: 0 };
    for (const key in layers) {
        if (layers[key]) {
            layers[key].style.backgroundPositionX = '0px';
        }
    }
}

/**
 * Applies background image URLs based on selected stage config.
 * @param {number} bgIndex 
 */
export function applyBackground(bgIndex) {
    const bg = BACKGROUNDS[bgIndex];
    if (!bg) return;

    bg.layers.forEach(layer => {
        const el = layers[layer.key];
        if (!el) return;

        if (layer.file) {
            el.style.display = 'block';
            el.style.backgroundImage = `url("assets/Parallax-2D-Backgrounds/${bg.folder}/Layers/${layer.file}")`;
        } else {
            el.style.display = 'none';
            el.style.backgroundImage = 'none';
        }
    });
}

/**
 * Updates positions of active background layer elements depending on speed factor.
 * @param {number} speed 
 * @param {number} bgIndex 
 */
export function updateParallax(speed, bgIndex) {
    const bg = BACKGROUNDS[bgIndex];
    if (!bg) return;

    bg.layers.forEach(layer => {
        const key = layer.key;
        const element = layers[key];
        if (!element || !layer.file) return;

        const autoScrollSpeed = layer.autoScroll || 0;
        offsets[key] -= (autoScrollSpeed + speed * layer.factor);
        element.style.backgroundPositionX = `${offsets[key]}px`;
    });
}
