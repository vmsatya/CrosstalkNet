'use strict'

function createConfig() {
    var config = {
        motionBlur: true,
        hideEdgesOnViewport: true,
        hideLabelsOnViewport: true,
        textureOnViewport: true,
        pixelRatio: 1,
        minZoom: 0.01,
        maxZoom: 5,
        style: [{
            selector: 'node',
            style: {
                'content': 'data(id)',
                'font-size': '10px',
                'color': '#7B1FA2'
            }
        }, {
            selector: ':parent',
            style: {
                'background-opacity': 0.6
            }
        }, {
            selector: 'node:selected',
            style: {
                'background-color': 'red'
            }
        }, {
            selector: 'node.located',
            style: {
                'background-color': '#76FF03'
            }
        }, {
            selector: '.faded-edge',
            style: {
                'opacity': '0'
            }
        }, {
            selector: '.highlighted-edge',
            style: {
                'line-color': 'magenta'
            }
        }]
    };

    return config;
}

function setConfigElements(config, elements) {
    if (elements instanceof Array) {
        config.elements = elements;
    } else {
        var temp = [];
        temp = temp.concat(elements.epiNodes);
        temp = temp.concat(elements.stromaNodes);
        temp = temp.concat(elements.edges);

        if (elements.epiParent != null) {
            temp.push(elements.epiParent);
            temp.push(elements.stromaParent);
        }

        config.elements = temp;
    }
}

function setConfigLayout(config, layout) {
    config.layout = layout;
}

function addStyleToConfig(config, style) {
    config.style.push(style);
}

function addStylesToConfig(config, styles) {
    for (var i = 0; i < styles.length; i++) {
        config.style.push(styles[i]);
    }
}

module.exports = {
    createConfig: createConfig,
    setConfigElements: setConfigElements,
    setConfigLayout: setConfigLayout,
    addStyleToConfig: addStyleToConfig,
    addStylesToConfig: addStylesToConfig
};