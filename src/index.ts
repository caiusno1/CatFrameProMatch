import { Graph, GraphMorphism, TotalFunction, GraphCat, TGraph, TGraphMorphism } from 'catframe/dist';
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

let head =  (graphPattern.nodeSet.length > 0? graphPattern.nodeSet.map((ele) => patterMatcher.toIndex(ele,graphPattern.nodeSet)).join(","):"_")
head = head + ", " + (graphPattern.edgeSet.length > 0? graphPattern.edgeSet.map((ele,idx) => "E_"+idx).join(","):"_")

let body = SelectNodes
body = body + ((SelectNodes.length > 0 && ProPattern.length > 0)? ","+ProPattern.join(","):ProPattern)
body = body + (((SelectNodes.length > 0 || ProPattern.length > 0) && ProPatternID.join(", ").length > 0) ? "," + ProPatternID.join(",") : ProPatternID.join(","));

let ProProgram =
`:- use_module(library(lists)).\n              
${ProGraph.join(". \n")}.
match(${head}) :- ${body} .`.trim()

        session.consult(ProProgram, {
            success: function() { 
                // console.log("yes")
                // console.log(`match(${graphPattern.nodeSet.map((ele) => patterMatcher.toIndex(ele,graphPattern.nodeSet)).join(",")},${graphPattern.edgeSet.map((ele,idx) => "E_"+idx).join(",")}).`)
                session.query(`match(${head}).`, {
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
    public matchTGraph(graphPattern: TGraph<Tobject,Tedge>,graph: TGraph<Tobject,Tedge>, callback: (a:TGraphMorphism<Tobject,Tedge>|false) => void): TGraphMorphism<Tobject,Tedge>{
        var session = pl.create();
        const loader = loaderM.default as (x:any) => any
        loader(pl)
        const show = (x:any) => console.log(session.format_answer(x));
        const ProPattern = graphPattern.getObject().edgeSet.map((edge, idx) => "edge(E_"+idx+","+this.toIndex(graphPattern.getObject().src.get(edge),graphPattern.getObject().nodeSet)+","+this.toIndex(graphPattern.getObject().trg.get(edge), graphPattern.getObject().nodeSet)+")")
        const ProTPattern = graphPattern.getTypeObject().edgeSet.map((edge, idx) => "tedge(TE_"+idx+","+this.toIndexT(graphPattern.getTypeObject().src.get(edge),graphPattern.getTypeObject().nodeSet)+","+this.toIndexT(graphPattern.getTypeObject().trg.get(edge), graphPattern.getTypeObject().nodeSet)+")")
        const SelectNodes = graphPattern.getObject().nodeSet.map((node, idx) => "select(V_"+idx+`,[${graph.getObject().nodeSet.map((node,nidx) => "v_"+nidx).join(", ")}],_)`).join(", ")
        const SelectTNodes = graphPattern.getTypeObject().nodeSet.map((node, idx) => "select(TV_"+idx+`,[${graph.getTypeObject().nodeSet.map((node,nidx) => "tv_"+nidx).join(", ")}],_)`).join(", ")
        const ProPatternID = Array.from(graphPattern.getObject().nodeSet).map((node,idx) => Array.from(graphPattern.getObject().nodeSet).map((a,idx) => idx).filter((idx2) => idx2 !== idx).map((idx2) => "'\\\\='(V_"+idx+",V_"+idx2+")").join(", "))
        const ProTPatternID = Array.from(graphPattern.getTypeObject().nodeSet).map((node,idx) => Array.from(graphPattern.getTypeObject().nodeSet).map((a,idx) => idx).filter((idx2) => idx2 !== idx).map((idx2) => "'\\\\='(TV_"+idx+",TV_"+idx2+")").join(", "))
        // console.log(ProPatternID)
        const ProGraph = graph.getObject().edgeSet.map((edge,idx) => "edge(e_"+idx+","+this.toIndex(graph.getObject().src.get(edge),graph.getObject().nodeSet).toLowerCase()+","+this.toIndex(graph.getObject().trg.get(edge), graph.getObject().nodeSet).toLowerCase()+")")
        const ProTGraph = graph.getTypeObject().edgeSet.map((edge,idx) => "tedge(te_"+idx+","+this.toIndexT(graph.getTypeObject().src.get(edge),graph.getTypeObject().nodeSet).toLowerCase()+","+this.toIndexT(graph.getTypeObject().trg.get(edge), graph.getTypeObject().nodeSet).toLowerCase()+")")
        const patterMatcher = this;

        const ProTypeEdgeLinking =  Array.from(graph.getObject().edgeSet).map((edge) => `typeE(${this.toIndexE(edge,graph.getObject().edgeSet).toLowerCase()}, ${this.toIndexTE((graph.getTypeMorphism() as unknown as GraphMorphism<any,any>).edgeArrow.apply(edge),graph.getTypeObject().edgeSet).toLowerCase()})`)
        const ProTypeNodeLinking =  Array.from(graph.getObject().nodeSet).map((node) => `type(${this.toIndex(node,graph.getObject().nodeSet).toLowerCase()}, ${this.toIndexT((graph.getTypeMorphism() as unknown as GraphMorphism<any,any>).nodeArrow.apply(node),graph.getTypeObject().nodeSet).toLowerCase()})`)
        
        const ProLinkEdge = graphPattern.getObject().edgeSet.map((edge,idx) => `edge(e_${idx},Var${idx}_1,Var${idx}_2), type(Var${idx}_1,TVar${idx}_1), type(Var${idx}_2,TVar${idx}_2), tedge(ETVar_${idx},TVar${idx}_1,TVar${idx}_2), typeE(e_${idx}, ETVar_${idx})`)

let ProProgram =
`:- use_module(library(lists)).\n              
${ProGraph.join(". \n")}. 
${ProTGraph.join(". \n")}. 
${ProTypeEdgeLinking.join(". \n")}. 
${ProTypeNodeLinking.join(". \n")}.
match(${graphPattern.getObject().nodeSet.map((ele) => patterMatcher.toIndex(ele,graphPattern.getObject().nodeSet)).join(",")},${graphPattern.getObject().edgeSet.map((ele,idx) => "E_"+idx).join(",")}, ${graphPattern.getTypeObject().nodeSet.map((ele) => patterMatcher.toIndexT(ele,graphPattern.getTypeObject().nodeSet)).join(",")},${graphPattern.getTypeObject().edgeSet.map((ele,idx) => "TE_"+idx).join(",")}) :- ${ProLinkEdge.join(",")} , ${SelectNodes} , ${SelectTNodes} , ${ProPattern.join(",")} , ${ProTPattern.join(",")} , ${ProPatternID.join(",")} , ${ProTPatternID.join(",")} .`.trim()

        console.log(ProProgram)
        session.consult(ProProgram, {
            success: function() { 
                // console.log("yes")
                session.query(`match(${graphPattern.getObject().nodeSet.map((ele) => patterMatcher.toIndex(ele,graphPattern.getObject().nodeSet)).join(",")},${graphPattern.getObject().edgeSet.map((ele,idx) => "E_"+idx).join(",")}, ${graphPattern.getTypeObject().nodeSet.map((ele) => patterMatcher.toIndexT(ele,graphPattern.getTypeObject().nodeSet)).join(",")},${graphPattern.getTypeObject().edgeSet.map((ele,idx) => "TE_"+idx).join(",")}).`, {
                    success: function(goal: any) {
                        if(callback){
                            session.answers((x: any) => {
                                callback(patterMatcher.answerToTGraphMorphism(x,graphPattern,graph))
                                //show(x)
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
    private toIndexT(obj: Tobject, objs: Tobject[]): string{
        return "TV_"+objs.indexOf(obj);
    }
    private fromIndexT(i: string, objs: Tobject[]): Tobject{
        return objs[Number.parseInt(i.replace("TV_",""))];
    }
    private toIndexTE(edge: Tedge, edges: Tedge[]): string{
        return "TE_"+edges.indexOf(edge);
    }
    private fromIndexTE(i: string, objs: Tedge[]): Tedge{
        return objs[Number.parseInt(i.replace("TE_",""))];
    }
    /**
     * Converts the prolog answer to a GraphMorphism
     * @param x The answer created by prolog
     * @param pattern The src graph of the GraphMorphism aka graph pattern
     * @param graph The trg graph of the GraphMorphism aka graph
     * @returns The structure preserving monic morphism that is induced by the prolog answer or false if the prolog answer is false
     */
    private answerToTGraphMorphism(x: any, pattern: TGraph<Tobject,Tedge>, graph: TGraph<Tobject,Tedge>): TGraphMorphism<Tobject,Tedge>|false{
        if(x){
            const nodeLink: [Tobject,Tobject][] = []
            const egdeLink: [Tedge,Tedge][] = []
            for(const link in x.links){
                if(link.startsWith("V_")){
                    const nodeSrc = this.fromIndex(link, pattern.getObject().nodeSet)
                    const nodeTrg = this.fromIndex((x.links[link].id as string).toUpperCase(), graph.getObject().nodeSet)
                    nodeLink.push([nodeSrc,nodeTrg])
                }
                if(link.startsWith("E_")){
                    const edgeSrc = this.fromIndexE(link, pattern.getObject().edgeSet)
                    const edgeTrg = this.fromIndexE((x.links[link].id as string).toUpperCase(), graph.getObject().edgeSet)
                    egdeLink.push([edgeSrc,edgeTrg])
                }
            }
            const NodeMap = new TotalFunction(pattern.getObject().nodeSet,graph.getObject().nodeSet,new StructureMap(nodeLink,"productionMap"))
            const EdgeMap = new TotalFunction(pattern.getObject().edgeSet,graph.getObject().edgeSet,new StructureMap(egdeLink,"productionMap"))
            return new TGraphMorphism(pattern,graph,
                new GraphMorphism(pattern.getObject(),graph.getObject(),NodeMap,EdgeMap))
        }
        return false;        
    }
}