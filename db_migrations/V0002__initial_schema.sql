CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS releases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    genre VARCHAR(100),
    release_date DATE,
    upc VARCHAR(50),
    artist_name VARCHAR(255),
    cover_url TEXT,
    status VARCHAR(50),
    streams INTEGER,
    revenue DECIMAL(10, 2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS release_tracks (
    id SERIAL PRIMARY KEY,
    release_id INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    lyrics_author VARCHAR(255),
    music_author VARCHAR(255),
    producer VARCHAR(255),
    additional_artists TEXT,
    isrc VARCHAR(50),
    has_explicit_content BOOLEAN,
    audio_file_name VARCHAR(500),
    lyrics_text TEXT,
    artist_name VARCHAR(255),
    track_order INTEGER,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS smartlinks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    release_name VARCHAR(500) NOT NULL,
    artist_name VARCHAR(255) NOT NULL,
    cover_url TEXT,
    platforms JSONB,
    archived BOOLEAN,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP
);