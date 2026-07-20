"""
NEXO — Agent Interfaces
Defines the LangGraph State and Agent contracts for the Enterprise Copilot.
"""
from typing import TypedDict, List, Dict, Any, Annotated
import operator
from abc import ABC, abstractmethod


class AgentTrace(TypedDict):
    """Used for Explainable AI to show the user exactly what the agent did"""
    agent_name: str
    action: str
    latency_ms: float
    confidence: str
    metadata: Dict[str, Any]


class CopilotState(TypedDict):
    """
    The shared state passed through the LangGraph Orchestrator
    """
    # Conversation
    conversation_id: str
    user_id: str
    messages: Annotated[List[Dict[str, Any]], operator.add]
    
    # Internal Reasoning State
    current_intent: str
    extracted_entities: List[str]
    retrieved_chunks: List[Dict[str, Any]]
    knowledge_graph_paths: List[Dict[str, Any]]
    
    # Explainable AI
    traces: Annotated[List[AgentTrace], operator.add]
    
    # Final Output
    final_answer: str
    confidence_score: float
    next_action: str # Indicates where the graph should route next
    
    # Validation & RAG Metadata
    validation_passed: bool
    no_context_found: bool
    citations: List[Dict[str, Any]]
    valid_document_ids: List[str]
    document_titles: Dict[str, str]



class BaseAgent(ABC):
    """
    Abstract contract that all specialized agents must implement.
    Each agent takes the current state, mutates it, and returns the updated fields.
    """
    
    @property
    @abstractmethod
    def name(self) -> str:
        """The display name of the agent (e.g., 'Knowledge Graph Agent')"""
        pass
        
    @abstractmethod
    async def process(self, state: CopilotState) -> dict:
        """
        Executes the agent's logic.
        Returns a dictionary of fields to update in the state.
        """
        pass
