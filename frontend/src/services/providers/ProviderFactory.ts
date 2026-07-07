import { useUIStore } from '../../store/uiStore'
import { RealDashboardProvider } from './RealDashboardProvider'
import { DemoDashboardProvider } from './DemoDashboardProvider'
import { RealDocumentProvider } from './RealDocumentProvider'
import { DemoDocumentProvider } from './DemoDocumentProvider'
import { RealChatProvider } from './RealChatProvider'
import { DemoChatProvider } from './DemoChatProvider'
import type { IDashboardProvider, IDocumentProvider, IChatProvider } from './types'

// Instantiate singletons
const realDashboard = new RealDashboardProvider()
const demoDashboard = new DemoDashboardProvider()
const realDocument = new RealDocumentProvider()
const demoDocument = new DemoDocumentProvider()
const realChat = new RealChatProvider()
const demoChat = new DemoChatProvider()

export class ProviderFactory {
  static getDashboardProvider(): IDashboardProvider {
    const { workspaceMode } = useUIStore.getState()
    return workspaceMode === 'demo' ? demoDashboard : realDashboard
  }

  static getDocumentProvider(): IDocumentProvider {
    const { workspaceMode } = useUIStore.getState()
    return workspaceMode === 'demo' ? demoDocument : realDocument
  }

  static getChatProvider(): IChatProvider {
    const { workspaceMode } = useUIStore.getState()
    return workspaceMode === 'demo' ? demoChat : realChat
  }
}
