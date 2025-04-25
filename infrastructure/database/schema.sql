-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_registration VARCHAR(100),
    tax_id VARCHAR(100),
    address JSONB NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    industry_codes VARCHAR[] NOT NULL,
    company_size VARCHAR(50),
    years_in_business VARCHAR(50),
    logo_url VARCHAR(255),
    website_url VARCHAR(255),
    social_links JSONB,
    payment_terms VARCHAR(50),
    supported_currencies VARCHAR[],
    credit_rating VARCHAR(50),
    certifications VARCHAR[],
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(100),
    phone VARCHAR(50),
    timezone VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    permissions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Branches table
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    address JSONB NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    tier VARCHAR(50) NOT NULL,
    seats_limit INTEGER NOT NULL,
    branches_limit INTEGER NOT NULL,
    bid_credits_limit INTEGER NOT NULL,
    bid_credits_used INTEGER DEFAULT 0,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    stripe_subscription_id VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Requests table
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES organizations(id),
    branch_id UUID REFERENCES branches(id),
    requisition_number VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requestor_id UUID REFERENCES users(id),
    delivery_address JSONB NOT NULL,
    delivery_latitude FLOAT,
    delivery_longitude FLOAT,
    total_budget DECIMAL(15,2) NOT NULL,
    cost_center VARCHAR(100),
    urgency VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    desired_delivery_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Items table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_of_measure VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    budget DECIMAL(15,2) NOT NULL,
    manufacturer VARCHAR(100),
    part_number VARCHAR(100),
    lead_time INTEGER,
    dimensions JSONB,
    supplier_can_attach BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bids table
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id),
    supplier_id UUID REFERENCES organizations(id),
    branch_id UUID REFERENCES branches(id),
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Item Bids table
CREATE TABLE item_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_id UUID REFERENCES bids(id),
    item_id UUID REFERENCES items(id),
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    quantity INTEGER NOT NULL,
    notes TEXT,
    attachment_ids UUID[],
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_id UUID REFERENCES bids(id),
    client_id UUID REFERENCES organizations(id),
    supplier_id UUID REFERENCES organizations(id),
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    amount DECIMAL(15,2) NOT NULL,
    commission_amount DECIMAL(15,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    stripe_invoice_id VARCHAR(100),
    payment_status VARCHAR(20) NOT NULL,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id),
    item_id UUID REFERENCES items(id),
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    attachment_ids UUID[],
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Attachments table
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    storage_path VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_branches_organization_id ON branches(organization_id);
CREATE INDEX idx_requests_client_id ON requests(client_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_items_request_id ON items(request_id);
CREATE INDEX idx_bids_request_id ON bids(request_id);
CREATE INDEX idx_bids_supplier_id ON bids(supplier_id);
CREATE INDEX idx_item_bids_bid_id ON item_bids(bid_id);
CREATE INDEX idx_item_bids_item_id ON item_bids(item_id);
CREATE INDEX idx_messages_request_id ON messages(request_id);
CREATE INDEX idx_messages_item_id ON messages(item_id);
