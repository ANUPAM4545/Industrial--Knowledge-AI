"""
ForgeMind AI — Dashboard Trend & Analytics aggregator
"""
from datetime import datetime, timedelta, timezone
from collections import Counter
import re
from typing import List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.evaluation.logger import evaluation_db
from app.dashboard.models import TrendDatapoint, QueryMetric, KeywordMetric, SearchAnalytics, DashboardTrends


class DashboardAnalyticsService:
    """Provides trend lines and detailed search metrics."""

    @staticmethod
    def get_search_analytics() -> SearchAnalytics:
        records = evaluation_db._records
        
        if not records:
            return SearchAnalytics(
                most_frequent_queries=[],
                top_keywords=[],
                average_query_length=0.0,
                retrieval_success_rate=1.0,
                average_similarity=0.0,
                average_citation_count=0.0
            )

        # 1. Query frequencies
        queries = [r.query for r in records if r.query]
        query_counts = Counter(queries)
        frequent_queries = [
            QueryMetric(query_text=q, frequency=c)
            for q, c in query_counts.most_common(5)
        ]

        # 2. Keywords extraction
        keywords = []
        for q in queries:
            tokens = re.findall(r'\b\w{4,15}\b', q.lower())
            keywords.extend(tokens)
        keyword_counts = Counter(keywords)
        top_keywords = [
            KeywordMetric(keyword=k, count=c)
            for k, c in keyword_counts.most_common(5)
        ]

        # 3. Stats averages
        avg_len = sum(len(q) for q in queries) / len(queries) if queries else 0.0
        
        # Retrieval success (similarity score >= 0.60 matches success)
        success_count = sum(1 for r in records if r.average_similarity >= 0.60)
        success_rate = success_count / len(records) if records else 1.0
        
        avg_similarity = sum(r.average_similarity for r in records) / len(records)
        avg_citation = sum(int(r.citation_score * 3) for r in records) / len(records)

        return SearchAnalytics(
            most_frequent_queries=frequent_queries,
            top_keywords=top_keywords,
            average_query_length=round(avg_len, 1),
            retrieval_success_rate=round(success_rate, 2),
            average_similarity=round(avg_similarity, 2),
            average_citation_count=round(avg_citation, 1)
        )

    @staticmethod
    async def get_trends(db: AsyncSession) -> DashboardTrends:
        from sqlalchemy import select, func
        from app.models.document import Document
        from app.models.chunk import Chunk

        try:
            docs_res = await db.execute(select(Document))
            db_docs = list(docs_res.scalars().all())

            chunk_count_res = await db.execute(select(func.count()).select_from(Chunk))
            db_chunks_count = chunk_count_res.scalar() or 0
        except Exception:
            db_docs = []
            db_chunks_count = 0

        records = evaluation_db._records
        
        # Construct last 7 days dates
        today = datetime.now(timezone.utc).date()
        days = [today - timedelta(days=i) for i in range(6, -1, -1)]

        queries_series = []
        confidence_series = []
        latency_series = []
        uploads_series = []
        doc_growth_series = []
        vector_growth_series = []
        
        for d in days:
            day_records = [r for r in records if r.created_at.date() == d]
            q_val = len(day_records)
            conf_val = sum(r.confidence_score for r in day_records) / q_val if q_val > 0 else 0.0
            lat_val = sum(r.latency_ms for r in day_records) / q_val if q_val > 0 else 0.0
            
            date_str = d.strftime("%Y-%m-%d")
            
            queries_series.append(TrendDatapoint(date=date_str, value=float(q_val)))
            confidence_series.append(TrendDatapoint(date=date_str, value=round(conf_val, 1)))
            latency_series.append(TrendDatapoint(date=date_str, value=round(lat_val, 1)))

            # Doc uploads on this specific day
            day_uploads = sum(1 for doc in db_docs if doc.created_at.date() == d)
            uploads_series.append(TrendDatapoint(date=date_str, value=float(day_uploads)))
            
            # Simple cumulative count simulation for growth line chart mapping
            cum_docs = sum(1 for doc in db_docs if doc.created_at.date() <= d)
            doc_growth_series.append(TrendDatapoint(date=date_str, value=float(cum_docs)))
            
            # Simple vectors count simulation (chunks ratio mapping)
            cum_vectors = cum_docs * 10
            vector_growth_series.append(TrendDatapoint(date=date_str, value=float(cum_vectors)))

        return DashboardTrends(
            daily_uploads=uploads_series,
            daily_queries=queries_series,
            confidence_trend=confidence_series,
            latency_trend=latency_series,
            document_growth=doc_growth_series,
            vector_growth=vector_growth_series
        )
