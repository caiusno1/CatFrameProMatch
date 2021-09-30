import { Graph, GraphMorphism, TotalFunction, GraphCat } from 'catframe/dist';
import { StructureMap } from 'catframe/dist/Helpers/StructureMap';

import * as pl from 'tau-prolog';
import * as loaderM from 'tau-prolog/modules/lists'
/**
 * An (monic) arrow-finder for the catframe Framework based on prolog (currently only supports graphs)
 * @name CatFrameProMatch
 */
export class CatFrameProMatch<Tobject,Tedge>{
    /**
     * 
     * @param graphPattern The patter that should be matched/found in Graph *graph*
     * @param graph The Graph where we search for the given pattern *graphPattern*
     * @param callback A callback-function which will be called for all monic Arrows which were found (and at the end with false)
     * @returns All monic arrows that can connect *graphPattern* and *graph* and is structure preserving (via *callback*)
     */
    public matchGraph(graphPattern: Graph<Tobject,Tedge>,graph: Graph<Tobject,Tedge>, callback: (a:GraphMorphism<Tobject,Tedge>|false) => void): GraphMorphism<Tobject,Tedge>{
        var session = pl.create();
        const loader = loaderM.default as (x:any) => any
        loader(pl)
        const show = (x:any) => console.log(session.format_answer(x));
        const ProPattern = graphPattern.edgeSet.map((edge, idx) => "edge(E_"+idx+","+this.toIndex(graphPattern.src.get(edge),graphPattern.nodeSet)+","+this.toIndex(graphPattern.trg.get(edge), graphPattern.nodeSet)+")")
        const SelectNodes = graphPattern.nodeSet.map((node, idx) => "select(V_"+idx+`,[${graph.nodeSet.map((node,nidx) => "v_"+nidx).join(", ")}],_)`).join(", ")
        const ProPatternID = Array.from(graphPattern.nodeSet).map((node,idx) => Array.from(graphPattern.nodeSet).map((a,idx) => idx).filter((idx2) => idx2 !== idx).map((idx2) => "'\\\\='(V_"+idx+",V_"+idx2+")").join(", "))
        // console.log(ProPatternID)
        const ProGraph = graph.edgeSet.map((edge,idx) => "edge(e_"+idx+","+this.toIndex(graph.src.get(edge),graph.nodeSet).toLowerCase()+","+this.toIndex(graph.trg.get(edge), graph.nodeSet).toLowerCase()+")")
        const patterMatcher = this;

let ProProgram =
`:- use_module(library(lists)).\n              
${ProGraph.join(". \n")}. 
match(${graphPattern.nodeSet.map((ele) => patterMatcher.toIndex(ele,graphPattern.nodeSet)).join(",")},${graphPattern.edgeSet.map((ele,idx) => "E_"+idx).join(",")}) :- ${SelectNodes} , ${ProPattern.join(",")} , ${ProPatternID.join(",")}.`.trim()

        session.consult(ProProgram, {
            success: function() { 
                console.log("yes")
                console.log(`match(${graphPattern.nodeSet.map((ele) => patterMatcher.toIndex(ele,graphPattern.nodeSet)).join(",")},${graphPattern.edgeSet.map((ele,idx) => "E_"+idx).join(",")}).`)
                session.query(`match(${graphPattern.nodeSet.map((ele) => patterMatcher.toIndex(ele,graphPattern.nodeSet)).join(",")},${graphPattern.edgeSet.map((ele,idx) => "E_"+idx).join(",")}).`, {
                    success: function(goal: any) {
                        if(callback){
                            session.answers((x: any) => {
                                callback(patterMatcher.answerToGraphMorphism(x,graphPattern,graph))
                            } );
                        }
                        else {
                            session.answers(show);
                        }
                    },
                    error: function(err: any) { 
                        console.log(err) 
                    }
                })
            },
            error: function(err: Error) { 
                console.error("cannot match")
                console.error(err)
             }
        });
        return null;
    }
    private toIndex(obj: Tobject, objs: Tobject[]): string{
        return "V_"+objs.indexOf(obj);
    }
    private fromIndex(i: string, objs: Tobject[]): Tobject{
        return objs[Number.parseInt(i.replace("V_",""))];
    }
    private toIndexE(edge: Tedge, edges: Tedge[]): string{
        return "E_"+edges.indexOf(edge);
    }
    private fromIndexE(i: string, objs: Tedge[]): Tedge{
        return objs[Number.parseInt(i.replace("E_",""))];
    }
    /**
     * Converts the prolog answer to a GraphMorphism
     * @param x The answer created by prolog
     * @param pattern The src graph of the GraphMorphism aka graph pattern
     * @param graph The trg graph of the GraphMorphism aka graph
     * @returns The structure preserving monic morphism that is induced by the prolog answer or false if the prolog answer is false
     */
    private answerToGraphMorphism(x: any, pattern: Graph<Tobject,Tedge>, graph: Graph<Tobject,Tedge>): GraphMorphism<Tobject,Tedge>|false{
        if(x){
            const nodeLink: [Tobject,Tobject][] = []
            const egdeLink: [Tedge,Tedge][] = []
            for(const link in x.links){
                if(link.startsWith("V_")){
                    const nodeSrc = this.fromIndex(link, pattern.nodeSet)
                    const nodeTrg = this.fromIndex((x.links[link].id as string).toUpperCase(), graph.nodeSet)
                    nodeLink.push([nodeSrc,nodeTrg])
                }
                if(link.startsWith("E_")){
                    const edgeSrc = this.fromIndexE(link, pattern.edgeSet)
                    const edgeTrg = this.fromIndexE((x.links[link].id as string).toUpperCase(), graph.edgeSet)
                    egdeLink.push([edgeSrc,edgeTrg])
                }
            }
            const NodeMap = new TotalFunction(pattern.nodeSet,graph.nodeSet,new StructureMap(nodeLink,"productionMap"))
            const EdgeMap = new TotalFunction(pattern.edgeSet,graph.edgeSet,new StructureMap(egdeLink,"productionMap"))
            return new GraphMorphism(pattern,graph,NodeMap,EdgeMap)
        }
        return false;        
    }
}