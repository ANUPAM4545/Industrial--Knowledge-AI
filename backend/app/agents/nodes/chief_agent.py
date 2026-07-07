"""
NEXO — Chief Agent
The entry point for the Multi-Agent Orchestrator. Analyzes intent and routes the query.
"""
from typing import Dict, Any

from app.agents.interfaces import BaseAgent, CopilotState, AgentTrace


class ChiefAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "Chief Orchestrator Agent"

    async def process(self, state: CopilotState) -> dict:
        import time
        start_time = time.time()
        
        # Get the latest user message
        messages = state.get("messages", [])
        last_message = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        
        # Analyze intent (Mock logic for hackathon)
        # In a real enterprise system, an LLM call would decide this based on prompt templates
        query = last_message.lower()
        
        intent = "UNKNOWN"
        next_action = "knowledge_graph_agent"
        
        if "compare" in query or "difference" in query:
            intent = "COMPARE_DOCUMENTS"
            next_action = "retrieval_agent"
        elif "risk" in query or "compliance" in query or "regulation" in query:
            intent = "COMPLIANCE_CHECK"
            next_action = "retrieval_agent"
        elif "maintenance" in query or "overdue" in query:
            intent = "MAINTENANCE_PLANNING"
            next_action = "knowledge_graph_agent"
        elif "incident" in query or "root cause" in query:
            intent = "INCIDENT_ANALYSIS"
            next_action = "knowledge_graph_agent"
        else:
            intent = "GENERAL_INQUIRY"
            next_action = "retrieval_agent"
            
        trace = AgentTrace(
            agent_name=self.name,
            action=f"Analyzed intent: {intent}. Routing to {next_action}.",
            latency_ms=round((time.time() - start_time) * 1000, 2),
            confidence=0.95,
            metadata={"intent": intent, "next_node": next_action}
        )
        
        return {
            "current_intent": intent,
            "next_action": next_action,
            "traces": [trace]
        }
