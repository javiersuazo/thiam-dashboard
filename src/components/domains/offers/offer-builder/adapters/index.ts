import type { IOfferService, ICatalogService } from '../ports'
import { OfferMockAdapter } from './OfferMockAdapter'
import { CatalogMockAdapter } from './CatalogMockAdapter'
import { USE_MOCK_OFFERS } from '../config/adapter.config'

let offerServiceInstance: IOfferService | null = null
let catalogServiceInstance: ICatalogService | null = null

export function createOfferService(): IOfferService {
  if (!offerServiceInstance) {
    if (USE_MOCK_OFFERS) {
      offerServiceInstance = new OfferMockAdapter()
    } else {
      throw new Error('Real backend adapter not implemented yet')
    }
  }
  return offerServiceInstance
}

export function createCatalogService(): ICatalogService {
  if (!catalogServiceInstance) {
    if (USE_MOCK_OFFERS) {
      catalogServiceInstance = new CatalogMockAdapter()
    } else {
      throw new Error('Real backend adapter not implemented yet')
    }
  }
  return catalogServiceInstance
}

export function resetServices() {
  offerServiceInstance = null
  catalogServiceInstance = null
}
