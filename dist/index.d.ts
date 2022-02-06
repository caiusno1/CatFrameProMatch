import { Graph, GraphMorphism, TGraph, TGraphMorphism } from 'catframe/dist';
/**
 * An (monic) arrow-finder for the catframe Framework based on prolog (currently only supports graphs)
 * @name CatFrameProMatch
 */
export declare class CatFrameProMatch<Tobject, Tedge> {
    /**
     *
     * @param graphPattern The patter that should be matched/found in Graph *graph*
     * @param graph The Graph where we search for the given pattern *graphPattern*
     * @param callback A callback-function which will be called for all monic Arrows which were found (and at the end with false)
     * @returns All monic arrows that can connect *graphPattern* and *graph* and is structure preserving (via *callback*)
     */
    matchGraph(graphPattern: Graph<Tobject, Tedge>, graph: Graph<Tobject, Tedge>, callback: (a: GraphMorphism<Tobject, Tedge> | false) => void): GraphMorphism<Tobject, Tedge>;
    private toIndex;
    private fromIndex;
    private toIndexE;
    private fromIndexE;
    /**
     * Converts the prolog answer to a GraphMorphism
     * @param x The answer created by prolog
     * @param pattern The src graph of the GraphMorphism aka graph pattern
     * @param graph The trg graph of the GraphMorphism aka graph
     * @returns The structure preserving monic morphism that is induced by the prolog answer or false if the prolog answer is false
     */
    private answerToGraphMorphism;
    matchTGraph(graphPattern: TGraph<Tobject, Tedge>, graph: TGraph<Tobject, Tedge>, callback: (a: TGraphMorphism<Tobject, Tedge> | false) => void): TGraphMorphism<Tobject, Tedge>;
    private toIndexT;
    private fromIndexT;
    private toIndexTE;
    private fromIndexTE;
    /**
     * Converts the prolog answer to a GraphMorphism
     * @param x The answer created by prolog
     * @param pattern The src graph of the GraphMorphism aka graph pattern
     * @param graph The trg graph of the GraphMorphism aka graph
     * @returns The structure preserving monic morphism that is induced by the prolog answer or false if the prolog answer is false
     */
    private answerToTGraphMorphism;
}
