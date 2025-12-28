# Couple Moments - Project TODO

## Supabase Setup
- [x] Configure Supabase project and get credentials
- [x] Set up PostgreSQL tables in Supabase (SQL script created)
- [x] Configure Supabase Storage buckets for photos
- [x] Set up Row Level Security (RLS) policies (SQL script)
- [x] Create Supabase Auth integration

## Database & Schema
- [x] Design and implement couples table with relationship start date
- [x] Create photos table with Supabase Storage integration
- [x] Create youtube_videos table for storing YouTube links
- [x] Create romantic_phrases table with categories
- [x] Add indexes for efficient queries

## Authentication & Couples System
- [x] Integrate Supabase Auth with Manus OAuth
- [ ] Create couple pairing mechanism (invite system or manual pairing)
- [x] Implement couple profile management
- [x] Add relationship start date storage and validation
- [x] Create couple-specific data access controls (RLS)
- [x] Implement logout and session management

## Dashboard & Relationship Timer
- [x] Build main dashboard layout
- [x] Implement relationship timer component (countdown from start date)
- [x] Display couple's name and relationship info
- [ ] Create dashboard statistics (photos count, videos count, etc)
- [x] Add navigation to other features from dashboard

## Photo Gallery
- [ ] Create photo upload component with Supabase Storage integration
- [x] Build photo gallery grid view
- [x] Implement photo deletion functionality
- [x] Add photo metadata storage (upload date, description)
- [x] Create responsive gallery layout

## YouTube Integration
- [x] Create YouTube video input component (URL parsing)
- [x] Build video gallery/playlist view
- [x] Implement video deletion functionality
- [x] Add video metadata storage (title, description, added date)
- [x] Create embedded video player

## Romantic Phrases System
- [x] Create database seed with romantic phrases and categories
- [x] Build phrases display component
- [x] Implement category filtering
- [x] Create random phrase of the day feature
- [x] Add phrase sharing/copying functionality

## Design & Styling
- [ ] Choose elegant color palette (romantic theme)
- [ ] Implement custom fonts and typography
- [ ] Create consistent spacing and layout system
- [ ] Add smooth animations and transitions
- [ ] Ensure responsive design for mobile/tablet/desktop
- [ ] Add dark/light theme support

## Testing
- [ ] Write vitest tests for couple management
- [ ] Write vitest tests for photo operations
- [ ] Write vitest tests for YouTube video operations
- [ ] Write vitest tests for phrase retrieval
- [ ] Test authentication flow

## Deployment & Polish
- [ ] Final UI review and polish
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Create checkpoint for deployment
