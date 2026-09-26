# OPS - GSoC Acceptance Tracker System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Models](#data-models)
4. [Frontend Pages](#frontend-pages)
5. [API Routes](#api-routes)
6. [Features](#features)
7. [Setup and Deployment](#setup-and-deployment)
8. [Usage Guide](#usage-guide)

## Overview

OPS (Operations) is a comprehensive GSoC (Google Summer of Code) Acceptance Tracker application designed to help candidates track their progress, manage evidence, and demonstrate readiness for GSoC participation. The system provides a complete knowledge graph where all learning activities, contributions, projects, experiments, and community interactions can be interconnected.

### Key Capabilities
- **Evidence-Based Tracking**: Track skills, projects, experiments, and contributions with evidence levels
- **Timeline Gates**: Manage progress through defined timeline gates (L1-L5)
- **Relationship System**: Full interconnectivity between all entities
- **Deadline Management**: Track due dates with overdue highlighting
- **Quality Checklists**: Ensure completeness of work through quality checklists
- **Community Engagement**: Track community interactions and learning from discussions

## Architecture

### Technology Stack
- **Frontend**: Next.js (React) with App Router
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Custom CSS with CSS variables
- **Mobile Support**: Capacitor for Android APK builds

### Project Structure
```
OPS/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   └── gsoc/            # GSoC-specific endpoints
│   ├── gsoc/                # GSoC pages
│   ├── books/               # Books tracking
│   ├── calendar/            # Calendar view
│   ├── college/             # College subjects
│   └── ...
├── components/              # Reusable React components
├── lib/                     # Utility libraries
├── models/                  # Mongoose schemas
├── public/                  # Static assets
├── android/                 # Android build configuration
├── scripts/                 # Build and deployment scripts
└── docs/                    # Documentation
```

## Data Models

### GSoCSkill
Tracks technical skills with evidence levels and learning progress.

**Fields:**
- `name` (String, required) - Skill name (e.g., "Python", "PyTorch")
- `category` (Enum) - PROGRAMMING, ML_FRAMEWORK, MATH, LIBRARY, TOOL, DOMAIN
- `evidenceLevel` (Object) - Evidence tracking with level, evidence, URL, date achieved
- `timelineGates` (Array) - Timeline gate progress tracking
- `currentGate` (Enum) - Current timeline gate (L1-L5)
- `relatedSkills` (Array[ObjectId]) - Links to other skills
- `relatedProjects` (Array[ObjectId]) - Links to projects
- `relatedExperiments` (Array[ObjectId]) - Links to experiments
- `relatedContributions` (Array[ObjectId]) - Links to contributions
- `relatedCommunityInteractions` (Array[ObjectId]) - Links to community interactions
- `relatedDatasets` (Array[ObjectId]) - Links to datasets
- `priority` (Enum) - P0, P1, P2, P3
- `targetLevel` (Enum) - Target evidence level
- `dueDate` (Date) - Deadline for skill acquisition
- `notes` (String) - Additional notes
- `learningResources` (Array[String]) - Learning resource URLs
- `practiceTasks` (Array[String]) - Practice task descriptions

### GSoCProject
Tracks ML/AI projects with quality checklists and milestones.

**Fields:**
- `name` (String, required) - Project name
- `problem` (String) - Problem statement
- `domain` (Enum) - ML domain (MACHINE_LEARNING, DEEP_LEARNING, NLP, etc.)
- `dataset` (String) - Dataset used
- `model` (String) - Model/technique used
- `framework` (String) - Framework (PyTorch, TensorFlow, etc.)
- `repository` (String) - GitHub repository URL
- `demo` (String) - Demo URL
- `huggingFace` (String) - Hugging Face URL
- `kaggle` (String) - Kaggle URL
- `status` (Enum) - IDEA, RESEARCH, DEVELOPMENT, TESTING, COMPLETED, DEPLOYED, ARCHIVED
- `startDate` (Date) - Project start date
- `endDate` (Date) - Project end date
- `dueDate` (Date) - Project deadline
- `milestones` (Array) - Project milestones
- `qualityChecklist` (Object) - Quality checklist items
- `timelineGates` (Array) - Timeline gate progress
- `currentGate` (Enum) - Current timeline gate
- `evidenceLevel` (Enum) - Evidence level achieved
- `relatedSkills` (Array[ObjectId]) - Skills used/developed
- `relatedProjects` (Array[ObjectId]) - Related projects
- `experiments` (Array[ObjectId]) - Experiments in this project
- `relatedContributions` (Array[ObjectId]) - Related contributions
- `relatedCommunityInteractions` (Array[ObjectId]) - Related discussions
- `relatedDatasets` (Array[ObjectId]) - Datasets used
- `complexity` (Enum) - BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
- `targetOrganization` (ObjectId) - Target GSoC organization
- `notes` (String) - Additional notes

### GSoCExperiment
Tracks ML experiments with parameters, results, and comparisons.

**Fields:**
- `experimentId` (String) - Unique experiment identifier
- `project` (ObjectId) - Parent project
- `hypothesis` (String) - Experiment hypothesis
- `dataset` (String) - Dataset used
- `model` (String) - Model used
- `parameters` (Object) - Experiment parameters (JSON)
- `training` (Object) - Training configuration (epochs, batch size, learning rate, optimizer, loss function)
- `evaluation` (Object) - Evaluation metrics and scores
- `results` (String) - Results description
- `comparison` (String) - Comparison with baseline
- `failure` (String) - Failure analysis (if applicable)
- `conclusion` (String) - What was learned
- `gitCommit` (String) - Git commit hash
- `notebook` (String) - Jupyter notebook URL
- `status` (Enum) - PLANNED, RUNNING, COMPLETED, FAILED
- `startDate` (Date) - Experiment start date
- `endDate` (Date) - Experiment end date
- `dueDate` (Date) - Experiment deadline
- `timelineGates` (Array) - Timeline gate progress
- `currentGate` (Enum) - Current timeline gate
- `evidenceLevel` (Enum) - Evidence level achieved
- `relatedSkills` (Array[ObjectId]) - Skills used
- `relatedProjects` (Array[ObjectId]) - Related projects
- `relatedExperiments` (Array[ObjectId]) - Related experiments
- `relatedContributions` (Array[ObjectId]) - Related contributions
- `relatedCommunityInteractions` (Array[ObjectId]) - Related discussions
- `relatedDatasets` (Array[ObjectId]) - Datasets used
- `notes` (String) - Additional notes

### GSoCCommunityInteraction
Tracks community engagement and learning from discussions.

**Fields:**
- `organization` (ObjectId) - Organization
- `platform` (Enum) - GITHUB, DISCORD, SLACK, EMAIL, FORUM, OTHER
- `date` (Date) - Interaction date
- `dueDate` (Date) - Follow-up deadline
- `personOrRole` (String) - Person contacted or role
- `topic` (String, required) - Discussion topic
- `question` (String) - Question asked
- `response` (String) - Response received
- `outcome` (String) - Outcome of interaction
- `relatedProject` (ObjectId) - Related project
- `relatedProjectIdea` (ObjectId) - Related project idea
- `relatedSkills` (Array[ObjectId]) - Skills learned
- `relatedProjects` (Array[ObjectId]) - Related projects
- `relatedExperiments` (Array[ObjectId]) - Related experiments
- `relatedContributions` (Array[ObjectId]) - Related contributions
- `relatedCommunityInteractions` (Array[ObjectId]) - Related interactions
- `relatedDatasets` (Array[ObjectId]) - Related datasets
- `timelineGates` (Array) - Timeline gate progress
- `currentGate` (Enum) - Current timeline gate
- `evidenceLevel` (Enum) - Evidence level achieved
- `url` (String) - Discussion URL
- `notes` (String) - Additional notes

### GSoCDataset
Tracks datasets with quality checklists and preprocessing steps.

**Fields:**
- `name` (String, required) - Dataset name
- `description` (String) - Dataset description
- `domain` (Enum) - TABULAR, IMAGE, TEXT, AUDIO, VIDEO, TIME_SERIES, GRAPH
- `source` (String) - Dataset source
- `url` (String) - Source URL
- `huggingFaceUrl` (String) - Hugging Face URL
- `kaggleUrl` (String) - Kaggle URL
- `size` (Object) - Dataset size (samples, features, sizeMB)
- `format` (String) - Data format (CSV, JSON, etc.)
- `license` (String) - Dataset license
- `tasks` (Array[String]) - Tasks supported (classification, detection, etc.)
- `relatedSkills` (Array[ObjectId]) - Skills needed
- `relatedProjects` (Array[ObjectId]) - Projects using this dataset
- `relatedExperiments` (Array[ObjectId]) - Experiments using this dataset
- `relatedContributions` (Array[ObjectId]) - Related contributions
- `relatedCommunityInteractions` (Array[ObjectId]) - Related discussions
- `relatedDatasets` (Array[ObjectId]) - Related datasets
- `documentation` (String) - Dataset documentation
- `preprocessing` (String) - Preprocessing steps
- `status` (Enum) - DISCOVERED, DOWNLOADED, EXPLORED, CLEANED, PREPROCESSED, VALIDATED, READY
- `dueDate` (Date) - Dataset readiness deadline
- `qualityChecklist` (Object) - Quality checklist items
- `notes` (String) - Additional notes

### GSoCContribution
Tracks open source contributions to projects.

**Fields:**
- `organization` (ObjectId) - Organization
- `repository` (String) - Repository name
- `type` (Enum) - BUG_FIX, FEATURE, DOCUMENTATION, REFACTORING, TEST, OTHER
- `title` (String, required) - Contribution title
- `description` (String) - Contribution description
- `date` (Date) - Contribution date
- `deadline` (Date) - Contribution deadline
- `status` (Enum) - INVESTIGATING, DISCUSSING, WORKING, PR_OPEN, CHANGES_REQUESTED, APPROVED, MERGED, CLOSED
- `prUrl` (String) - Pull request URL
- `commitUrl` (String) - Commit URL
- `reviewStatus` (Enum) - PENDING, APPROVED, REJECTED, NO_REVIEW
- `result` (Enum) - SUCCESS, PARTIAL, FAILED, ABANDONED
- `whatILearned` (String) - Learning from contribution
- `relatedSkill` (ObjectId) - Primary related skill
- `relatedProject` (ObjectId) - Related project
- `relatedSkills` (Array[ObjectId]) - Related skills
- `relatedProjects` (Array[ObjectId]) - Related projects
- `relatedExperiments` (Array[ObjectId]) - Related experiments
- `relatedContributions` (Array[ObjectId]) - Related contributions
- `relatedCommunityInteractions` (Array[ObjectId]) - Related discussions
- `relatedDatasets` (Array[ObjectId]) - Related datasets
- `timelineGates` (Array) - Timeline gate progress
- `currentGate` (Enum) - Current timeline gate
- `evidenceLevel` (Enum) - Evidence level achieved
- `notes` (String) - Additional notes

## Frontend Pages

### GSoC Dashboard (`/gsoc`)
Main dashboard with navigation to all GSoC tracking pages.

**Features:**
- Quick stats overview
- Navigation to all tracking pages
- Recent activity summary

### Skills Page (`/gsoc/skills`)
Manages technical skills with evidence tracking.

**Page Layout:**
- **Header**: Page title with "Add Skill" button
- **Filter Bar**: Category filter tabs (ALL, PROGRAMMING, ML_FRAMEWORK, MATH, LIBRARY, TOOL, DOMAIN) with count badges
- **Skills Grid**: Card-based display of all skills

**Skill Card Display:**
- Skill name and category badge
- Current evidence level with color-coded badge
- Target level indicator
- Priority badge (P0-P3)
- Current timeline gate (L1-L5)
- Due date with red highlighting if overdue
- Evidence URL link (if provided)
- Notes preview (truncated)
- Action buttons: Update, Delete

**Add/Edit Form (Modal):**
- **Basic Info**:
  - Name (text input, required)
  - Category (dropdown: PROGRAMMING, ML_FRAMEWORK, MATH, LIBRARY, TOOL, DOMAIN)
  - Priority (dropdown: P0, P1, P2, P3)
  - Target Level (dropdown: NONE, WEAK, BASIC, GOOD, STRONG, EXCELLENT)
- **Evidence Tracking**:
  - Current Evidence Level (dropdown)
  - Evidence Description (textarea)
  - Evidence URL (text input)
- **Timeline**:
  - Due Date (date picker)
- **Relationships** (using EntitySearchPicker):
  - Related Skills (searchable multi-select)
  - Related Projects (searchable multi-select)
  - Related Experiments (searchable multi-select)
  - Related Contributions (searchable multi-select)
  - Related Community Interactions (searchable multi-select)
  - Related Datasets (searchable multi-select)
- **Additional**:
  - Notes (textarea)

**Data Handling:**
- Relationship fields stored as arrays of ObjectIds
- Evidence level stored as nested object with level, evidence, url, dateAchieved
- Timeline gates auto-initialized with L1 gate on creation
- Due dates formatted for display (e.g., "9/26/2026")

### Projects Page (`/gsoc/projects`)
Manages ML/AI projects with quality checklists.

**Page Layout:**
- **Header**: Page title with "Add Project" button
- **Filter Bar**: Category filter tabs (ALL, MACHINE_LEARNING, DEEP_LEARNING, NLP, LLM, etc.) with count badges
- **Projects Grid**: Card-based display of all projects

**Project Card Display:**
- Project name and domain badge
- Problem statement preview
- Status badge (IDEA, RESEARCH, DEVELOPMENT, TESTING, COMPLETED, DEPLOYED, ARCHIVED)
- Complexity badge (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- Quality checklist progress bar (percentage)
- Current timeline gate
- Start date, end date, due date (with overdue highlighting)
- Repository link (if provided)
- Action buttons: Update, Delete

**Add/Edit Form (Modal):**
- **Basic Info**:
  - Name (text input, required)
  - Problem Statement (textarea)
  - Domain (dropdown: MACHINE_LEARNING, DEEP_LEARNING, NLP, LLM, etc.)
  - Complexity (dropdown: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- **Tech Stack**:
  - Dataset (text input)
  - Model (text input)
  - Framework (text input)
- **Links**:
  - Repository URL (text input)
  - Demo URL (text input)
  - Hugging Face URL (text input)
  - Kaggle URL (text input)
- **Timeline**:
  - Status (dropdown)
  - Start Date (date picker)
  - End Date (date picker)
  - Due Date (date picker)
- **Relationships** (using EntitySearchPicker):
  - Related Skills, Projects, Experiments, Contributions, Community, Datasets
- **Additional**:
  - Notes (textarea)

**Quality Checklist** (auto-initialized on creation):
- clearProblemStatement
- datasetDocumented
- baselineImplemented
- modelImplemented
- evaluationMetrics
- experimentComparison
- errorAnalysis
- reproducibleEnvironment
- tests
- readme
- resultsDocumented
- githubRepository
- demo

### Experiments Page (`/gsoc/experiments`)
Manages ML experiments with detailed metrics.

**Page Layout:**
- **Header**: Page title with "Add Experiment" button
- **Filter Bar**: Status filter tabs (ALL, PLANNED, RUNNING, COMPLETED, FAILED) with count badges
- **Experiments Grid**: Card-based display of all experiments

**Experiment Card Display:**
- Experiment ID
- Hypothesis preview
- Project link (if associated)
- Model and dataset
- Status badge (PLANNED, RUNNING, COMPLETED, FAILED)
- Evidence level badge
- Current timeline gate
- Start date, end date, due date (with overdue highlighting)
- Git commit link (if provided)
- Notebook link (if provided)
- Action buttons: Update, Delete

**Add/Edit Form (Modal):**
- **Basic Info**:
  - Experiment ID (text input)
  - Project (dropdown of existing projects)
  - Hypothesis (textarea)
  - Dataset (text input)
  - Model (text input)
- **Configuration**:
  - Parameters (JSON textarea)
- **Training**:
  - Epochs (number input)
  - Batch Size (number input)
  - Learning Rate (number input)
  - Optimizer (text input)
  - Loss Function (text input)
- **Evaluation**:
  - Metrics (JSON textarea)
  - Validation Score (number input)
  - Test Score (number input)
- **Results**:
  - Results (textarea)
  - Comparison (textarea)
  - Failure Analysis (textarea)
  - Conclusion (textarea)
- **Links**:
  - Git Commit (text input)
  - Notebook URL (text input)
- **Timeline**:
  - Status (dropdown)
  - Start Date (date picker)
  - End Date (date picker)
  - Due Date (date picker)
- **Relationships** (using EntitySearchPicker):
  - Related Skills, Projects, Experiments, Contributions, Community, Datasets
- **Additional**:
  - Notes (textarea)

### Community Page (`/gsoc/community`)
Manages community interactions and discussions.

**Page Layout:**
- **Header**: Page title with "Add Interaction" button
- **Filter Bar**: Platform filter tabs (ALL, GITHUB, DISCORD, SLACK, MAILING_LIST, FORUM, COMMUNITY_MEETING, ISSUE_DISCUSSION, OTHER) with count badges
- **Interactions Grid**: Card-based display of all interactions

**Interaction Card Display:**
- Topic
- Platform badge
- Organization (if specified)
- Person/Role
- Date and due date (with overdue highlighting)
- Question preview
- Response preview
- Outcome preview
- Evidence level badge
- Discussion URL link (if provided)
- Action buttons: Update, Delete

**Add/Edit Form (Modal):**
- **Basic Info**:
  - Organization (text input)
  - Platform (dropdown: GITHUB, DISCORD, SLACK, etc.)
  - Date (date picker)
  - Due Date (date picker)
  - Person or Role (text input)
  - Topic (text input, required)
- **Discussion**:
  - Question (textarea)
  - Response (textarea)
  - Outcome (textarea)
- **Links**:
  - Discussion URL (text input)
- **Relationships** (using EntitySearchPicker):
  - Related Skills, Projects, Experiments, Contributions, Community, Datasets
- **Additional**:
  - Notes (textarea)

### Datasets Page (`/gsoc/datasets`)
Manages datasets with quality checklists.

**Page Layout:**
- **Header**: Page title with "Add Dataset" button
- **Filter Bar**: Domain filter tabs (ALL, COMPUTER_VISION, NLP, TABULAR, AUDIO, VIDEO, TIME_SERIES, GRAPH, OTHER) with count badges
- **Datasets Grid**: Card-based display of all datasets

**Dataset Card Display:**
- Dataset name
- Domain badge
- Description preview
- Status badge (DISCOVERED, DOWNLOADED, EXPLORED, CLEANED, PREPROCESSED, VALIDATED, READY)
- Quality checklist progress bar
- Size information (samples, features, sizeMB)
- Due date (with overdue highlighting)
- Source URL link (if provided)
- Hugging Face link (if provided)
- Kaggle link (if provided)
- Action buttons: Update, Delete

**Add/Edit Form (Modal):**
- **Basic Info**:
  - Name (text input, required)
  - Description (textarea)
  - Domain (dropdown: COMPUTER_VISION, NLP, TABULAR, etc.)
  - Source (text input)
- **Links**:
  - Source URL (text input)
  - Hugging Face URL (text input)
  - Kaggle URL (text input)
- **Size**:
  - Samples (number input)
  - Features (number input)
  - Size MB (number input)
- **Details**:
  - Format (text input)
  - License (text input)
  - Tasks (comma-separated text input)
  - Documentation (textarea)
  - Preprocessing (textarea)
- **Timeline**:
  - Status (dropdown)
  - Due Date (date picker)
- **Relationships** (using EntitySearchPicker):
  - Related Skills, Projects, Experiments, Contributions, Community, Datasets
- **Additional**:
  - Notes (textarea)

**Quality Checklist** (auto-initialized on creation):
- documented
- downloaded
- explored
- cleaned
- preprocessed
- validated
- ready

### Contributions Page (`/gsoc/contributions`)
Manages open source contributions.

**Page Layout:**
- **Header**: Page title with "Add Contribution" button
- **Filter Bar**: Status filter tabs (ALL, INVESTIGATING, DISCUSSING, WORKING, PR_OPEN, CHANGES_REQUESTED, APPROVED, MERGED, CLOSED) with count badges
- **Contributions Grid**: Card-based display of all contributions

**Contribution Card Display:**
- Title
- Organization and repository
- Type badge (BUG_FIX, FEATURE, DOCUMENTATION, REFACTORING, TEST, OTHER)
- Status badge
- Review status badge (PENDING, APPROVED, REJECTED, NO_REVIEW)
- Result badge (SUCCESS, PARTIAL, FAILED, ABANDONED)
- Date and deadline (with overdue highlighting)
- Evidence level badge
- PR URL link (if provided)
- Commit URL link (if provided)
- What I Learned preview
- Action buttons: Update, Delete

**Add/Edit Form (Modal):**
- **Basic Info**:
  - Organization (text input)
  - Repository (text input)
  - Type (dropdown: BUG_FIX, FEATURE, etc.)
  - Title (text input, required)
  - Description (textarea)
- **Timeline**:
  - Date (date picker)
  - Deadline (date picker)
  - Status (dropdown)
  - Review Status (dropdown)
  - Result (dropdown)
- **Links**:
  - PR URL (text input)
  - Commit URL (text input)
- **Learning**:
  - What I Learned (textarea)
- **Relationships** (using EntitySearchPicker):
  - Related Skills, Projects, Experiments, Contributions, Community, Datasets
- **Additional**:
  - Notes (textarea)

### Timeline Page (`/gsoc/timeline`)
Displays chronological evidence timeline.

**Features:**
- Timeline view of all activities
- Chronological ordering
- Evidence level visualization
- Gate progress tracking

### Evidence Matrix Page (`/gsoc/evidence-matrix`)
Displays evidence matrix across all entities.

**Features:**
- Matrix view of evidence levels
- Cross-entity evidence tracking
- Progress visualization

### Submission Readiness Page (`/gsoc/submission-readiness`)
"Would I Submit This Today?" analysis.

**Features:**
- Readiness score calculation
- Evidence level assessment
- Gap identification
- Recommendations

## API Routes

### Skills API
- `GET /api/gsoc/skills` - List all skills
  - Query parameter: `?search=<query>` - Search skills by name and category (case-insensitive)
  - Returns: Array of skill objects with all fields
  - Sorting: By priority (P0-P3), then by name
- `GET /api/gsoc/skills/:id` - Get single skill by ID
- `POST /api/gsoc/skills` - Create new skill
  - Auto-initializes timeline gates with L1 gate
  - Body: Full skill object (all fields except _id, timestamps)
- `PUT /api/gsoc/skills/:id` - Update skill
  - Body: Partial or full skill object
- `DELETE /api/gsoc/skills/:id` - Delete skill

### Projects API
- `GET /api/gsoc/projects` - List all projects
  - Query parameter: `?search=<query>` - Search projects by name, problem, domain (case-insensitive)
  - Returns: Array of project objects with populated relatedSkills and experiments
  - Sorting: By status, then by name
- `GET /api/gsoc/projects/:id` - Get single project by ID
- `POST /api/gsoc/projects` - Create new project
  - Auto-initializes timeline gates with L1 gate
  - Auto-initializes quality checklist with all items set to false
  - Body: Full project object
- `PUT /api/gsoc/projects/:id` - Update project
  - Body: Partial or full project object
- `DELETE /api/gsoc/projects/:id` - Delete project

### Experiments API
- `GET /api/gsoc/experiments` - List all experiments
  - Query parameter: `?search=<query>` - Search experiments by experimentId, hypothesis, model (case-insensitive)
  - Returns: Array of experiment objects with populated project and relatedSkills
  - Sorting: By createdAt (newest first)
- `GET /api/gsoc/experiments/:id` - Get single experiment by ID
- `POST /api/gsoc/experiments` - Create new experiment
  - Body: Full experiment object
- `PUT /api/gsoc/experiments/:id` - Update experiment
  - Body: Partial or full experiment object
- `DELETE /api/gsoc/experiments/:id` - Delete experiment

### Community API
- `GET /api/gsoc/community` - List all interactions
  - Query parameter: `?search=<query>` - Search interactions by topic and platform (case-insensitive)
  - Returns: Array of interaction objects with populated organization, relatedProject, relatedProjectIdea
  - Sorting: By date (newest first)
- `GET /api/gsoc/community/:id` - Get single interaction by ID
- `POST /api/gsoc/community` - Create new interaction
  - Body: Full interaction object
- `PUT /api/gsoc/community/:id` - Update interaction
  - Body: Partial or full interaction object
- `DELETE /api/gsoc/community/:id` - Delete interaction

### Datasets API
- `GET /api/gsoc/datasets` - List all datasets
  - Query parameter: `?search=<query>` - Search datasets by name, description, domain (case-insensitive)
  - Returns: Array of dataset objects with populated relatedProjects and relatedExperiments
  - Sorting: By createdAt (newest first)
- `GET /api/gsoc/datasets/:id` - Get single dataset by ID
- `POST /api/gsoc/datasets` - Create new dataset
  - Auto-initializes quality checklist with all items set to false
  - Body: Full dataset object
- `PUT /api/gsoc/datasets/:id` - Update dataset
  - Body: Partial or full dataset object
- `DELETE /api/gsoc/datasets/:id` - Delete dataset

### Contributions API
- `GET /api/gsoc/contributions` - List all contributions
  - Returns: Array of contribution objects
  - Sorting: By date (newest first)
- `GET /api/gsoc/contributions/:id` - Get single contribution by ID
- `POST /api/gsoc/contributions` - Create new contribution
  - Body: Full contribution object
- `PUT /api/gsoc/contributions/:id` - Update contribution
  - Body: Partial or full contribution object
- `DELETE /api/gsoc/contributions/:id` - Delete contribution

## Features

### 1. Evidence-Based Tracking
- **Evidence Levels**: NONE, WEAK, BASIC, GOOD, STRONG, EXCELLENT
- **Evidence Documentation**: URL and description for each evidence level
- **Date Tracking**: When evidence was achieved
- **Quality Checklists**: Ensure completeness of work

### 2. Timeline Gates
- **5 Gates**: L1 through L5 representing progress stages
- **Gate Status**: NOT_STARTED, IN_PROGRESS, COMPLETED, BLOCKED
- **Gate Criteria**: Custom criteria for each gate
- **Target Dates**: Set target dates for gate completion
- **Progress Visualization**: Visual progress tracking

### 3. Relationship System
- **Full Interconnectivity**: Any entity can link to any other entity type
- **Bidirectional Links**: Support for bidirectional relationships
- **Searchable Dropdowns**: EntitySearchPicker component for intuitive entity selection
- **Real-time Search**: Type-ahead search with 300ms debounce
- **Visual Feedback**: Entity type badges and evidence level indicators
- **Knowledge Graph**: Complete graph of learning connections
- **Traceability**: Track how skills relate to projects, experiments, etc.
- **Text Indexes**: Mongoose text indexes on key fields for efficient search

### 4. Deadline Management
- **Due Date Fields**: All entities support due date tracking
- **Date Picker Inputs**: Easy date selection in forms
- **Overdue Highlighting**: Red highlighting for past-due items
- **Formatted Display**: Locale-specific date formatting
- **Consistent Implementation**: Same pattern across all entities

### 5. Quality Checklists
- **Project Quality**: 12-item checklist for projects
- **Dataset Quality**: 7-item checklist for datasets
- **Progress Tracking**: Visual progress bars
- **Completion Percentage**: Percentage-based progress display

### 6. Filtering and Categorization
- **Category Filters**: Filter by category/domain
- **Status Filters**: Filter by status
- **Priority Filters**: Filter by priority
- **Count Display**: Show counts per category

### 7. Mobile Support
- **Capacitor Integration**: Build Android APK
- **Responsive Design**: Mobile-friendly UI
- **Touch Optimization**: Touch-friendly interactions

## Setup and Deployment

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd OPS
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
MONGODB_URI=mongodb://localhost:27017/ops
# or MongoDB Atlas connection string
```

4. **Run the development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
npm start
```

### Android APK Build

1. **Install dependencies**
```bash
cd android
./gradlew assembleDebug
```

2. **Or use the provided script**
```bash
# On Windows
.\scripts\build-apk.ps1

# On Linux/Mac
./scripts/build-apk.sh
```

### Deployment

**Vercel Deployment:**
```bash
npm install -g vercel
vercel
```

**Docker Deployment:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Usage Guide

### Adding a Skill

1. Navigate to `/gsoc/skills`
2. Click "Add Skill"
3. Fill in the form:
   - Skill name (e.g., "PyTorch")
   - Category (e.g., "ML_FRAMEWORK")
   - Evidence level and description
   - Evidence URL (GitHub, blog post, etc.)
   - Priority (P0-P3)
   - Target level
   - Due date (optional)
   - Related entity IDs (comma-separated)
   - Notes
4. Click "Add Skill"

### Creating a Project

1. Navigate to `/gsoc/projects`
2. Click "Add Project"
3. Fill in the form:
   - Project name and problem statement
   - Domain and complexity
   - Model, framework, dataset
   - Repository and demo URLs
   - Start, end, and due dates
   - Related entity IDs
   - Notes
4. Click "Add Project"

### Running an Experiment

1. Navigate to `/gsoc/experiments`
2. Click "Add Experiment"
3. Fill in the form:
   - Experiment ID and hypothesis
   - Dataset and model
   - Parameters (JSON format)
   - Training configuration
   - Evaluation metrics
   - Results and conclusion
   - Git commit and notebook URLs
   - Start, end, and due dates
   - Related entity IDs
4. Click "Add Experiment"

### Tracking Community Interactions

1. Navigate to `/gsoc/community`
2. Click "Add Interaction"
3. Fill in the form:
   - Organization and platform
   - Date and due date
   - Person/role
   - Topic and question
   - Response and outcome
   - Discussion URL
   - Related entity IDs
4. Click "Add Interaction"

### Managing Datasets

1. Navigate to `/gsoc/datasets`
2. Click "Add Dataset"
3. Fill in the form:
   - Name and description
   - Domain and source
   - URLs (source, Hugging Face, Kaggle)
   - Size information
   - Format and license
   - Tasks (comma-separated)
   - Documentation and preprocessing
   - Status and due date
   - Related entity IDs
4. Click "Add Dataset"

### Logging Contributions

1. Navigate to `/gsoc/contributions`
2. Click "Add Contribution"
3. Fill in the form:
   - Organization and repository
   - Type and title
   - Description
   - Date and deadline
   - Status and result
   - PR and commit URLs
   - What you learned
   - Related entity IDs
4. Click "Add Contribution"

### Linking Entities

To link entities together:

1. Find the ID of the entity you want to link to:
   - Navigate to the entity's page
   - Click "Update" on the entity
   - The ID is in the URL or can be found in the database
2. When creating/editing another entity, enter the ID in the relationship field
3. Multiple IDs can be entered as comma-separated values
4. Example: `skill_id_1, skill_id_2, project_id_1`

### Managing Timeline Gates

1. Each entity has 5 timeline gates (L1-L5)
2. Gates track progress through defined stages
3. Set target dates for each gate
4. Update gate status as you progress
5. View current gate on entity cards

### Using Quality Checklists

1. Projects and datasets have quality checklists
2. Each checklist item can be marked as complete
3. Progress is shown as a percentage
4. Visual progress bar indicates completion
5. Checklist items are reset when creating new entities

## Best Practices

### Evidence Tracking
- Always provide evidence URLs when claiming a skill level
- Document what was learned in the evidence description
- Update evidence levels as you progress
- Keep evidence up-to-date with latest work

### Project Management
- Start with clear problem statements
- Set realistic milestones and due dates
- Track quality checklist items as you complete them
- Link projects to related skills and experiments

### Experiment Tracking
- Document hypotheses clearly
- Record all parameters and configurations
- Track both success and failure
- Document what you learned from each experiment
- Link experiments to datasets and projects

### Community Engagement
- Document all meaningful interactions
- Follow up on discussions with due dates
- Record what you learned from each interaction
- Link interactions to skills and projects

### Relationship Management
- Link entities as you create them
- Use relationships to show learning connections
- Keep relationships up-to-date
- Use relationships to trace learning paths

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check MONGODB_URI in .env.local
- Verify network connectivity

**Form Not Saving**
- Check browser console for errors
- Verify all required fields are filled
- Check API route is accessible

**Relationships Not Working**
- Ensure IDs are valid MongoDB ObjectIds
- Check that referenced entities exist
- Verify comma-separated format

**Due Date Not Displaying**
- Ensure date is in correct format (YYYY-MM-DD)
- Check browser console for errors
- Verify dueDate field is saved in database

## Future Enhancements

### Planned Features
- Visual relationship graph visualization
- Smart dropdowns for relationship selection
- Reverse relationship display
- Relationship types (depends on, builds on, uses)
- Bulk import/export of data
- Relationship analytics and learning path analysis
- Mobile app improvements
- Offline support
- Real-time collaboration
- Advanced reporting and analytics

### Technical Improvements
- TypeScript migration
- Component library adoption
- Automated testing
- CI/CD pipeline
- Performance optimization
- Accessibility improvements
- Internationalization (i18n)

## Support and Contributing

For issues, questions, or contributions:
- Check documentation first
- Review existing issues
- Create detailed bug reports
- Submit pull requests with clear descriptions

## License

[Add your license information here]

## Version History

- **v1.0** - Initial release with basic tracking
- **v1.1** - Added timeline gates and quality checklists
- **v1.2** - Added relationship system for full interconnectivity
- **v1.3** - Added due date tracking with overdue highlighting
- **v1.4** - Enhanced mobile support with Capacitor

---

This documentation covers the entire OPS system. For specific feature documentation, see the individual feature documentation files in the docs directory.
