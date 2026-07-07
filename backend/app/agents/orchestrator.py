"""
ForgeMind AI — Multi-Agent Orchestrator
Compiles the LangGraph workflow by combining all specialized agents.
"""
from typing import Dict, Any

# Assuming langgraph is installed locally and in container
try:
    from langgraph.graph import StateGraph, END
except ImportError:
    StateGraph = None
    END = "__end__"

from app.agents.interfaces import CopilotState

# Import Agents
from app.agents.nodes.chief_agent import ChiefAgent
from app.agents.nodes.knowledge_graph_agent import KnowledgeGraphAgent
from app.agents.nodes.retrieval_agent import RetrievalAgent
from app.agents.nodes.reasoning_agent import ReasoningAgent


class Orchestrator:
    def __init__(self):
        self.chief = ChiefAgent()
        self.kg_agent = KnowledgeGraphAgent()
        self.retrieval = RetrievalAgent()
        self.reasoning = ReasoningAgent()
        self.graph = self._build_graph()

    def _build_graph(self):
        if StateGraph is None:
            # Fallback mock for testing if langgraph is missing
            return None
            
        workflow = StateGraph(CopilotState)
        
        # Add Nodes
        workflow.add_node("chief", self._run_chief)
        workflow.add_node("knowledge_graph_agent", self._run_kg)
        workflow.add_node("retrieval_agent", self._run_retrieval)
        workflow.add_node("reasoning_agent", self._run_reasoning)
        
        # Add Edges
        workflow.set_entry_point("chief")
        
        # Conditional Routing from Chief
        workflow.add_conditional_edges(
            "chief",
            lambda x: x["next_action"],
            {
                "knowledge_graph_agent": "knowledge_graph_agent",
                "retrieval_agent": "retrieval_agent",
            }
        )
        
        # Standard flows
        workflow.add_edge("knowledge_graph_agent", "reasoning_agent")
        workflow.add_edge("retrieval_agent", "reasoning_agent")
        
        # Conditional Routing from Reasoning
        workflow.add_conditional_edges(
            "reasoning_agent",
            lambda x: x["next_action"],
            {
                "end": END
            }
        )
        
        return workflow.compile()

    async def _run_chief(self, state: CopilotState):
        return await self.chief.process(state)

    async def _run_kg(self, state: CopilotState):
        return await self.kg_agent.process(state)

    async def _run_retrieval(self, state: CopilotState):
        return await self.retrieval.process(state)
        
    async def _run_reasoning(self, state: CopilotState):
        return await self.reasoning.process(state)

    async def run(self, initial_state: CopilotState) -> CopilotState:
        if self.graph is None:
            # Fallback if LangGraph is not installed correctly
            # We just manually run the graph logic
            state = await self._run_chief(initial_state)
            merged_state = {**initial_state, **state}
            
            if merged_state["next_action"] == "knowledge_graph_agent":
                st2 = await self._run_kg(merged_state)
            else:
                st2 = await self._run_retrieval(merged_state)
            
            merged_state.update(st2)
            merged_state["traces"].extend(st2.get("traces", []))
            
            st3 = await self._run_reasoning(merged_state)
            merged_state.update(st3)
            merged_state["traces"].extend(st3.get("traces", []))
            
            return merged_state
            
        final_state = await self.graph.ainvoke(initial_state)
        return final_state
