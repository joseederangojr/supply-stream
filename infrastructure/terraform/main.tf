provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "supply_stream" {
  name     = var.resource_group_name
  location = var.location
}

# Database
resource "azurerm_postgresql_server" "supply_stream" {
  name                = "${var.prefix}-postgres"
  location            = azurerm_resource_group.supply_stream.location
  resource_group_name = azurerm_resource_group.supply_stream.name

  sku_name = "GP_Gen5_2"

  storage_mb                   = 5120
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
  auto_grow_enabled            = true

  administrator_login          = var.db_admin_username
  administrator_login_password = var.db_admin_password
  version                      = "11"
  ssl_enforcement_enabled      = true
}

resource "azurerm_postgresql_database" "supply_stream" {
  name                = var.db_name
  resource_group_name = azurerm_resource_group.supply_stream.name
  server_name         = azurerm_postgresql_server.supply_stream.name
  charset             = "UTF8"
  collation           = "English_United States.1252"
}

# Service Bus
resource "azurerm_servicebus_namespace" "supply_stream" {
  name                = "${var.prefix}-servicebus"
  location            = azurerm_resource_group.supply_stream.location
  resource_group_name = azurerm_resource_group.supply_stream.name
  sku                 = "Standard"
}

resource "azurerm_servicebus_queue" "notifications" {
  name                = "notifications"
  resource_group_name = azurerm_resource_group.supply_stream.name
  namespace_name      = azurerm_servicebus_namespace.supply_stream.name

  enable_partitioning = true
}

resource "azurerm_servicebus_queue" "events" {
  name                = "events"
  resource_group_name = azurerm_resource_group.supply_stream.name
  namespace_name      = azurerm_servicebus_namespace.supply_stream.name

  enable_partitioning = true
}

# Container Registry
resource "azurerm_container_registry" "supply_stream" {
  name                = "${var.prefix}registry"
  resource_group_name = azurerm_resource_group.supply_stream.name
  location            = azurerm_resource_group.supply_stream.location
  sku                 = "Standard"
  admin_enabled       = true
}

# Kubernetes Cluster
resource "azurerm_kubernetes_cluster" "supply_stream" {
  name                = "${var.prefix}-aks"
  location            = azurerm_resource_group.supply_stream.location
  resource_group_name = azurerm_resource_group.supply_stream.name
  dns_prefix          = "${var.prefix}-aks"

  default_node_pool {
    name       = "default"
    node_count = 2
    vm_size    = "Standard_D2_v2"
  }

  identity {
    type = "SystemAssigned"
  }

  role_based_access_control {
    enabled = true
  }
}

# Application Insights
resource "azurerm_application_insights" "supply_stream" {
  name                = "${var.prefix}-appinsights"
  location            = azurerm_resource_group.supply_stream.location
  resource_group_name = azurerm_resource_group.supply_stream.name
  application_type    = "web"
}

# Key Vault
resource "azurerm_key_vault" "supply_stream" {
  name                = "${var.prefix}-keyvault"
  location            = azurerm_resource_group.supply_stream.location
  resource_group_name = azurerm_resource_group.supply_stream.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [
      "Get", "List", "Create", "Delete", "Update",
    ]

    secret_permissions = [
      "Get", "List", "Set", "Delete",
    ]
  }
}

# Store secrets in Key Vault
resource "azurerm_key_vault_secret" "db_connection_string" {
  name         = "db-connection-string"
  value        = "postgresql://${var.db_admin_username}:${var.db_admin_password}@${azurerm_postgresql_server.supply_stream.fqdn}:5432/${var.db_name}?sslmode=require"
  key_vault_id = azurerm_key_vault.supply_stream.id
}

resource "azurerm_key_vault_secret" "servicebus_connection_string" {
  name         = "servicebus-connection-string"
  value        = azurerm_servicebus_namespace.supply_stream.default_primary_connection_string
  key_vault_id = azurerm_key_vault.supply_stream.id
}

# Output values
output "kubernetes_cluster_name" {
  value = azurerm_kubernetes_cluster.supply_stream.name
}

output "acr_login_server" {
  value = azurerm_container_registry.supply_stream.login_server
}

output "application_insights_instrumentation_key" {
  value     = azurerm_application_insights.supply_stream.instrumentation_key
  sensitive = true
}

data "azurerm_client_config" "current" {}
