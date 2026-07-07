"""
NEXO — Citation Validator Implementation
"""
import re
from typing import Any, Dict, List
from app.evaluation.interfaces import CitationValidator


class RegexCitationValidator(CitationValidator):
    """
    Validates citations in the format [doc_id, page, chunk] or [doc_id, page]
    against the actually retrieved chunks.
    """
    def __init__(self):
        # Matches brackets containing word-like segments, e.g., [doc_123, 5, 2] or [doc_abc, p. 3]
        self.citation_pattern = re.compile(r"\[([^\]]+)\]")

    def _parse_citation(self, raw_text: str) -> Dict[str, Any]:
        """
        Parse raw citation text like 'doc_abc, p. 5' or 'doc_abc, 5, 1'
        into structured keys.
        """
        parts = [p.strip() for p in raw_text.split(",")]
        
        doc_id = parts[0] if len(parts) > 0 else ""
        page_number = None
        chunk_index = None
        
        # Try parsing page number and chunk index
        for part in parts[1:]:
            part_lower = part.lower()
            # Look for page identifier: "p. 5", "page 5", or a digit
            page_match = re.search(r"(?:p\.|page\s+)?(\d+)", part_lower)
            if page_match and page_number is None:
                page_number = int(page_match.group(1))
                continue
                
            # Look for chunk identifier: "chunk 2", "c. 2", or a digit
            chunk_match = re.search(r"(?:chunk|c\.)\s*(\d+)", part_lower)
            if chunk_match and chunk_index is None:
                chunk_index = int(chunk_match.group(1))
                continue
                
            # Fallback if it is just a raw digit
            if part.isdigit():
                if page_number is None:
                    page_number = int(part)
                elif chunk_index is None:
                    chunk_index = int(part)

        return {
            "raw": f"[{raw_text}]",
            "document_id": doc_id,
            "page_number": page_number,
            "chunk_index": chunk_index
        }

    def validate(self, response_text: str, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        raw_matches = self.citation_pattern.findall(response_text)
        
        citations = []
        seen_citations = set()
        duplicate_count = 0
        valid_count = 0
        
        missing_references = []
        
        # Build mapping of retrieved chunks for O(1) validation lookup
        # Map: (doc_id, page_number) -> chunk
        chunk_map = {}
        for c in chunks:
            d_id = c.get("document_id") or ""
            p_num = c.get("page_number")
            chunk_map[(d_id.lower(), p_num)] = c
            
        for match in raw_matches:
            parsed = self._parse_citation(match)
            d_id = parsed["document_id"].lower()
            p_num = parsed["page_number"]
            
            citation_key = (d_id, p_num, parsed["chunk_index"])
            
            # Check for duplication
            is_duplicate = False
            if citation_key in seen_citations:
                is_duplicate = True
                duplicate_count += 1
            else:
                seen_citations.add(citation_key)
                
            # Check validity against retrieved context chunks
            is_valid = False
            # Try exact match on doc_id and page number
            if (d_id, p_num) in chunk_map:
                is_valid = True
            else:
                # Also support partial matches where the citation doc_id is a substring of chunk's doc_id
                # (e.g. citing "operating_manual" instead of "operating_manual_v2.pdf")
                for (chunk_doc_id, chunk_page) in chunk_map.keys():
                    if d_id in chunk_doc_id and (p_num is None or p_num == chunk_page):
                        is_valid = True
                        break
                        
            parsed["is_valid"] = is_valid
            parsed["is_duplicate"] = is_duplicate
            
            if is_valid:
                valid_count += 1
            else:
                missing_references.append(parsed["raw"])
                
            citations.append(parsed)
            
        # Calculate citation score (0.0 to 1.0)
        if not citations:
            # If no citations are present, but chunks are retrieved, it may or may not be penalized.
            # Here we default to 1.0 but evaluation service can apply penalties.
            citation_score = 1.0
        else:
            citation_score = valid_count / len(citations)
            
        return {
            "citation_score": citation_score,
            "citations": citations,
            "duplicate_citations_count": duplicate_count,
            "missing_references": missing_references
        }
