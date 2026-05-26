Create table Hackathon;

Use Hackathon;

-- =========================================================
-- TABLA: users
-- =========================================================

CREATE TABLE users (
    user_id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    number          INTEGER,
    password        VARCHAR(255) NOT NULL,
    rol             VARCHAR(255) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    image           VARCHAR(255),
    is_verified     BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL
);


-- =========================================================
-- TABLA: providers
-- =========================================================

CREATE TABLE providers (
    provider_id     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         INTEGER NOT NULL UNIQUE,
    description     VARCHAR(255),
    state           VARCHAR(255) DEFAULT 'activo',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,

    CONSTRAINT fk_providers_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- =========================================================
-- TABLA: provider_schedule
-- =========================================================

CREATE TABLE provider_schedule (
    provider_schedule_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    provider_id          INTEGER NOT NULL,
    day                  VARCHAR(255) NOT NULL,
    start_time           TIME NOT NULL,
    end_time             TIME NOT NULL,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at           TIMESTAMP NULL,

    CONSTRAINT fk_provider_schedule_provider
        FOREIGN KEY (provider_id)
        REFERENCES providers(provider_id)
        ON DELETE CASCADE
);


-- =========================================================
-- TABLA: locations
-- =========================================================

CREATE TABLE locations (
    location_id     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    latitude        NUMERIC(10, 7),
    longitude       NUMERIC(10, 7),
    address         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,

    CONSTRAINT fk_locations_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- =========================================================
-- TABLA: categories
-- =========================================================

CREATE TABLE categories (
    category_id     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name            VARCHAR(255) NOT NULL UNIQUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL
);


-- =========================================================
-- TABLA: services
-- =========================================================

CREATE TABLE services (
    service_id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    provider_id     INTEGER NOT NULL,
    category_id     INTEGER NOT NULL,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    price           DECIMAL(10, 2) NOT NULL,
    estimated_time  INTEGER,
    image           VARCHAR(255),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,

    CONSTRAINT fk_services_provider
        FOREIGN KEY (provider_id)
        REFERENCES providers(provider_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_services_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE RESTRICT
);


-- =========================================================
-- TABLA: reservations
-- =========================================================

CREATE TABLE reservations (
    reservation_id  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    service_id      INTEGER NOT NULL,
    description     TEXT,
    location_id     INTEGER,
    date            TIMESTAMP NOT NULL,
    state           VARCHAR(255) DEFAULT 'pendiente',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,

    CONSTRAINT fk_reservations_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reservations_service
        FOREIGN KEY (service_id)
        REFERENCES services(service_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reservations_location
        FOREIGN KEY (location_id)
        REFERENCES locations(location_id)
        ON DELETE SET NULL
);


-- =========================================================
-- TABLA: ratings
-- =========================================================

CREATE TABLE ratings (
    rating_id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reservation_id  INTEGER NOT NULL UNIQUE,
    stars           INTEGER NOT NULL,
    review          TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,

    CONSTRAINT fk_ratings_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES reservations(reservation_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_ratings_stars
        CHECK (stars >= 1 AND stars <= 5)
);


-- =========================================================
-- TABLA: reports
-- =========================================================

CREATE TABLE reports (
    report_id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    reservation_id  INTEGER NOT NULL,
    subject         VARCHAR(58) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,

    CONSTRAINT fk_reports_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reports_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES reservations(reservation_id)
        ON DELETE CASCADE
);


-- =========================================================
-- TABLA: conversations
-- =========================================================

CREATE TABLE conversations (
    conversation_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    provider_id     INTEGER NOT NULL,
    user_id         INTEGER NOT NULL,
    last_message    TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,

    CONSTRAINT fk_conversations_provider
        FOREIGN KEY (provider_id)
        REFERENCES providers(provider_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_conversations_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_conversation_provider_user
        UNIQUE (provider_id, user_id)
);


-- =========================================================
-- TABLA: messages
-- =========================================================

CREATE TABLE messages (
    message_id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    content         TEXT NOT NULL,
    user_id         INTEGER NOT NULL,
    conversation_id INTEGER NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,

    CONSTRAINT fk_messages_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_messages_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES conversations(conversation_id)
        ON DELETE CASCADE
);


-- =========================================================
-- TABLA: favorites
-- =========================================================

CREATE TABLE favorites (
    favorite_id     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    provider_id     INTEGER NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,

    CONSTRAINT fk_favorites_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_favorites_provider
        FOREIGN KEY (provider_id)
        REFERENCES providers(provider_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_favorite_user_provider
        UNIQUE (user_id, provider_id)
);


-- =========================================================
-- TABLA: notifications
-- =========================================================

CREATE TABLE notifications (
    notification_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    title           VARCHAR(255) NOT NULL,
    content         TEXT,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- =========================================================
-- TABLA: bans
-- =========================================================

CREATE TABLE bans (
    ban_id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    until_date      TIMESTAMP,
    permanent       BOOLEAN DEFAULT FALSE,
    reason          TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,

    CONSTRAINT fk_bans_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- =========================================================
-- FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- =========================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =========================================================
-- TRIGGERS updated_at
-- =========================================================

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_providers_updated_at
BEFORE UPDATE ON providers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_provider_schedule_updated_at
BEFORE UPDATE ON provider_schedule
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_locations_updated_at
BEFORE UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_reservations_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ratings_updated_at
BEFORE UPDATE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_favorites_updated_at
BEFORE UPDATE ON favorites
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_bans_updated_at
BEFORE UPDATE ON bans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- =========================================================
-- ÍNDICES
-- =========================================================

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_deleted_at
ON users(deleted_at);

CREATE INDEX idx_providers_user_id
ON providers(user_id);

CREATE INDEX idx_providers_deleted_at
ON providers(deleted_at);

CREATE INDEX idx_provider_schedule_provider_id
ON provider_schedule(provider_id);

CREATE INDEX idx_provider_schedule_deleted_at
ON provider_schedule(deleted_at);

CREATE INDEX idx_locations_user_id
ON locations(user_id);

CREATE INDEX idx_locations_deleted_at
ON locations(deleted_at);

CREATE INDEX idx_categories_deleted_at
ON categories(deleted_at);

CREATE INDEX idx_services_provider_id
ON services(provider_id);

CREATE INDEX idx_services_category_id
ON services(category_id);

CREATE INDEX idx_services_deleted_at
ON services(deleted_at);

CREATE INDEX idx_reservations_user_id
ON reservations(user_id);

CREATE INDEX idx_reservations_service_id
ON reservations(service_id);

CREATE INDEX idx_reservations_location_id
ON reservations(location_id);

CREATE INDEX idx_reservations_deleted_at
ON reservations(deleted_at);

CREATE INDEX idx_ratings_reservation_id
ON ratings(reservation_id);

CREATE INDEX idx_ratings_deleted_at
ON ratings(deleted_at);

CREATE INDEX idx_reports_user_id
ON reports(user_id);

CREATE INDEX idx_reports_reservation_id
ON reports(reservation_id);

CREATE INDEX idx_reports_deleted_at
ON reports(deleted_at);

CREATE INDEX idx_conversations_provider_id
ON conversations(provider_id);

CREATE INDEX idx_conversations_user_id
ON conversations(user_id);

CREATE INDEX idx_conversations_deleted_at
ON conversations(deleted_at);

CREATE INDEX idx_messages_user_id
ON messages(user_id);

CREATE INDEX idx_messages_conversation_id
ON messages(conversation_id);

CREATE INDEX idx_messages_deleted_at
ON messages(deleted_at);

CREATE INDEX idx_favorites_user_id
ON favorites(user_id);

CREATE INDEX idx_favorites_provider_id
ON favorites(provider_id);

CREATE INDEX idx_favorites_deleted_at
ON favorites(deleted_at);

CREATE INDEX idx_notifications_user_id
ON notifications(user_id);

CREATE INDEX idx_notifications_deleted_at
ON notifications(deleted_at);

CREATE INDEX idx_bans_user_id
ON bans(user_id);

CREATE INDEX idx_bans_deleted_at
ON bans(deleted_at);


-- =========================================================
-- PERMISOS PARA EL USUARIO user
-- Ejecutar si estás usando DB_USERNAME=user
-- =========================================================

GRANT CONNECT ON DATABASE "Hackathon" TO user;

GRANT USAGE ON SCHEMA public TO user;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO user;

GRANT USAGE, SELECT, UPDATE
ON ALL SEQUENCES IN SCHEMA public
TO user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLES TO user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT, UPDATE
ON SEQUENCES TO user;