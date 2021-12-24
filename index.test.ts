import { GraphMorphism } from 'catframe/dist/Categories/Graph/GraphMorphism';
import { Graph } from "catframe/dist/Categories/Graph/Graph";
import { GraphCat } from "catframe/dist/Categories/Graph/GraphCat";
import { CatSet } from "catframe/dist/Categories/Set/CatSet";
import { StructureMap } from "catframe/dist/Helpers/StructureMap";
import { CatFrameProMatch } from ".";
import { TGraph, TGraphCat, TGraphMorphism } from 'catframe';

function flatObjCompare(a:any,b:any){
    if(a && b && Object.keys(a).every((item) => ['number','string'].indexOf(typeof a[item]) === -1 || a[item] === b[item])) {
        return true;
    }
    return false;
}

describe('CatFrameProMatch unit tests', () => {
    test('simple ID match', done  => {
        const a = new CatFrameProMatch();
        const G = new Graph<object,object>();
        const edge1 = {e:1}
        const edge2 = {e:2}
        const node1 = {v:1}
        const node2 = {v:2}
        const node3 = {v:3}
        const node4 = {v:4}
        G.edgeSet = new CatSet(flatObjCompare,edge1,edge2)
        G.nodeSet = new CatSet(flatObjCompare,node4,node1,node2,node3)
        const srcMap = new StructureMap<object>([[edge1,node1],[edge2,node2]],"productionMap")
        const trgMap = new StructureMap<object>([[edge1,node2],[edge2,node3]],"productionMap")
        G.src = srcMap
        G.trg = trgMap

        const cat = new GraphCat(flatObjCompare,flatObjCompare)
        const id = cat.id(G) as GraphMorphism<object,object>
        a.matchGraph(G,G, (a: GraphMorphism<object,object>| false) => {
            if(a !== false){
                const va = a.nodeArrow.apply(a.src.nodeSet[0]) === id.nodeArrow.apply(a.src.nodeSet[0])
                const vb = a.nodeArrow.apply(a.src.nodeSet[1]) === id.nodeArrow.apply(a.src.nodeSet[1])
                const vc = a.nodeArrow.apply(a.src.nodeSet[2]) === id.nodeArrow.apply(a.src.nodeSet[2])


                const ea1 = a.edgeArrow.apply(a.src.edgeSet[0])
                const ea2 = id.edgeArrow.apply(a.src.edgeSet[0])
                const ea = flatObjCompare(ea1,ea2)
                const eb1 = a.edgeArrow.apply(a.src.edgeSet[0])
                const eb2 = id.edgeArrow.apply(a.src.edgeSet[0])
                const eb = flatObjCompare(eb1,eb2)
                // TODO GraphMorph equal do not work :(
                const q = a.src.equals(id.src) && a.trg.equals(id.trg) && va && vb && vc && ea && eb
                expect(q).toBeTruthy();
                done()
            }
        })
    });
    test('simple ID match (tgraph)', done  => {
        jest.setTimeout(30000);
        const a = new CatFrameProMatch();

        const TG = new Graph<object,object>();
        const tedge1 = {e:21}
        const tedge2 = {e:22}
        const tnode1 = {v:1}
        const tnode2 = {v:2}
        const tnode3 = {v:3}
        TG.edgeSet = new CatSet(flatObjCompare,tedge1,tedge2)
        TG.nodeSet = new CatSet(flatObjCompare,tnode1,tnode2,tnode3)
        const srcMapTG = new StructureMap<object>([[tedge2,tnode1],[tedge1,tnode2]],"productionMap")
        const trgMapTG = new StructureMap<object>([[tedge2,tnode2],[tedge1,tnode3]],"productionMap")
        TG.src = srcMapTG
        TG.trg = trgMapTG

        const G = new Graph<object,object>();
        const edge1 = {e:1}
        const edge2 = {e:2}
        const node1 = {v:1}
        const node2 = {v:2}
        const node3 = {v:3}
        const node4 = {v:4}
        G.edgeSet = new CatSet(flatObjCompare,edge1,edge2)
        G.nodeSet = new CatSet(flatObjCompare,node4,node1,node2,node3)
        const srcMap = new StructureMap<object>([[edge1,node1],[edge2,node2]],"productionMap")
        const trgMap = new StructureMap<object>([[edge1,node2],[edge2,node3]],"productionMap")
        G.src = srcMap
        G.trg = trgMap

        const edgeMorph = new StructureMap([[edge1,tedge2],[edge2,tedge1]])
        const nodeMorph = new StructureMap([[node1,tnode1],[node2,tnode2],[node3,tnode3],[node4,tnode1]])

        const tmorph = new GraphMorphism(G,TG,nodeMorph,edgeMorph)
        const TyG = new TGraph(tmorph)

        const gcat = new GraphCat(flatObjCompare,flatObjCompare)
        const cat = new TGraphCat(gcat)
        const id = cat.id(TyG) as TGraphMorphism<object,object>
        let counter = 0
        a.matchTGraph(TyG,TyG, (a: TGraphMorphism<object,object>| false) => {
                done()
        })
        done()
    });
});

