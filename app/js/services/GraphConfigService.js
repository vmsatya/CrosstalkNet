var myModule = angular.module("myApp");
myModule.factory('GraphConfigService', function($http, RESTService) {

    var service = {};

    service.tabNames = { main: "main", neighbour: "neighbour" };
    service.tabs = { main: {}, neighbour: {} };

    service.dataModel = {
        elemCopy: null,
        styleCopy: null,
        cy: null,
        selfLoops: [],
        selfLoopsCount: 0
    };

    service.tabs.main.data = angular.copy(service.dataModel);
    service.tabs.neighbour.data = angular.copy(service.dataModel);

    service.firstSelectedGene = null;

    service.applyConfig = function(config, containerID, scope) {
        scope.elemCopy = angular.copy(config.elements);
        scope.styleCopy = angular.copy(config.style);
        config.container = document.getElementById(containerID);
        scope.cy = cytoscape(config);

        scope.nodes = scope.cy.nodes().length;
        scope.edges = scope.cy.edges().length;
        scope.config = config;

        scope.cy.fit(scope.cy.$("*"), 10);

        scope.cy.on('select', 'node', function(evt) {
            var node = evt.cyTarget;
            var id = node.id();
            console.log('tapped ' + id);

            var edges = scope.cy.edges("[source='" + id + "'], [target='" + id + "']");

            scope.cy.batch(function() {
                for (var i = edges.length - 1; i >= 0; i--) {
                    edges[i].addClass('highlighted-edge');
                    edges[i].removeClass('faded-edge');
                }
            });

            edges = scope.cy.edges().not("[source='" + id + "'], [target='" + id + "']");

            scope.cy.batch(function() {
                for (var i = edges.length - 1; i >= 0; i--) {
                    edges[i].addClass('faded-edge');
                    edges[i].removeClass('highlighted-edge');
                }
            });

            service.selectedItem = null;
            console.log(node);
        });

        scope.cy.on("tap", "edge", function(evt) {
            var edge = evt.cyTarget;
            scope.selectedEdge = { source: null, target: null, weight: null };

            scope.$apply(function() {
                scope.selectedEdge.source = edge.source().id();
                scope.selectedEdge.target = edge.target().id();
                scope.selectedEdge.weight = edge.data('weight');
            });
        });


        scope.cy.on("unselect", 'node', function(evt) {
            var node = evt.cyTarget;
            var id = node.id();

            service.resetEdges(scope.cy);
            console.log('tapped ' + id);
            console.log(node);
        });
    };

    service.getInteractingNodes = function(node, cy) {
        var attribute = '';

        if (node.id().endsWith('-E')) {
            attribute = 'source';
        } else {
            attribute = 'target';
        }

        var edges = cy.edges("[" + attribute + "='" + node.id() + "']");
        var nodes = [];


        for (var i = 0; i < edges.length; i++) {
            if (attribute == 'source') {
                nodes.push(edges[i].target());
            } else {
                nodes.push(edges[i].source());
            }

        }

        return nodes;
    };

    service.findGeneInGraph = function(scope, gene) {
        service.clearLocatedGene(scope);

        var node = scope.cy.$("#" + gene.toUpperCase());
        var x = node.renderedPosition('x');
        var y = node.renderedPosition('y');
        var allClasses = node[0]._private.classes;
        var colorClass = '';

        for (var cls in allClasses) {
            if (cls.indexOf('node-color') >= 0) {
                node.toggleClass(cls);
                colorClass = cls;
                break;
            }
        }

        var jAni = node.animation({
            style: {
                'height': '40px',
                'width': '40px'
            },
            duration: 1000
        });

        jAni
            .play()
            .promise('completed').then(function() {
                jAni
                    .reverse()
                    .rewind() 
                    .play()
                ;
            });

        node.addClass('located');


        scope.cy.zoom({
            level: 1.5, // the zoom level
            renderedPosition: { x: x, y: y }
        });
        scope.cy.center(node);

        scope.currentlyZoomed = { node: node, styleClass: colorClass };
    };

    service.clearLocatedGene = function(scope) {
        if (scope.currentlyZoomed != null) {
            scope.currentlyZoomed.node.removeClass('located');
            scope.currentlyZoomed.node.toggleClass(scope.currentlyZoomed.styleClass);
        }

        scope.currentlyZoomed = null;
    };

    service.closeEdgeInspector = function(scope) {
        scope.selectedEdge = {};
    };

    service.resetEdges = function(cy) {
        var edges = cy.edges();

        cy.batch(function() {
            for (var i = edges.length - 1; i >= 0; i--) {
                edges[i].removeClass('highlighted-edge');
                edges[i].removeClass('faded-edge');
            }
        });
    };

    service.resetZoom = function(cy) {
        service.resetNodes(cy);
        if (cy != null) {
            cy.fit(cy.$("*"), 10);
        }
    };

    service.resetNodes = function(cy, originalElements) {
        //cy.json({ elements: originalElements });
    };


    service.getAllVisibleGenes = function(scope) {
        var result = [];
        var nodes = scope.cy.$('node').not(':parent');

        for (var i = 0; i < nodes.length; i++) {
            result.push(nodes[i].id());
        }

        return result;
    };

    service.createLargeWeaveGraph = function() {
        var elements = [];

        for (var i = 0; i < totalNumNodes; i++) {
            elements.push({
                data: {
                    id: 'nodeA' + i,
                    parent: 'epi'
                },
                position: {
                    x: i < (totalNumNodes / 2) ? 100 + (i * 10) : 100 + ((
                        totalNumNodes - i) * 10),
                    y: 100 + (i * 15)
                },
                style: {
                    'shape': 'triangle'
                }

            });
            elements.push({
                data: {
                    id: 'nodeB' + i,
                    parent: 'stroma'
                },
                position: {
                    x: i < (totalNumNodes / 2) ? 15000 - (i * 10) : 1500 - ((
                        totalNumNodes - i) * 10),
                    y: 100 + (i * 15)
                }
            });
            elements.push({
                data: {
                    id: 'edgeAB' + i,
                    source: 'nodeA' + i,
                    target: 'nodeB' + i
                }
            });
        }

        elements.push({
            data: {
                id: 'epi'
            },
            shape: 'TRIANGLE',
            selected: true,
            selectable: true
        })
        elements.push({
            data: {
                id: 'stroma'
            },
            shape: 'TRIANGLE'
        })
    };

    service.create10By10EpiStroma = function() {
        var elements = [];
        totalNumNodes = 10;

        for (var i = 0; i < totalNumNodes; i++) {
            elements.push({
                data: {
                    id: 'nodeA' + i,
                    parent: 'epi'
                },
                position: {
                    x: 100,
                    y: 100 + (i * 15)
                },
                style: {
                    'width': '10px',
                    'height': '10px'
                }

            });
            elements.push({
                data: {
                    id: 'nodeB' + i,
                    parent: 'stroma'
                },
                position: {
                    x: 400,
                    y: 100 + (i * 15)
                }
            });
            elements.push({
                data: {
                    id: 'edgeAB' + i,
                    source: 'nodeA' + i,
                    target: 'nodeB' + i
                }
            });
        }

        elements.push({
            data: {
                id: 'epi'
            },
            shape: 'TRIANGLE',
            selected: true,
            selectable: true
        })
        elements.push({
            data: {
                id: 'stroma'
            },
            shape: 'TRIANGLE'
        })
    };

    return service;
});
