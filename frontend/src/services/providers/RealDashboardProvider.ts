import apiClient from '../apiClient'
import type { IDashboardProvider } from './types'
import type { DashboardOverview, KnowledgeHealth, SearchAnalytics, SystemHealth, DashboardTrends, SmartInsight } from '../dashboardService'

export class RealDashboardProvider implements IDashboardProvider {
  async getOverview(): Promise<DashboardOverview> {
    const response = await apiClient.get('/dashboard/overview')
    return response.data
  }

  async getKnowledge(): Promise<KnowledgeHealth> {
    const response = await apiClient.get('/dashboard/knowledge')
    return response.data
  }

  async getSearch(): Promise<SearchAnalytics> {
    const response = await apiClient.get('/dashboard/search')
    return response.data
  }

  async getSystem(): Promise<SystemHealth> {
    const response = await apiClient.get('/dashboard/system')
    return response.data
  }

  async getTrends(): Promise<DashboardTrends> {
    const response = await apiClient.get('/dashboard/trends')
    return response.data
  }

  async getInsights(): Promise<SmartInsight[]> {
    const response = await apiClient.get('/dashboard/insights')
    return response.data
  }
}
