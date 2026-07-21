import { RealDashboardProvider } from './RealDashboardProvider'
import { RealDocumentProvider } from './RealDocumentProvider'
import { RealChatProvider } from './RealChatProvider'
import type { IDashboardProvider, IDocumentProvider, IChatProvider } from './types'

// Instantiate singletons
const realDashboard = new RealDashboardProvider()
const realDocument = new RealDocumentProvider()
const realChat = new RealChatProvider()

export class ProviderFactory {
  static getDashboardProvider(): IDashboardProvider {
    return realDashboard
  }

  static getDocumentProvider(): IDocumentProvider {
    return realDocument
  }

  static getChatProvider(): IChatProvider {
    return realChat
  }
}
