import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import GSoCSkill from '@/models/GSoCSkill';
import GSoCProject from '@/models/GSoCProject';
import GSoCContribution from '@/models/GSoCContribution';
import GSoCOrganization from '@/models/GSoCOrganization';
import GSoCCommunityInteraction from '@/models/GSoCCommunityInteraction';
import GSoCExperiment from '@/models/GSoCExperiment';
import GSoCEvidenceRequirement from '@/models/GSoCEvidenceRequirement';

// Evidence requirement rules
const EVIDENCE_RULES = {
  python: {
    name: 'Python',
    strongEvidence: (data) => {
      const pythonSkill = data.skills.find(s => s.name.toLowerCase().includes('python'));
      return pythonSkill && 
             (pythonSkill.evidenceLevel?.level === 'STRONG' || pythonSkill.evidenceLevel?.level === 'EXCELLENT');
    },
    missingMessage: 'You have learning evidence but no substantial public Python project with tests and documentation.',
    suggestedAction: 'Create a substantial Python project with unit tests, documentation, and publish to GitHub.',
    priority: 'HIGH'
  },
  pytorch: {
    name: 'PyTorch',
    strongEvidence: (data) => {
      const pytorchSkill = data.skills.find(s => s.name.toLowerCase().includes('pytorch'));
      const pytorchProject = data.projects.find(p => 
        p.framework?.toLowerCase().includes('pytorch') && 
        p.status === 'COMPLETED'
      );
      return (pytorchSkill && pytorchSkill.evidenceLevel?.level === 'STRONG') || pytorchProject;
    },
    missingMessage: 'You have learning evidence but no substantial PyTorch project.',
    suggestedAction: 'Build and complete a PyTorch project with training, evaluation, and public repository.',
    priority: 'HIGH'
  },
  ml: {
    name: 'Machine Learning',
    strongEvidence: (data) => {
      const mlSkill = data.skills.find(s => s.category === 'ML_FRAMEWORK' || s.name.toLowerCase().includes('machine learning'));
      const mlProjects = data.projects.filter(p => 
        ['MACHINE_LEARNING', 'DEEP_LEARNING', 'NLP', 'COMPUTER_VISION'].includes(p.domain) &&
        p.status === 'COMPLETED'
      );
      return (mlSkill && mlSkill.evidenceLevel?.level === 'STRONG') && mlProjects.length >= 2;
    },
    missingMessage: 'You need at least 2 completed ML projects with strong evidence.',
    suggestedAction: 'Complete 2 substantial ML projects with evaluation metrics and documentation.',
    priority: 'HIGH'
  },
  opensource: {
    name: 'Open Source Contributions',
    strongEvidence: (data) => {
      const mergedPRs = data.contributions.filter(c => c.status === 'MERGED');
      return mergedPRs.length >= 2;
    },
    missingMessage: 'You have researched organizations but have no merged contributions.',
    suggestedAction: 'Investigate beginner issues and submit at least 2 pull requests that get merged.',
    priority: 'HIGH'
  },
  organization: {
    name: 'Organization Community Interaction',
    strongEvidence: (data) => {
      const interactions = data.communityInteractions.filter(i => 
        i.organization && i.platform !== 'GITHUB'
      );
      return interactions.length >= 3;
    },
    missingMessage: 'You have not participated in community discussions outside of GitHub.',
    suggestedAction: 'Join Discord/Slack and participate in at least 3 meaningful community discussions.',
    priority: 'HIGH'
  },
  experiments: {
    name: 'ML Experiments',
    strongEvidence: (data) => {
      const completedExperiments = data.experiments.filter(e => e.status === 'COMPLETED');
      return completedExperiments.length >= 5;
    },
    missingMessage: 'You need more documented experiments to show reproducible research.',
    suggestedAction: 'Document at least 5 experiments with hypotheses, configurations, and conclusions.',
    priority: 'MEDIUM'
  },
  github: {
    name: 'Public GitHub Presence',
    strongEvidence: (data) => {
      const publicProjects = data.projects.filter(p => p.repository && p.status === 'COMPLETED');
      return publicProjects.length >= 3;
    },
    missingMessage: 'You need more public GitHub repositories showing your work.',
    suggestedAction: 'Publish at least 3 completed projects to GitHub with proper documentation.',
    priority: 'MEDIUM'
  },
  documentation: {
    name: 'Documentation Skills',
    strongEvidence: (data) => {
      const docContributions = data.contributions.filter(c => c.contributionType === 'DOCUMENTATION');
      const documentedProjects = data.projects.filter(p => p.qualityChecklist?.readme);
      return docContributions.length >= 1 || documentedProjects.length >= 2;
    },
    missingMessage: 'You lack evidence of documentation skills.',
    suggestedAction: 'Contribute to documentation or ensure your projects have comprehensive READMEs.',
    priority: 'MEDIUM'
  },
  testing: {
    name: 'Testing Skills',
    strongEvidence: (data) => {
      const testContributions = data.contributions.filter(c => c.contributionType === 'TESTING');
      const testedProjects = data.projects.filter(p => p.qualityChecklist?.tests);
      return testContributions.length >= 1 || testedProjects.length >= 2;
    },
    missingMessage: 'You lack evidence of testing skills.',
    suggestedAction: 'Add unit tests to your projects or contribute to testing in open source.',
    priority: 'MEDIUM'
  },
  proposal: {
    name: 'Proposal Draft',
    strongEvidence: (data) => {
      // Check if proposal sections are being tracked
      const proposalEvidence = data.evidenceRequirements['problem_understanding'] || 
                             data.evidenceRequirements['technical_approach'] ||
                             data.evidenceRequirements['deliverables'] ||
                             data.evidenceRequirements['timeline'];
      return proposalEvidence && proposalEvidence.level !== 'NONE';
    },
    missingMessage: 'Your proposal sections are incomplete or missing.',
    suggestedAction: 'Draft and refine proposal sections: problem, approach, deliverables, timeline.',
    priority: 'HIGH'
  }
};

export async function GET() {
  try {
    await clientPromise();

    // Fetch all relevant data
    const [skills, projects, contributions, organizations, communityInteractions, experiments, evidenceRequirements] = await Promise.all([
      GSoCSkill.find({}),
      GSoCProject.find({}),
      GSoCContribution.find({}),
      GSoCOrganization.find({}),
      GSoCCommunityInteraction.find({}),
      GSoCExperiment.find({}),
      GSoCEvidenceRequirement.find({})
    ]);

    // Convert evidence requirements to map
    const evidenceMap = {};
    evidenceRequirements.forEach(e => {
      evidenceMap[e.requirementId] = e;
    });

    const data = {
      skills,
      projects,
      contributions,
      organizations,
      communityInteractions,
      experiments,
      evidenceRequirements: evidenceMap
    };

    // Analyze missing evidence
    const missingEvidence = [];

    for (const [key, rule] of Object.entries(EVIDENCE_RULES)) {
      if (!rule.strongEvidence(data)) {
        missingEvidence.push({
          category: rule.name,
          description: rule.missingMessage,
          action: rule.suggestedAction,
          priority: rule.priority,
          requirementId: key
        });
      }
    }

    // Sort by priority (HIGH first)
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    missingEvidence.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Calculate overall readiness stats
    const stats = {
      totalRules: Object.keys(EVIDENCE_RULES).length,
      satisfiedRules: Object.keys(EVIDENCE_RULES).filter(key => 
        EVIDENCE_RULES[key].strongEvidence(data)
      ).length,
      skillsCount: skills.length,
      strongSkills: skills.filter(s => 
        s.evidenceLevel?.level === 'STRONG' || s.evidenceLevel?.level === 'EXCELLENT'
      ).length,
      projectsCount: projects.length,
      completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
      contributionsCount: contributions.length,
      mergedPRs: contributions.filter(c => c.status === 'MERGED').length,
      organizationsCount: organizations.length,
      communityInteractionsCount: communityInteractions.length,
      experimentsCount: experiments.length,
      completedExperiments: experiments.filter(e => e.status === 'COMPLETED').length
    };

    return NextResponse.json({ 
      success: true, 
      data: {
        missingEvidence,
        stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Missing evidence analysis error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
