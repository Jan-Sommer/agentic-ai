# PCI — GraphQL API

> **Endpoint:** `POST http://localhost:3000/api/graphql` (via API Gateway)  
> **Subgraph:** `http://localhost:3001/api/graphql` (data-management-api)  
> **Auth:** `Authorization: Bearer {JWT}` (Keycloak OIDC)  
> **Framework:** NestJS + Apollo Federation v2

PCI = **Product Carbon Intelligence** — tracks and calculates Product Carbon Footprints (PCF) per product instance, sourcing emission factors from supplier components, transport, and production plant consumptions.

---

## Queries (Read)

### Products

| Query | Arguments | Returns | Use Case |
|-------|-----------|---------|----------|
| `getProducts` | `skip, first, search` | `[GetProductDto!]!` | Paginated product list with search |
| `getProduct(id)` | `id: String!` | `GetProductDto` | Single product with components & instances |
| `getCpcCodes` | `skip, first, search` | `[GetCpcCodeDto!]!` | CPC classification codes lookup |
| `getCategoriesByLevel` | `level: Int!` | `[GetProductCategoryDto!]!` | Product categories at a given hierarchy level |
| `countProductInstancesByProductIds` | `ids: [String!]!` | `[Int!]!` | Instance counts per product |
| `countProductMissingBOM` | — | `Int!` | Count products with no BOM file attached |

### Product Instances

| Query | Arguments | Returns | Use Case |
|-------|-----------|---------|----------|
| `getProductInstances` | `filter, sort, skip, first, search` | `[GetProductInstanceDto!]!` | Filtered, paginated instance list |
| `getProductInstance(id)` | `id: String!` | `GetProductInstanceDto!` | Single instance with full PCF data |
| `getProductInstancesCount` | `filter` | `Int!` | Count instances matching filter |
| `getProductInstancesByProductId` | `id: String!` | `[GetProductInstanceDto!]!` | All instances for a product |
| `countProductInstancesByProductionPlantIds` | `ids: [String!]!` | `[Int!]!` | Instance counts per plant |
| `getProductNamesByProductionPlantId` | `productionPlantId: String!` | `[String!]!` | Product names at a plant |
| `getProductInstancesAvailableFiltersValues` | — | `GetProductInstancesFilterValuesDto!` | Available dimension filter values |

### Suppliers

| Query | Arguments | Returns | Use Case |
|-------|-----------|---------|----------|
| `getSuppliers` | `filter, sort, skip, first, search` | `[GetSupplierDto!]!` | Filtered supplier list |
| `getSupplier(id)` | `id: String!` | `GetSupplierDto!` | Single supplier with components |
| `getSuppliersCount` | `filter` | `Int!` | Count suppliers |
| `countSupplierMissingComponents` | — | `Int!` | Suppliers with no components attached |
| `getSupplierComponentsBySupplierId` | `supplierId, sort, skip, first, search` | `[GetSupplierComponentDto!]!` | Components for a supplier |
| `getSingleSupplierComponentById` | `componentId: String!` | `GetSupplierComponentDto!` | Single component detail |
| `getSupplierComponentsCount` | `supplierId: String!` | `Int!` | Component count for a supplier |
| `getSuppliersAvailableFiltersValues` | — | `GetSuppliersFilterValuesDto!` | Available filter values |

### Production Plants

| Query | Arguments | Returns | Use Case |
|-------|-----------|---------|----------|
| `getProductionPlants` | `filter, sort, skip, first, search` | `[GetProductionPlantDto!]!` | Filtered plant list |
| `getProductionPlant(id)` | `id: String!` | `GetProductionPlantDto!` | Single plant detail |
| `getProductionPlantsCount` | `filter` | `Int!` | Count plants |
| `countProductionPlantMissingConsumptions` | — | `Int!` | Plants with no consumption data |
| `getProductionPlantConsumptionByProductionPlantAndCategory` | `plantId, category, sort, skip, first, search` | `[GetProductionPlantConsumptionDto!]!` | Consumptions by plant + energy category |
| `getProductionPlantConsumptionById` | `id: String!` | `GetProductionPlantConsumptionDto!` | Single consumption record |
| `getProductionPlantConsumptionsCountByProductionPlantAndCategory` | `plantId, category` | `Int!` | Count consumptions |
| `getAvailableSupplierNames` | — | `[String!]!` | All supplier names (for dropdowns) |
| `getAvailableProductionPlants` | — | `[GetProductionPlantDto!]!` | All plants |
| `getAvailableProductionPlantsWithExclusions` | `exclusions, skip, first, search` | `[GetProductionPlantDto!]!` | Plants excluding specific IDs |
| `getProductionPlantsAvailableFiltersValues` | — | `GetProductionPlantsFilterValuesDto!` | Available filter values |

---

## Mutations (Write)

### Product Management

| Mutation | Key Arguments | Returns | Notes |
|----------|--------------|---------|-------|
| `addProduct` | `createProductInput, [createProductInstanceInput]` | `GetProductDto!` | Create product + instances; supports file upload (BOM) |
| `updateProduct` | `id, updateProductInput` | `GetProductDto!` | Update product details |
| `removeProduct` | `id: String!` | `Boolean!` | Delete product |
| `insertMultipleComponentsIntoProduct` | `id, [components]` | `GetProductDto!` | Bulk-add components to product |
| `addProductInstance` | `createProductInstanceInput` | `GetProductInstanceDto!` | Add one instance to a product |
| `addProductInstancesToProduct` | `productId, [instances]` | `[GetProductInstanceDto!]!` | Bulk-add instances |
| `updateProductInstanceDocumentationById` | `id, documentation` | `GetProductInstanceDto!` | Update instance documentation |
| `removeProductInstance` | `id: String!` | `Boolean!` | Delete instance |

### Supplier Management

| Mutation | Key Arguments | Returns | Notes |
|----------|--------------|---------|-------|
| `addSupplier` | `createSupplierInput` | `GetSupplierDto!` | Create supplier |
| `updateSupplier` | `id, updateSupplierInput` | `GetSupplierDto!` | Update supplier |
| `removeSupplier` | `id: String!` | `Boolean!` | Delete supplier |
| `insertComponentIntoSupplier` | `id, component` | `GetSupplierDto!` | Add one component to supplier |
| `insertMultipleComponentsIntoSupplier` | `id, [components]` | `GetSupplierDto!` | Bulk-add components |
| `updateSupplierComponent` | `id, component` | `GetSupplierDto!` | Update a component |
| `removeComponentsFromSupplier` | `id, [componentsId]` | `GetSupplierDto!` | Remove components |
| `triggerSupplierComponentEmissions` | `supplierId, componentId` | `Boolean!` | Queue emission factor fetch for one component |
| `triggerAllSupplierComponentEmissions` | `supplierId` | `Boolean!` | Queue emission fetch for all supplier components |

### Production Plant Management

| Mutation | Key Arguments | Returns | Notes |
|----------|--------------|---------|-------|
| `addProductionPlant` | `createProductionPlantInput` | `GetProductionPlantDto!` | Create plant |
| `updateProductionPlant` | `id, updateProductionPlantInput` | `GetProductionPlantDto!` | Update plant |
| `removeProductionPlants` | `ids: [String!]!` | `Boolean!` | Bulk delete plants |
| `insertComponentIntoProductionPlant` | `id, consumption` | `GetProductionPlantDto!` | Add consumption record |
| `insertMultipleConsumptionsIntoProductionPlant` | `id, [consumptions]` | `GetProductionPlantDto!` | Bulk-add consumptions |
| `updateProductionPlantConsumption` | `id, consumption` | `GetProductionPlantConsumptionDto!` | Update consumption |
| `removeConsumptionsFromProductionPlant` | `id, [consumptionsId]` | `GetProductionPlantDto!` | Remove consumptions |
| `triggerConsumptionEmissions` | `plantId, consumptionId` | `Boolean!` | Queue emission fetch for one consumption |
| `triggerAllConsumptionsEmissions` | `plantId` | `Boolean!` | Queue emission fetch for all consumptions |

### PCF Calculation

| Mutation | Arguments | Returns | Notes |
|----------|-----------|---------|-------|
| `calculateProductCarbonFootprint` | `pcfId: String!` | `Boolean!` | Enqueue full PCF calculation job |
| `selectEmissionFactor` | `segment, elementId, efType, selectedMatch` | `Boolean!` | Pick an emission factor match for a component |
| `setCustomEmissionFactor` | `segment, elementId, customEF` | `Boolean!` | Set a custom EF manually |
| `updateProductCarbonFootprintDocumentation` | `id, documentation` | `Boolean!` | Update PCF documentation fields |

### AI-Assisted Import

| Mutation | Arguments | Returns | Notes |
|----------|-----------|---------|-------|
| `generateColMappingWithAi` | `columns, availableColumns` | `ColumnMappingResponseDto!` | Use **OpenAI** to map CSV column headers to PCI schema fields |

> **MCP note — `generateColMappingWithAi`:** Already calls an LLM internally. An MCP tool wrapping this could chain it with a file-read step to enable fully automated CSV ingestion.

---

## Async Emission Jobs

Triggered via mutations; processed by `carbon-footprint-service` via BullMQ queues:

| Queue | Triggered by | External call |
|-------|-------------|---------------|
| `FETCH_COMPONENT_EMISSIONS` | `triggerSupplierComponentEmissions` | EFMS API |
| `FETCH_CONSUMPTION_EMISSIONS` | `triggerConsumptionEmissions` | Internal calculation |
| `FETCH_TRANSPORT_EMISSIONS` | (internal) | EcoTransit SOAP API |
| `CALCULATE_CARBON_FOOTPRINT` | `calculateProductCarbonFootprint` | Aggregation step |

Monitor job status via REST SSE streams (see `pci/rest.md`).

---

## MCP Opportunity

| Tool | Operation | Use Case |
|------|-----------|----------|
| `get_products` | `getProducts` query | "List all products and how many instances each has." |
| `get_product_instance` | `getProductInstance(id)` query | "Show me the full PCF data for product instance PI-789." |
| `get_suppliers` | `getSuppliers` query | "Which suppliers are missing component data?" |
| `count_missing_bom` | `countProductMissingBOM` query | "How many products are missing a BOM file?" |
| `get_production_plants` | `getProductionPlants` query | "List all production plants with missing consumption data." |
| `calculate_pcf` | `calculateProductCarbonFootprint` mutation | "Trigger the full PCF calculation for product instance PI-789." (async — monitor via SSE) |
| `trigger_supplier_emissions` | `triggerAllSupplierComponentEmissions` mutation | "Fetch emission factors for all components of supplier S-42." |
| `select_emission_factor` | `selectEmissionFactor` mutation | "Use emission factor match EF-99 for component C-12 in segment 'components'." |
| `set_custom_emission_factor` | `setCustomEmissionFactor` mutation | "Set a custom EF of 2.3 kgCO2e/kg for component C-12." |
| `ai_column_mapping` | `generateColMappingWithAi` mutation | "Map these CSV headers to the PCI schema: [Weight_kg, Supplier_Name, Material_ID]." |

> **Async pattern:** `calculateProductCarbonFootprint` enqueues a BullMQ job. After calling it, subscribe to the SSE stream at `/api/product-carbon-footprints/:productInstanceId` (see `pci/rest.md`) to monitor progress and return the final PCF result.

> **AI chaining:** `generateColMappingWithAi` already calls OpenAI internally. An MCP tool can chain: read CSV headers → call this mutation → present mapping for human approval → proceed with bulk import.
