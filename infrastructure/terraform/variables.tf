variable "prefix" {
  description = "Prefix for all resources"
  default     = "supplystream"
}

variable "resource_group_name" {
  description = "Name of the resource group"
  default     = "supply-stream-rg"
}

variable "location" {
  description = "Azure region"
  default     = "East US"
}

variable "db_admin_username" {
  description = "Database admin username"
  sensitive   = true
}

variable "db_admin_password" {
  description = "Database admin password"
  sensitive   = true
}

variable "db_name" {
  description = "Database name"
  default     = "supplystream"
}
