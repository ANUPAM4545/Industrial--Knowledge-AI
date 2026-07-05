"""
ForgeMind AI — Dashboard Insights generator
"""
from datetime import datetime, timezone
from typing import Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.dashboard.models import SmartInsight
from app.evaluation.logger import evaluation_db


class DashboardInsightsService:
    """Generates smart executive actions/insights from system history."""

    @staticmethod
    async def get_insights(db: AsyncSession) -> List[SmartInsight]:
        from sqlalchemy import select
        from app.models.document import Document

        try:
            docs_res = await db.execute(select(Document))
            db_docs = list(docs_res.scalars().all())
        except Exception:
            db_docs = []

        insights = []
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

        # 1. Failed documents alert
        failed_docs = [d for d in db_docs if d.status == "failed"]
        if failed_docs:
            insights.append(SmartInsight(
                text=f"{len(failed_docs)} documents failed processing and require re-indexing.",
                type="warning",
                timestamp=now_str
            ))
        else:
            insights.append(SmartInsight(
                text="All knowledge base ingestion jobs completed successfully.",
                type="success",
                timestamp=now_str
            ))

        # 2. Confidence average analysis
        records = evaluation_db._records
        if len(records) >= 2:
            last_record = records[-1]
            prev_record = records[-2]
            diff = last_record.confidence_score - prev_record.confidence_score
            if diff > 0:
                insights.append(SmartInsight(
                    text=f"Confidence score improved by {round(diff * 100, 1)}% in the latest run.",
                    type="success",
                    timestamp=now_str
                ))
            else:
                insights.append(SmartInsight(
                    text="Retrieval confidence score remains stable across active queries.",
                    type="info",
                    timestamp=now_str
                ))
        else:
            insights.append(SmartInsight(
                text="Confidence rates will calibrate as search analytics volume grows.",
                type="info",
                timestamp=now_str
            ))

        # 3. Latency comparison
        if records:
            avg_lat = sum(r.latency_ms for r in records) / len(records)
            if avg_lat < 150:
                insights.append(SmartInsight(
                    text="Average retrieval latency is optimal (under 150ms).",
                    type="success",
                    timestamp=now_str
                ))
            else:
                insights.append(SmartInsight(
                    text=f"Average response latency is {round(avg_lat, 0)}ms. Check system resources.",
                    type="warning",
                    timestamp=now_str
                ))

        # 4. Storage growth / document limits
        if len(db_docs) > 20:
            insights.append(SmartInsight(
                text="Large knowledge index detected. Monitor Qdrant memory utilization.",
                type="alert",
                timestamp=now_str
            ))

        return insights
