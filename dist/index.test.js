"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = require("catframe/dist/Categories/Graph/Graph");
const GraphCat_1 = require("catframe/dist/Categories/Graph/GraphCat");
const CatSet_1 = require("catframe/dist/Categories/Set/CatSet");
const StructureMap_1 = require("catframe/dist/Helpers/StructureMap");
const _1 = require(".");
function flatObjCompare(a, b) {
    if (a && b && Object.keys(a).every((item) => ['number', 'string'].indexOf(typeof a[item]) === -1 || a[item] === b[item])) {
        return true;
    }
    return false;
}
describe('CatFrameProMatch unit tests', () => {
    test('simple ID match', done => {
        const a = new _1.CatFrameProMatch();
        const G = new Graph_1.Graph();
        const edge1 = { e: 1 };
        const edge2 = { e: 2 };
        const node1 = { v: 1 };
        const node2 = { v: 2 };
        const node3 = { v: 3 };
        const node4 = { v: 4 };
        G.edgeSet = new CatSet_1.CatSet(flatObjCompare, edge1, edge2);
        G.nodeSet = new CatSet_1.CatSet(flatObjCompare, node4, node1, node2, node3);
        const srcMap = new StructureMap_1.StructureMap([[edge1, node1], [edge2, node2]], "productionMap");
        const trgMap = new StructureMap_1.StructureMap([[edge1, node2], [edge2, node3]], "productionMap");
        G.src = srcMap;
        G.trg = trgMap;
        const cat = new GraphCat_1.GraphCat(flatObjCompare, flatObjCompare);
        const id = cat.id(G);
        a.matchGraph(G, G, (a) => {
            if (a !== false) {
                const va = a.nodeArrow.apply(a.src.nodeSet[0]) === id.nodeArrow.apply(a.src.nodeSet[0]);
                const vb = a.nodeArrow.apply(a.src.nodeSet[1]) === id.nodeArrow.apply(a.src.nodeSet[1]);
                const vc = a.nodeArrow.apply(a.src.nodeSet[2]) === id.nodeArrow.apply(a.src.nodeSet[2]);
                const ea1 = a.edgeArrow.apply(a.src.edgeSet[0]);
                const ea2 = id.edgeArrow.apply(a.src.edgeSet[0]);
                const ea = flatObjCompare(ea1, ea2);
                const eb1 = a.edgeArrow.apply(a.src.edgeSet[0]);
                const eb2 = id.edgeArrow.apply(a.src.edgeSet[0]);
                const eb = flatObjCompare(eb1, eb2);
                // TODO GraphMorph equal do not work :(
                const q = a.src.equals(id.src) && a.trg.equals(id.trg) && va && vb && vc && ea && eb;
                expect(q).toBeTruthy();
                done();
            }
        });
    });
});
