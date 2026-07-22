"""
NEXO — Graph Extraction Service
"""
import json
import structlog
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.knowledge_graph import KnowledgeNode, KnowledgeEdge
from app.models.chunk import Chunk
from app.ai.registry import AIRegistry

logger = structlog.get_logger(__name__)

class GraphExtractionService:
    """Service to extract Knowledge Graph nodes and edges from document text using LLM."""

    @staticmethod
    async def extract_from_document(db: AsyncSession, document_id: str, workspace_id: str) -> None:
        """
        Extracts entities (nodes) and relationships (edges) from the document
        and inserts them into the Knowledge Graph tables.
        """
        logger.info("Starting graph extraction for document", document_id=document_id)
        
        # 1. Fetch chunks to get document text
        # Since we just want the text, we'll fetch all chunks
        result = await db.execute(select(Chunk).where(Chunk.document_id == document_id))
        chunks = result.scalars().all()
        
        if not chunks:
            logger.warning("No chunks found for document, skipping graph extraction", document_id=document_id)
            return
            
        # Combine text (take up to 10k chars to avoid LLM context limits for this quick extraction)
        full_text = "\n".join([chunk.text for chunk in chunks])
        if len(full_text) > 10000:
            full_text = full_text[:10000]
            
        # 2. Get LLM Provider
        llm = AIRegistry().get_llm_provider()
        
        # 3. Construct Prompt
        system_prompt = """You are an expert Industrial Knowledge Graph extractor.
Your job is to read industrial documents and extract Entities and Relationships.
Valid Entity Types: Equipment, Incident, Document, Standard, Person, Risk
Output MUST be valid JSON in the following format, with NO markdown formatting around it (do not use ```json):
{
  "nodes": [
    {"label": "Pump 123", "type": "Equipment"}
  ],
  "edges": [
    {"source": "Pump 123", "target": "John Doe", "relationship": "MAINTAINED_BY"}
  ]
}
Extract up to 15 key nodes and their relationships. Ensure edge sources and targets strictly match node labels.
"""
        
        try:
            logger.info("Sending extraction request to LLM...")
            response_text = await llm.generate(
                prompt=f"Document Text:\n\n{full_text}",
                system_prompt=system_prompt,
                temperature=0.1
            )
            
            # 4. Parse JSON
            # Clean up markdown formatting if the LLM ignored instructions
            cleaned_text = response_text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()
                
            data = json.loads(cleaned_text)
            
            # 5. Insert Nodes and Edges
            nodes_data = data.get("nodes", [])
            edges_data = data.get("edges", [])
            
            # To resolve IDs, we'll keep a map of label -> db_node.id
            node_map = {}
            
            # Insert Nodes
            for n_data in nodes_data:
                node = KnowledgeNode(
                    workspace_id=workspace_id,
                    label=n_data.get("label", "Unknown"),
                    type=n_data.get("type", "Entity"),
                    metadata_json={"document_id": document_id}
                )
                db.add(node)
                await db.flush() # Get the ID
                node_map[node.label] = node.id
                
            # Insert Edges
            for e_data in edges_data:
                source_label = e_data.get("source")
                target_label = e_data.get("target")
                
                source_id = node_map.get(source_label)
                target_id = node_map.get(target_label)
                
                if source_id and target_id:
                    edge = KnowledgeEdge(
                        workspace_id=workspace_id,
                        source_node_id=source_id,
                        target_node_id=target_id,
                        relationship_type=e_data.get("relationship", "RELATED_TO"),
                        confidence=0.9
                    )
                    db.add(edge)
                    
            await db.commit()
            logger.info("Successfully extracted and saved graph", nodes=len(node_map), edges=len(edges_data))
            
        except json.JSONDecodeError:
            logger.error("Failed to parse LLM response as JSON", response=response_text)
        except Exception as e:
            logger.error("Error during graph extraction", error=str(e))
