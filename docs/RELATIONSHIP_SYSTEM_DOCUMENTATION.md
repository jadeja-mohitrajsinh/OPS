# OPS Relationship System Documentation

## Overview
This document describes the comprehensive relationship system added to the GSoC Tracker (OPS) application, enabling full interconnectivity between all entities. When learning one thing that is related to another, you can now log these connections to create a complete knowledge graph.

## Summary of Changes

### 1. Model Updates (Backend)

All models have been enhanced with comprehensive relationship fields to support cross-entity linking:

#### GSoCSkill Model (`models/GSoCSkill.js`)
- Added `relatedSkills` - Array of ObjectId references to other skills
- Added `relatedProjects` - Array of ObjectId references to projects
- Added `relatedExperiments` - Array of ObjectId references to experiments
- Added `relatedContributions` - Array of ObjectId references to contributions
- Added `relatedCommunityInteractions` - Array of ObjectId references to community interactions
- Added `relatedDatasets` - Array of ObjectId references to datasets
- Added `dueDate` - Date field for deadline tracking
- **Added text index** on `{ name: 'text', category: 'text' }` for efficient search

#### GSoCProject Model (`models/GSoCProject.js`)
- Added `relatedSkills` - Array of ObjectId references to skills
- Added `relatedProjects` - Array of ObjectId references to other projects
- Added `relatedContributions` - Array of ObjectId references to contributions
- Added `relatedCommunityInteractions` - Array of ObjectId references to community interactions
- Added `relatedDatasets` - Array of ObjectId references to datasets
- Added `dueDate` - Date field for deadline tracking
- **Added text index** on `{ name: 'text', problem: 'text', domain: 'text' }` for efficient search

#### GSoCExperiment Model (`models/GSoCExperiment.js`)
- Added `relatedSkills` - Array of ObjectId references to skills
- Added `relatedProjects` - Array of ObjectId references to projects
- Added `relatedExperiments` - Array of ObjectId references to other experiments
- Added `relatedContributions` - Array of ObjectId references to contributions
- Added `relatedCommunityInteractions` - Array of ObjectId references to community interactions
- Added `relatedDatasets` - Array of ObjectId references to datasets
- Added `dueDate` - Date field for deadline tracking
- **Added text index** on `{ experimentId: 'text', hypothesis: 'text', model: 'text' }` for efficient search

#### GSoCCommunityInteraction Model (`models/GSoCCommunityInteraction.js`)
- Added `relatedSkills` - Array of ObjectId references to skills
- Added `relatedProjects` - Array of ObjectId references to projects
- Added `relatedExperiments` - Array of ObjectId references to experiments
- Added `relatedContributions` - Array of ObjectId references to contributions
- Added `relatedCommunityInteractions` - Array of ObjectId references to other community interactions
- Added `relatedDatasets` - Array of ObjectId references to datasets
- Added `dueDate` - Date field for deadline tracking
- **Added text index** on `{ topic: 'text', organization: 'text', platform: 'text' }` for efficient search

#### GSoCDataset Model (`models/GSoCDataset.js`)
- Added `relatedSkills` - Array of ObjectId references to skills
- Added `relatedProjects` - Array of ObjectId references to projects
- Added `relatedExperiments` - Array of ObjectId references to experiments
- Added `relatedContributions` - Array of ObjectId references to contributions
- Added `relatedCommunityInteractions` - Array of ObjectId references to community interactions
- Added `relatedDatasets` - Array of ObjectId references to other datasets
- Added `dueDate` - Date field for deadline tracking
- **Added text index** on `{ name: 'text', description: 'text', domain: 'text' }` for efficient search

#### GSoCContribution Model (`models/GSoCContribution.js`)
- Added `relatedSkills` - Array of ObjectId references to skills
- Added `relatedProjects` - Array of ObjectId references to projects
- Added `relatedExperiments` - Array of ObjectId references to experiments
- Added `relatedContributions` - Array of ObjectId references to other contributions
- Added `relatedCommunityInteractions` - Array of ObjectId references to community interactions
- Added `relatedDatasets` - Array of ObjectId references to datasets
- Already had `deadline` field for deadline tracking
- **Added text index** on `{ title: 'text', description: 'text', type: 'text' }` for efficient search

### 2. EntitySearchPicker Component (`components/EntitySearchPicker.jsx`)

Created a comprehensive searchable multi-select dropdown component for selecting related entities:

**Features:**
- Real-time search with 300ms debounce for performance
- Entity type badges with color coding (Skill=blue, Project=green, Experiment=purple, Contribution=orange, Community=yellow, Dataset=red)
- Evidence level indicators (None → Excellent with color coding)
- Automatic entity loading by ID when editing
- Click-outside to close functionality
- Exclusion of current entity ID to prevent self-referencing
- Multi-select support with visual chips for selected entities
- Hover effects and keyboard-friendly dropdown

**Props:**
- `label`: Label for the field
- `value`: Array of selected entity IDs
- `onChange`: Callback function receiving array of IDs
- `allowedTypes`: Array of entity types to search (e.g., ['SKILL', 'PROJECT'])
- `placeholder`: Placeholder text for search input
- `excludeIds`: Array of IDs to exclude from search results

### 3. API Route Updates

All GET endpoints updated to support `?search=` query parameter for entity search:

#### Skills API (`app/api/gsoc/skills/route.js`)
- Added search support on `name` and `category` fields
- Query: `/api/gsoc/skills?search=pytorch`

#### Projects API (`app/api/gsoc/projects/route.js`)
- Added search support on `name`, `problem`, and `domain` fields
- Query: `/api/gsoc/projects?search=computer`

#### Experiments API (`app/api/gsoc/experiments/route.js`)
- Added search support on `experimentId`, `hypothesis`, and `model` fields
- Query: `/api/gsoc/experiments?search=transformer`

#### Community API (`app/api/gsoc/community/route.js`)
- Added search support on `topic` and `platform` fields
- Query: `/api/gsoc/community?search=github`

#### Datasets API (`app/api/gsoc/datasets/route.js`)
- Added search support on `name`, `description`, and `domain` fields
- Query: `/api/gsoc/datasets?search=vision`

### 4. Frontend Page Updates

All entity pages have been updated to use EntitySearchPicker for relationship selection:

#### Skills Page (`app/gsoc/skills/page.js`)
- Imported EntitySearchPicker component
- Changed relationship fields in formData state from strings to arrays
- Updated handleSubmit to pass arrays directly (no comma-splitting)
- Updated handleEdit to use arrays directly from backend
- Updated form reset to use empty arrays
- Replaced 6 comma-separated input fields with EntitySearchPicker components
- Added due date display on skill cards with red highlighting for overdue items
- Added due date input in the form

#### Projects Page (`app/gsoc/projects/page.js`)
- Imported EntitySearchPicker component
- Changed relationship fields in formData state from strings to arrays
- Updated handleSubmit to pass arrays directly
- Updated handleEdit to use arrays directly from backend
- Updated form reset to use empty arrays
- Replaced 6 comma-separated input fields with EntitySearchPicker components
- Added start date, end date, and due date inputs
- Added due date display on project cards with red highlighting for overdue items

#### Experiments Page (`app/gsoc/experiments/page.js`)
- Imported EntitySearchPicker component
- Changed relationship fields in formData state from strings to arrays
- Updated handleSubmit to pass arrays directly
- Updated handleEdit to use arrays directly from backend
- Updated form reset to use empty arrays
- Replaced 6 comma-separated input fields with EntitySearchPicker components
- Added start date, end date, and due date inputs
- Added due date display on experiment cards with red highlighting for overdue items

#### Community Page (`app/gsoc/community/page.js`)
- Imported EntitySearchPicker component
- Changed relationship fields in formData state from strings to arrays
- Updated handleSubmit to pass arrays directly
- Updated handleEdit to use arrays directly from backend
- Updated form reset to use empty arrays
- Replaced 6 comma-separated input fields with EntitySearchPicker components
- Added date and due date inputs
- Added due date display on interaction cards with red highlighting for overdue items

#### Datasets Page (`app/gsoc/datasets/page.js`)
- Imported EntitySearchPicker component
- Changed relationship fields in formData state from strings to arrays
- Updated handleSubmit to pass arrays directly
- Updated handleEdit to use arrays directly from backend
- Updated form reset to use empty arrays
- Replaced 6 comma-separated input fields with EntitySearchPicker components
- Added due date input
- Added due date display on dataset cards with red highlighting for overdue items

### 5. Due Date Feature

All entities now support due date tracking:
- **Storage**: Date field in MongoDB schema
- **Display**: Shown on entity cards with formatted date (e.g., "Due: 9/26/2026")
- **Overdue Highlighting**: Due dates past the current date are displayed in red
- **Input**: Date picker in all add/edit forms

## Usage Guide

### Adding Relationships

When creating or editing any entity (skill, project, experiment, etc.):

1. Navigate to the entity's page (e.g., `/gsoc/skills`)
2. Click "Add [Entity]" or "Update" on an existing card
3. In the form, scroll to the relationship fields (e.g., "Related Skills", "Related Projects")
4. Click in the search input and start typing tosearch for entities
5. Select entities from the dropdown results by clicking on them
6. Selected entities appear as chips with type badges and evidence level indicators
7. Remove entities by clicking the ✕ button on the chip
8. Save the entity

**Key Features:**
- Real-time search as you type (minimum 2 characters)
- Entity type badges help identify what you're selecting
- Evidence level indicators show the quality of evidence for each entity
- Self-referencing is automatically prevented (can't link an entity to itself)
- Multi-select allows adding multiple entities at once

### Relationship Examples

- **Skill → Projects**: Link a skill (e.g., "PyTorch") to projects that use it
- **Project → Experiments**: Link a project to its experiments
- **Experiment → Datasets**: Link an experiment to the datasets used
- **Community Interaction → Skills**: Link a discussion to skills learned from it
- **Contribution → Projects**: Link a contribution to the project it belongs to

### Due Date Management

1. When creating/editing an entity, use the date picker to set a due date
2. The due date will be displayed on the entity card
3. Overdue items are highlighted in red for easy identification
4. Due dates can be updated at any time

## Technical Implementation Details

### Data Storage
- Relationship fields are stored as arrays of ObjectId references
- This enables efficient querying and population via Mongoose
- Relationships are bidirectional - you can link A to B and B to A
- Text indexes on key fields enable efficient full-text search

### Search Implementation
- Mongoose text indexes on relevant fields for each entity type
- API routes support `?search=` query parameter with regex-based filtering
- 300ms debounce on frontend search to reduce API calls
- Search is case-insensitive and matches any of the indexed fields

### Form Handling
- Frontend uses arrays of ObjectIds directly (no string conversion)
- EntitySearchPicker component handles search and selection
- Automatic entity loading by ID when editing existing entities
- Selected entities displayed as visual chips with metadata

### Date Handling
- Dates are stored as Date objects in MongoDB
- Frontend uses ISO date format (YYYY-MM-DD) for inputs
- Display uses locale-specific formatting (e.g., "9/26/2026")
- Overdue check compares due date with current date

## Benefits

1. **Complete Knowledge Graph**: All learning activities can be interconnected
2. **Traceability**: Track how skills relate to projects, experiments, and contributions
3. **Deadline Management**: Track and visualize due dates across all entities
4. **Flexible Linking**: Any entity can be linked to any other entity type
5. **Scalability**: Relationship system can be extended with additional entity types
6. **Improved UX**: Searchable dropdowns eliminate the need to remember ObjectIds
7. **Visual Feedback**: Entity type badges and evidence indicators provide context at a glance
8. **Efficient Search**: Text indexes enable fast full-text search across all entities

## Future Enhancements

Potential improvements for the relationship system:

1. **Visual Relationship Graph**: Display relationships as a visual graph
2. ~~**Smart Dropdowns**: Replace comma-separated inputs with searchable dropdowns~~ (COMPLETED)
3. **Reverse Relationship Display**: Show which entities link to the current entity
4. **Relationship Types**: Add relationship types (e.g., "depends on", "builds on", "uses")
5. **Bulk Import/Export**: Import/export relationships in bulk
6. **Relationship Analytics**: Analyze connection patterns and learning paths

## Files Modified

### Models
- `models/GSoCSkill.js` - Added relationship fields and text index
- `models/GSoCProject.js` - Added relationship fields and text index
- `models/GSoCExperiment.js` - Added relationship fields and text index
- `models/GSoCCommunityInteraction.js` - Added relationship fields and text index
- `models/GSoCDataset.js` - Added relationship fields and text index
- `models/GSoCContribution.js` - Added relationship fields and text index

### Components
- `components/EntitySearchPicker.jsx` - NEW: Searchable multi-select dropdown component

### API Routes
- `app/api/gsoc/skills/route.js` - Added search parameter support
- `app/api/gsoc/projects/route.js` - Added search parameter support
- `app/api/gsoc/experiments/route.js` - Added search parameter support
- `app/api/gsoc/community/route.js` - Added search parameter support
- `app/api/gsoc/datasets/route.js` - Added search parameter support

### Frontend Pages
- `app/gsoc/skills/page.js` - Integrated EntitySearchPicker, updated data handling
- `app/gsoc/projects/page.js` - Integrated EntitySearchPicker, updated data handling
- `app/gsoc/experiments/page.js` - Integrated EntitySearchPicker, updated data handling
- `app/gsoc/community/page.js` - Integrated EntitySearchPicker, updated data handling
- `app/gsoc/datasets/page.js` - Integrated EntitySearchPicker, updated data handling

## Conclusion

The OPS relationship system now provides a fully interconnected knowledge graph where every entity can be linked to any other entity. This enables comprehensive tracking of learning activities, their relationships, and deadlines, creating a powerful tool for managing GSoC preparation and tracking progress across all dimensions.
