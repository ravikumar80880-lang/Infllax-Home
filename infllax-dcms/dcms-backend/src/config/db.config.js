// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — MySQL Database Config
// File: dcms-backend/src/config/db.config.js
// Stack: MySQL2 (as per PDF: "MySQL — Structured data")
// ═══════════════════════════════════════════════════════

const mysql = require('mysql2/promise')

// ── Connection Pool ──
let pool

async function connectDB() {
  pool = mysql.createPool({
    host:               process.env.DB_HOST     || 'localhost',
    port:               process.env.DB_PORT     || 3306,
    user:               process.env.DB_USER     || 'root',
    password:           process.env.DB_PASSWORD || '',
    database:           process.env.DB_NAME     || 'infllax_dcms',
    waitForConnections: true,
    connectionLimit:    20,
    queueLimit:         0,
    timezone:           '+05:30', // IST
  })

  // Test connection
  const conn = await pool.getConnection()
  console.log('✅ MySQL connected to:', process.env.DB_NAME || 'infllax_dcms')
  conn.release()

  // Run schema on startup
  await initSchema()
  return pool
}

function getPool() {
  if (!pool) throw new Error('DB not initialized. Call connectDB() first.')
  return pool
}

// ═══════════════════════════════════════════════════════
// MYSQL SCHEMA — DCMS Tables
// All tables needed for Theater Distribution System
// ═══════════════════════════════════════════════════════
async function initSchema() {
  const conn = await pool.getConnection()

  try {
    // 1. THEATERS TABLE
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS theaters (
        id              VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
        name            VARCHAR(255) NOT NULL,
        owner_name      VARCHAR(255) NOT NULL,
        email           VARCHAR(255) NOT NULL UNIQUE,
        phone           VARCHAR(20)  NOT NULL,
        address         TEXT         NOT NULL,
        city            VARCHAR(100) NOT NULL,
        state           VARCHAR(100) NOT NULL,
        pincode         VARCHAR(10)  NOT NULL,
        total_screens   INT          NOT NULL DEFAULT 1,
        seating_capacity INT         NOT NULL DEFAULT 100,
        status          ENUM('pending','active','suspended') DEFAULT 'pending',
        onboarded_at    TIMESTAMP    NULL,
        created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_city (city),
        INDEX idx_state (state),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 2. SCREENS TABLE (each theater can have multiple screens)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS screens (
        id          VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
        theater_id  VARCHAR(36)  NOT NULL,
        screen_name VARCHAR(100) NOT NULL,
        capacity    INT          NOT NULL DEFAULT 100,
        screen_type ENUM('standard','premium','imax') DEFAULT 'standard',
        is_active   BOOLEAN      DEFAULT TRUE,
        created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE CASCADE,
        INDEX idx_theater (theater_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 3. THEATER AUTH (JWT login for theater owners)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS theater_auth (
        id          VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
        theater_id  VARCHAR(36)  NOT NULL UNIQUE,
        password    VARCHAR(255) NOT NULL,
        last_login  TIMESTAMP    NULL,
        FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 4. ADVERTISERS TABLE
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS advertisers (
        id           VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
        company_name VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        email        VARCHAR(255) NOT NULL UNIQUE,
        phone        VARCHAR(20)  NOT NULL,
        gst_number   VARCHAR(20)  NULL,
        city         VARCHAR(100) NOT NULL,
        state        VARCHAR(100) NOT NULL,
        status       ENUM('active','suspended') DEFAULT 'active',
        created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 5. ADVERTISER AUTH
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS advertiser_auth (
        id            VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
        advertiser_id VARCHAR(36)  NOT NULL UNIQUE,
        password      VARCHAR(255) NOT NULL,
        last_login    TIMESTAMP    NULL,
        FOREIGN KEY (advertiser_id) REFERENCES advertisers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 6. AD CAMPAIGNS
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id              VARCHAR(36)   PRIMARY KEY DEFAULT (UUID()),
        advertiser_id   VARCHAR(36)   NOT NULL,
        name            VARCHAR(255)  NOT NULL,
        description     TEXT          NULL,
        video_url       VARCHAR(500)  NOT NULL,
        thumbnail_url   VARCHAR(500)  NULL,
        duration_sec    INT           NOT NULL DEFAULT 30,
        format          ENUM('pre_show','interval','lobby') DEFAULT 'pre_show',
        target_cities   JSON          NULL,
        target_states   JSON          NULL,
        budget_total    DECIMAL(12,2) NOT NULL,
        budget_daily    DECIMAL(12,2) NULL,
        spent_amount    DECIMAL(12,2) DEFAULT 0,
        start_date      DATE          NOT NULL,
        end_date        DATE          NOT NULL,
        status          ENUM('draft','pending_payment','active','paused','completed','rejected') DEFAULT 'draft',
        payment_id      VARCHAR(100)  NULL,
        impressions     BIGINT        DEFAULT 0,
        plays_completed BIGINT        DEFAULT 0,
        created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (advertiser_id) REFERENCES advertisers(id),
        INDEX idx_advertiser (advertiser_id),
        INDEX idx_status (status),
        INDEX idx_dates (start_date, end_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 7. CAMPAIGN → THEATER MAPPING
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS campaign_theaters (
        id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        campaign_id VARCHAR(36) NOT NULL,
        theater_id  VARCHAR(36) NOT NULL,
        screen_id   VARCHAR(36) NULL,
        is_active   BOOLEAN     DEFAULT TRUE,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
        FOREIGN KEY (theater_id)  REFERENCES theaters(id),
        UNIQUE KEY uniq_camp_theater (campaign_id, theater_id),
        INDEX idx_campaign (campaign_id),
        INDEX idx_theater  (theater_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 8. AD SCHEDULES (playlist per theater per day)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS ad_schedules (
        id            VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        campaign_id   VARCHAR(36) NOT NULL,
        theater_id    VARCHAR(36) NOT NULL,
        screen_id     VARCHAR(36) NULL,
        scheduled_date DATE        NOT NULL,
        time_slot     TIME        NOT NULL,
        show_type     ENUM('morning','afternoon','evening','night') DEFAULT 'evening',
        status        ENUM('scheduled','played','missed','skipped') DEFAULT 'scheduled',
        played_at     TIMESTAMP   NULL,
        created_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
        FOREIGN KEY (theater_id)  REFERENCES theaters(id),
        INDEX idx_theater_date (theater_id, scheduled_date),
        INDEX idx_campaign (campaign_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 9. PLAYBACK LOGS (proof of play — from Electron app)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS playback_logs (
        id            VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
        schedule_id   VARCHAR(36)  NOT NULL,
        campaign_id   VARCHAR(36)  NOT NULL,
        theater_id    VARCHAR(36)  NOT NULL,
        screen_id     VARCHAR(36)  NULL,
        played_at     TIMESTAMP    NOT NULL,
        duration_sec  INT          NOT NULL,
        completed     BOOLEAN      DEFAULT TRUE,
        device_info   JSON         NULL,
        created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
        FOREIGN KEY (theater_id)  REFERENCES theaters(id),
        INDEX idx_campaign (campaign_id),
        INDEX idx_theater  (theater_id),
        INDEX idx_played_at (played_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 10. THEATER HEARTBEATS (online status — every 60 sec from Electron)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS theater_heartbeats (
        id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        theater_id  VARCHAR(36) NOT NULL,
        status      ENUM('online','offline') DEFAULT 'online',
        ip_address  VARCHAR(45) NULL,
        app_version VARCHAR(20) NULL,
        recorded_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (theater_id) REFERENCES theaters(id),
        INDEX idx_theater (theater_id),
        INDEX idx_time    (recorded_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 11. REVENUE & PAYOUTS (theater earnings from ads)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS theater_revenue (
        id              VARCHAR(36)   PRIMARY KEY DEFAULT (UUID()),
        theater_id      VARCHAR(36)   NOT NULL,
        campaign_id     VARCHAR(36)   NOT NULL,
        plays_count     INT           NOT NULL DEFAULT 0,
        gross_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
        platform_cut    DECIMAL(12,2) NOT NULL DEFAULT 0,
        net_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
        period_start    DATE          NOT NULL,
        period_end      DATE          NOT NULL,
        payout_status   ENUM('pending','processing','paid') DEFAULT 'pending',
        payout_date     TIMESTAMP     NULL,
        created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (theater_id)  REFERENCES theaters(id),
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
        INDEX idx_theater (theater_id),
        INDEX idx_payout  (payout_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 12. PAYMENTS (Razorpay — advertiser campaign payments)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id                  VARCHAR(36)   PRIMARY KEY DEFAULT (UUID()),
        advertiser_id       VARCHAR(36)   NOT NULL,
        campaign_id         VARCHAR(36)   NULL,
        razorpay_order_id   VARCHAR(100)  NOT NULL,
        razorpay_payment_id VARCHAR(100)  NULL,
        amount              DECIMAL(12,2) NOT NULL,
        currency            VARCHAR(10)   DEFAULT 'INR',
        status              ENUM('created','paid','failed','refunded') DEFAULT 'created',
        gst_amount          DECIMAL(12,2) DEFAULT 0,
        invoice_url         VARCHAR(500)  NULL,
        paid_at             TIMESTAMP     NULL,
        created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (advertiser_id) REFERENCES advertisers(id),
        INDEX idx_advertiser (advertiser_id),
        INDEX idx_razorpay   (razorpay_order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 13. SUPPORT TICKETS (theater owner support)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id          VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
        theater_id  VARCHAR(36)  NOT NULL,
        subject     VARCHAR(255) NOT NULL,
        message     TEXT         NOT NULL,
        status      ENUM('open','in_progress','resolved') DEFAULT 'open',
        priority    ENUM('low','medium','high') DEFAULT 'medium',
        created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (theater_id) REFERENCES theaters(id),
        INDEX idx_theater (theater_id),
        INDEX idx_status  (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    console.log('✅ DCMS MySQL Schema initialized — all 13 tables ready')

  } catch (err) {
    console.error('❌ Schema init error:', err.message)
    throw err
  } finally {
    conn.release()
  }
}

module.exports = { connectDB, getPool }
